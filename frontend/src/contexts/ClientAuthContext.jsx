import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const ClientAuthContext = createContext();

export function ClientAuthProvider({ children }) {
    const [clientUser, setClientUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSession = async () => {
        try {
            const res = await api.get('/client-auth/me');
            if (res.ok && res.data) {
                setClientUser(res.data);
            } else {
                setClientUser(null);
            }
        } catch (err) {
            setClientUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/client-auth/login', { email, password });
        if (!res.ok) {
            throw new Error(res.error || (res.data && res.data.error) || 'Login failed');
        }
        const data = res.data;
        setClientUser(data.client || data.user || data);
        return data;
    };

    const logout = async () => {
        await api.post('/client-auth/logout');
        setClientUser(null);
    };

    const value = {
        clientUser,
        loading,
        login,
        logout,
        checkSession,
    };

    return (
        <ClientAuthContext.Provider value={value}>
            {children}
        </ClientAuthContext.Provider>
    );
}

export const useClientAuth = () => useContext(ClientAuthContext);
