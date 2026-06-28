import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../services/api';

/**
 * ProtectedRoute — Wraps admin pages so unauthenticated users
 * are redirected to the homepage. Validates the JWT by calling
 * /api/auth/me on mount.
 *
 * Behaviour notes:
 * - If the first call fails with a transient (network) error, we retry
 *   once after 500ms before giving up — avoids a "logged out on flaky
 *   network" footgun.
 * - Only an explicit 401/403 from the server is treated as "denied".
 *   Other failures (timeout, 5xx) also redirect, but a brief delay is
 *   added so the user can see the loader.
 */
const ProtectedRoute = ({ children }) => {
    const [status, setStatus] = useState('loading'); // loading | authenticated | denied
    const ranOnce = useRef(false);

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
                setStatus('denied');
                return;
            }
            // Transient — try once more before giving up.
            if (attempt < 2) {
                setTimeout(() => verify(attempt + 1), 500);
            } else {
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
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
