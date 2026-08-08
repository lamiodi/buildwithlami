import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useClientAuth } from '../contexts/ClientAuthContext';

export default function ClientProtectedRoute({ children }) {
    const { clientUser, loading } = useClientAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!clientUser) {
        return <Navigate to="/portal/login" state={{ from: location }} replace />;
    }

    return children;
}
