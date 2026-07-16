import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute — Wraps admin pages so unauthenticated users
 * are redirected to /login.
 *
 * Single source of truth: AuthContext.
 *
 * AuthContext runs exactly one /auth/me probe on mount and exposes
 * `loading` + `user`. Reading those here means we never trigger a
 * second /auth/me call from a route mount, and — critically — we
 * can't end up in a "user is set in state, but cookie is missing"
 * redirect loop between /login and /admin.
 *
 * Behaviour:
 *   - loading === true  → show "Verifying access…"
 *   - !user            → redirect to /login?from=<current path>
 *   - user             → render children
 */
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm font-medium">Verifying access…</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
    }

    return children;
};

export default ProtectedRoute;
