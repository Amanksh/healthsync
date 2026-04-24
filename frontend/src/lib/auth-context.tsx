'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from './api-client';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PHARMACIST';
    hospitalId: string | null;
    hospitalName: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getSavedAuth() {
    if (typeof window === 'undefined') {
        return { savedToken: null, savedUser: null };
    }

    const savedToken = localStorage.getItem('hms_token');
    const savedUserJson = localStorage.getItem('hms_user');

    if (!savedToken || !savedUserJson) {
        return { savedToken: null, savedUser: null };
    }

    try {
        return { savedToken, savedUser: JSON.parse(savedUserJson) as User };
    } catch {
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user');
        return { savedToken: null, savedUser: null };
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [{ savedToken, savedUser }] = useState(getSavedAuth);
    const [user, setUser] = useState<User | null>(savedUser);
    const [token, setToken] = useState<string | null>(savedToken);
    const isLoading = false;

    const login = useCallback(async (email: string, password: string) => {
        const response = await authApi.login({ email, password }) as {
            accessToken: string;
            user: User;
        };
        setToken(response.accessToken);
        setUser(response.user);
        localStorage.setItem('hms_token', response.accessToken);
        localStorage.setItem('hms_user', JSON.stringify(response.user));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user');
        window.location.href = '/login';
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token && !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
