import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';

// ── Client token persistence (see docs/AUTH_MODEL.md) ─────
// Client portal uses BOTH:
//   1. An HttpOnly `client_token` cookie (same-origin convenience)
//   2. A JS-readable `localStorage.client_token` (the authoritative
//      credential that the api client sends as `Authorization: Bearer …`)
// Same trade-off as the admin side: same-origin SPA, React + DOMPurify
// are the XSS boundary.
const CLIENT_TOKEN_KEY = 'client_token';

function readClientToken() {
    try { return localStorage.getItem(CLIENT_TOKEN_KEY); } catch { return null; }
}
function writeClientToken(token) {
    try {
        if (token) localStorage.setItem(CLIENT_TOKEN_KEY, token);
        else localStorage.removeItem(CLIENT_TOKEN_KEY);
    } catch { /* storage unavailable — fall back to cookie-only auth */ }
}

const ClientAuthContext = createContext();

export function ClientAuthProvider({ children }) {
    const [clientUser, setClientUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(() => readClientToken());

    const checkSession = useCallback(async () => {
        try {
            const res = await api.get('/client-auth/me', {}, 'client');
            if (res.ok && res.data) {
                setClientUser(res.data);
            } else if (res.status === 401) {
                // Expired or invalid token — clear local state and the
                // persisted token so the next render doesn't keep
                // showing a stale "logged in" UI.
                writeClientToken(null);
                setToken(null);
                setClientUser(null);
            } else {
                setClientUser(null);
            }
        } catch (_err) {
            setClientUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = useCallback(async (email, password) => {
        const res = await api.post('/client-auth/login', { email, password }, {}, 'client');
        if (!res.ok) {
            throw new Error(res.error || (res.data && res.data.error) || 'Login failed');
        }
        const data = res.data;
        if (data.token) {
            writeClientToken(data.token);
            setToken(data.token);
        }
        const user = data.client || data.user || data;
        setClientUser(user);
        return data;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/client-auth/logout', {}, {}, 'client');
        } finally {
            writeClientToken(null);
            setToken(null);
            setClientUser(null);
        }
    }, []);

    // ── Centralised 401 handling (H-4) ─────────────────────
    // If any component issues an authenticated client request and the
    // server returns 401 (expired or revoked token), we wipe the local
    // session and bounce to /client/login. The actual redirect happens
    // in pages that consume the context — see ClientPortalLayout.
    const handleUnauthorized = useCallback(() => {
        writeClientToken(null);
        setToken(null);
        setClientUser(null);
    }, []);

    const value = useMemo(() => ({
        clientUser,
        token,
        loading,
        login,
        logout,
        checkSession,
        handleUnauthorized,
    }), [clientUser, token, loading, login, logout, checkSession, handleUnauthorized]);

    return (
        <ClientAuthContext.Provider value={value}>
            {children}
        </ClientAuthContext.Provider>
    );
}

export const useClientAuth = () => useContext(ClientAuthContext);
