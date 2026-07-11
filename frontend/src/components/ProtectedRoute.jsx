import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { clearAuth } from '../services/auth.js';

/**
 * ProtectedRoute — Wraps admin pages so unauthenticated users
 * are redirected to /login. Validates the JWT by calling
 * /api/auth/me on mount.
 *
 * Behaviour notes:
 * - If the first call fails with a transient (network) error, we retry
 *   once after 500ms before giving up — avoids a "logged out on flaky
 *   network" footgun.
 * - On 401/403 the stale token is cleared from storage so the user
 *   doesn't get stuck in a redirect loop on the next visit.
 * - Redirects to /login with a `from` param so the login page can send
 *   the user back after authenticating.
 */
const ProtectedRoute = ({ children }) => {
    const [status, setStatus] = useState('loading'); // loading | authenticated | denied
    const ranOnce = useRef(false);
    const location = useLocation();

    useEffect(() => {
        if (ranOnce.current) return;
        ranOnce.current = true;

        const verify = async (attempt = 1) => {
            const res = await api.get('/auth/me', { timeout: 5000 });
            if (res.ok && res.data && res.data.role) {
                setStatus('authenticated');
                return;
            }
            if (!res.ok && (res.status === 401 || res.status === 403)) {
                // Token is actually invalid/expired — clear it and deny.
                clearAuth();
                setStatus('denied');
                return;
            }
            // Transient (network error, timeout, 5xx) — retry once
            // before deciding. If the retry also fails, surface
            // the failure (deny) instead of letting the user land
            // on a broken admin page.
            if (attempt < 2) {
                setTimeout(() => verify(attempt + 1), 800);
            } else {
                clearAuth();
                setStatus('denied');
            }
        };
        verify();
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm font-medium">Verifying access…</div>
            </div>
        );
    }

    if (status === 'denied') {
        return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
    }

    return children;
};

export default ProtectedRoute;
