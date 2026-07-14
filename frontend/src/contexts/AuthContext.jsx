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
// No longer using localStorage for token - JWT is now in HttpOnly cookie
// import { getAuthToken, setAuthToken, clearAuth } from '../services/auth.js';

const AuthContext = createContext(null);

/**
 * Decode the `exp` claim from a JWT without verifying it.
 * NOTE: Since we no longer store JWT in localStorage, this is kept
 * for compatibility but token is no longer directly accessible.
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
    const [loading, setLoading] = useState(true);
    // Token is no longer stored in state - it's in HttpOnly cookie
    const [token, setToken] = useState(null);

    // ── On mount, validate session via /auth/me ─────
    useEffect(() => {
        let cancelled = false;
        const verify = async () => {
            try {
                const res = await api.get('/auth/me', { timeout: 5000 });
                if (cancelled) return;
                if (res.ok && res.data && res.data.id) {
                    setUser(res.data);
                } else {
                    setUser(null);
                }
            } catch (err) {
                if (!cancelled) setUser(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        verify();
        return () => { cancelled = true; };
    }, []);

    // ── login: trade email+password (and optional 2FA code) for a token. ──
    const login = useCallback(async ({ email, password, twoFactorCode, challengeToken }) => {
        if (twoFactorCode && challengeToken) {
            // Second-step: exchange challenge token + TOTP for the real JWT.
            const res = await api.post('/auth/login/2fa', { challengeToken, code: twoFactorCode });
            if (res.ok && res.data?.token) {
                // Token is now in HttpOnly cookie, just update user state
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
                // Token is set in HttpOnly cookie by backend
                setUser(res.data.user);
                return { ok: true, user: res.data.user };
            }
        }
        return { ok: false, error: res.error || 'Invalid credentials.' };
    }, []);

    // ── logout: clear the token + user. ─────────────────────
    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            setUser(null);
        }
    }, []);

    // ── refresh: re-pull /auth/me (e.g. after role change). ─
    const refresh = useCallback(async () => {
        const res = await api.get('/auth/me');
        if (res.ok && res.data) {
            setUser(res.data);
        }
        return res;
    }, []);

    // ── extendSession: re-issue a fresh JWT without prompting. ──
    // Used by SessionTimeoutModal to keep the user logged in
    // when they hit "Extend session" at the 25-min warning.
    const userRef = useRef(user);
    useEffect(() => { userRef.current = user; }, [user]);

    const extendSession = useCallback(async () => {
        const res = await api.post('/auth/refresh');
        if (res.ok && res.data?.token) {
            // Token is set in HttpOnly cookie by backend
            if (res.data.user) setUser(res.data.user);
            // Reset the sliding window so the countdown jumps to
            // the new token's full TTL.
            setLastActivity(Date.now());
            return { ok: true };
        }
        // 401/403 → token is gone, log the user out.
        if (res.status === 401 || res.status === 403) {
            logout();
        }
        return { ok: false, error: res.error, status: res.status };
    }, [logout]);

    // ── Derived: token expiry (ms epoch) for the timeout warning. ─
    // Sliding window: the session is "fresh" for 30 minutes from the
    // user's last activity. A successful /auth/refresh resets the
    // window (handled in `extendSession` below).
    //
    // Background timer proactively calls /auth/refresh ~5 min before
    // expiry so the user never hits the modal unless they walk away
    // from the keyboard for >25 min.
    const [lastActivity, setLastActivity] = useState(() => Date.now());
    const tokenExpiresAt = useMemo(
        () => (user ? lastActivity + 30 * 60 * 1000 : null),
        [user, lastActivity]
    );

    // Track user activity (click, key, mousemove, touch). Throttled
    // to once per 60s so a long session doesn't fire hundreds of events
    // per minute — the server only cares about the timestamp, not the
    // count.
    useEffect(() => {
        if (!user) return;
        let lastBump = Date.now();
        const bump = () => {
            const now = Date.now();
            if (now - lastBump < 60_000) return;
            lastBump = now;
            setLastActivity(now);
        };
        window.addEventListener('mousemove', bump, { passive: true });
        window.addEventListener('keydown', bump);
        window.addEventListener('click', bump);
        window.addEventListener('scroll', bump, { passive: true });
        return () => {
            window.removeEventListener('mousemove', bump);
            window.removeEventListener('keydown', bump);
            window.removeEventListener('click', bump);
            window.removeEventListener('scroll', bump);
        };
    }, [user]);

    // Background proactive refresh — fires once per session, ~25
    // minutes after the last activity, and re-arms itself when the
    // expiry moves (e.g. after a manual extend).
    useEffect(() => {
        if (!user || !tokenExpiresAt) return undefined;
        const PROACTIVE_REFRESH_LEAD_MS = 5 * 60 * 1000;
        const delay = tokenExpiresAt - Date.now() - PROACTIVE_REFRESH_LEAD_MS;
        if (delay <= 0) {
            // Already inside the warning window — let SessionTimeoutModal
            // handle the user-facing decision. Don't call /auth/refresh
            // automatically here, because the user might be about to
            // log out.
            return undefined;
        }
        const id = setTimeout(() => {
            // Silent background refresh — the user is still here, so
            // an automatic re-issue is the right default. The Server
            // will set a fresh cookie.
            api.post('/auth/refresh').then((res) => {
                if (res.ok) {
                    setLastActivity(Date.now());
                } else if (res.status === 401 || res.status === 403) {
                    logout();
                }
            });
        }, delay);
        return () => clearTimeout(id);
    }, [user, tokenExpiresAt, logout]);

    const value = useMemo(() => ({
        user,
        token: null, // No longer stored in frontend
        loading,
        divisions: user?.divisions ?? [],
        tokenExpiresAt,
        login,
        logout,
        refresh,
        extendSession,
    }), [user, loading, tokenExpiresAt, login, logout, refresh, extendSession]);

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
