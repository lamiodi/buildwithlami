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

// ── Token persistence (see docs/AUTH_MODEL.md) ────────────
// The auth flow uses BOTH:
//   1. An HttpOnly `access_token` cookie  (same-origin convenience)
//   2. A JS-readable `localStorage.admin_token`  (the authoritative
//      credential that the api client sends as `Authorization: Bearer …`)
// Persisting the token in localStorage is acceptable because:
//   - The HttpOnly cookie + SameSite=Strict already block CSRF.
//   - XSS would already be catastrophic on this SPA and is mitigated
//     by React + DOMPurify at the boundary.
const ADMIN_TOKEN_KEY = 'admin_token';

function readAdminToken() {
    try { return localStorage.getItem(ADMIN_TOKEN_KEY); } catch { return null; }
}
function writeAdminToken(token) {
    try {
        if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
        else localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch { /* storage unavailable — fall back to cookie-only auth */ }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // Token lives in localStorage (authoritative credential for the
    // Authorization header) and in the HttpOnly cookie (same-origin
    // convenience). Kept in state too so the hook can derive
    // `tokenExpiresAt` for the session-timeout warning modal.
    const [token, setToken] = useState(() => readAdminToken());

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
                writeAdminToken(res.data.token);
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
                writeAdminToken(res.data.token);
                setToken(res.data.token);
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
            writeAdminToken(null);
            setToken(null);
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

    // Track the last user activity (click/key/mousemove/touch). Updated
    // by the listener further down — but the state must exist before
    // `extendSession` so the callback can `setLastActivity` from a stable
    // closure without eslint flagging the access.
    const [lastActivity, setLastActivity] = useState(() => Date.now());

    const extendSession = useCallback(async () => {
        const res = await api.post('/auth/refresh');
        if (res.ok && res.data?.token) {
            writeAdminToken(res.data.token);
            setToken(res.data.token);
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
 *
 * BuildWithLami is a one-man studio — the Owner role is the only
 * admin role after v38_simplify_roles. We intentionally do NOT
 * accept the legacy 'Administrator' label here; any stale token
 * holding that role is normalised to 'Owner' by the auth middleware
 * before it reaches the frontend, so this branch is the only
 * one we need.
 */
export function OwnerOnly({ children, fallback = null }) {
    const { user } = useAuth();
    if (!user) return fallback;
    if (user.role !== 'Owner') return fallback;
    return children;
}
