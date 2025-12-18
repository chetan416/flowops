import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useRouter from 'next/router';
import api from '@/services/api';

interface User {
    id: number;
    email: string;
    full_name?: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/users/me');
                    setUser(response.data);
                } catch (error: any) {
                    if (error.response && error.response.status === 401) {
                        console.warn("Session expired or invalid, logging out.");
                    } else {
                        console.error("Failed to fetch user", error);
                    }
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (token: string) => {
        localStorage.setItem('token', token);
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user after login", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/auth/login';
    };

    const refreshUser = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
        } catch (error) {
            console.error("Failed to refresh user", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
