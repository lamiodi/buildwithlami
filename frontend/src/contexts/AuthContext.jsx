// ─── contexts/AuthContext.jsx ────────────────────────────
// React context that owns the authenticated admin's identity.
// Wraps the raw `services/auth.js` localStorage helpers and
// exposes them as a `useAuth()` hook so individual pages
// don't have to thread props.
//
// What lives in here:
//   - the current user (id, email, role)
//   - a `loading` flag for the initial /auth/me probe
//   - login() / logout() that call the API and persist the token
//   - refresh() to re-pull the user (e.g. after 2FA setup)
//
// What does NOT live in here:
//   - the session-timeout warning modal (separate component)
//   - the actual API client (uses services/api.js)
//
// Phase 1 deliverable per ROADMAP.md: "Send role + division
// with the user object. Redirect non-Owner users from sensitive
// admin pages." The division list is derived from the role here
// — see ROLE_DIVISIONS — and `<AuthGuard>` provides the redirect.
// ──────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../services/api.js';
import { getAuthToken, setAuthToken, clearAuth } from '../services/auth.js';

const AuthContext = createContext(null);

/**
 * Decode the `exp` claim from a JWT without verifying it.
 */
function decodeTokenExp(token) {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        return typeof payload.exp === 'number' ? payload.exp : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => getAuthToken());
    const [loading, setLoading] = useState(!!getAuthToken());

    // ── On mount (or when token changes), validate it. ─────
    useEffect(() => {
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        const verify = async () => {
            const res = await api.get('/auth/me', { timeout: 5000 });
            if (cancelled) return;
            if (res.ok && res.data && res.data.id) {
                setUser(res.data);
            } else {
                clearAuth();
                setUser(null);
                setToken(null);
            }
            setLoading(false);
        };
        verify();
        return () => { cancelled = true; };
    }, [token]);

    // ── login: trade email+password (and optional 2FA code) for a token. ──
    const login = useCallback(async ({ email, password, twoFactorCode, challengeToken }) => {
        if (twoFactorCode && challengeToken) {
            // Second-step: exchange challenge token + TOTP for the real JWT.
            const res = await api.post('/auth/login/2fa', { challengeToken, code: twoFactorCode });
            if (res.ok && res.data?.token) {
                setAuthToken(res.data.token, res.data.user);
                setToken(res.data.token);
                setUser(res.data.user);
                return { ok: true, user: res.data.user };
            }
            return { ok: false, error: res.error || 'Invalid 2FA code.' };
        }

        // First-step: email + password.
        const res = await api.post('/auth/login', { email, password });
        if (res.ok && res.data) {
            if (res.data.requires2fa) {
                // Return a marker so the LoginPage knows to render
                // the TOTP challenge step.
                return { ok: true, requires2fa: true, challengeToken: res.data.challengeToken, user: res.data.user };
            }
            if (res.data.token) {
                setAuthToken(res.data.token, res.data.user);
                setToken(res.data.token);
                setUser(res.data.user);
                return { ok: true, user: res.data.user };
            }
        }
        return { ok: false, error: res.error || 'Invalid credentials.' };
    }, []);

    // ── logout: clear the token + user. ─────────────────────
    const logout = useCallback(() => {
        clearAuth();
        setUser(null);
        setToken(null);
    }, []);

    // ── refresh: re-pull /auth/me (e.g. after role change). ─
    const refresh = useCallback(async () => {
        const res = await api.get('/auth/me');
        if (res.ok && res.data) {
            setAuthToken(res.data.token || getAuthToken(), res.data);
            setUser(res.data);
        }
        return res;
    }, []);

    // ── extendSession: re-issue a fresh JWT without prompting. ──
    // Used by SessionTimeoutModal to keep the user logged in
    // when they hit "Extend session" at the 25-min warning.
    //
    // The `user` dep would normally cause this callback's
    // identity to change on every user update, which would
    // re-fire downstream effects. We hold the latest user in a
    // ref so the function stays stable; only its body reads
    // the freshest value at call time.
    const userRef = useRef(user);
    useEffect(() => { userRef.current = user; }, [user]);

    const extendSession = useCallback(async () => {
        const res = await api.post('/auth/refresh');
        if (res.ok && res.data?.token) {
            setAuthToken(res.data.token, res.data.user || userRef.current);
            setToken(res.data.token);
            if (res.data.user) setUser(res.data.user);
            return { ok: true };
        }
        // 401/403 → token is gone, log the user out.
        if (res.status === 401 || res.status === 403) {
            logout();
        }
        return { ok: false, error: res.error, status: res.status };
    }, [logout]);

    // ── Derived: token expiry (ms epoch) for the timeout warning. ─
    const tokenExpiresAt = useMemo(() => {
        const exp = decodeTokenExp(token);
        return exp ? exp * 1000 : null;
    }, [token]);

    // The `/auth/me` response includes `user.divisions` straight
    // from the backend's role table, so we just expose that. The
    // old `divisions` useMemo used a hard-coded mirror of the
    // backend table; using `user.divisions` as the single source
    // of truth removes that drift risk.
    const value = useMemo(() => ({
        user,
        token,
        loading,
        divisions: user?.divisions ?? [],
        tokenExpiresAt,
        login,
        logout,
        refresh,
        extendSession,
    }), [user, token, loading, tokenExpiresAt, login, logout, refresh, extendSession]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an <AuthProvider>');
    }
    return ctx;
}

/**
 * Lightweight guard for routes that should only be visible to
 * the Owner (e.g. the 2FA setup page itself, or the role editor).
 * Renders `children` when the current user is the Owner; otherwise
 * silently swaps to a "forbidden" stub so non-Owners don't see a
 * flash of admin-only UI.
 */
export function OwnerOnly({ children, fallback = null }) {
    const { user } = useAuth();
    if (!user) return fallback;
    if (user.role !== 'Owner' && user.role !== 'Administrator') return fallback;
    return children;
}
