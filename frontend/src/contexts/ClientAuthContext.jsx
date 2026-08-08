import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const ClientAuthContext = createContext();

export function ClientAuthProvider({ children }) {
    const [clientUser, setClientUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const res = await api.get('/api/client-auth/me');
            if (res.ok) {
                setClientUser(await res.json());
            } else {
                setClientUser(null);
            }
        } catch (err) {
            setClientUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/api/client-auth/login', { email, password });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Login failed');
        }
        const data = await res.json();
        setClientUser(data.client);
        return data;
    };

    const logout = async () => {
        await api.post('/api/client-auth/logout');
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
            {!loading && children}
        </ClientAuthContext.Provider>
    );
}

export const useClientAuth = () => useContext(ClientAuthContext);
