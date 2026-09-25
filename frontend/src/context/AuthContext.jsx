import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await api.get('/auth/me');
                if (res.user) {
                    setUser(res.user);
                    localStorage.setItem('user', JSON.stringify(res.user));
                }
            } catch (err) {
                console.warn('Session verification failed:', err);
                logout();
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.token);
        if (res.refreshToken) {
            localStorage.setItem('refreshToken', res.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(res.user));
        setUser(res.user);
        return res.user;
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        localStorage.setItem('token', res.token);
        if (res.refreshToken) {
            localStorage.setItem('refreshToken', res.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(res.user));
        setUser(res.user);
        return res.user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    const refreshProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.user) {
                setUser(res.user);
                localStorage.setItem('user', JSON.stringify(res.user));
            }
        } catch (e) {
            console.error('Failed to refresh user profile:', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
