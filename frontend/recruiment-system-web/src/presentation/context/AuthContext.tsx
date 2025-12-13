import React, { useState } from 'react';
import api from '../../data/api';
import type { LoginInput, RegisterInput, User, LoginResponse } from '../../domain/types';
import { Role } from '../../domain/types';
import { AuthContext } from './authStore';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading] = useState<boolean>(false);

    const login = async (data: LoginInput) => {
        try {
            const response = await api.post<LoginResponse>('/login', data);
            const output = response.data;

            const jwtToken = output.token;
            localStorage.setItem('token', jwtToken);
            setToken(jwtToken);

            const payload = JSON.parse(atob(jwtToken.split('.')[1]));
            const userObj: User = {
                id: payload.user_id,
                role: payload.role as Role,
                email: payload.email,
                name: payload.name,
            };

            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));

        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (data: RegisterInput) => {
        try {
            await api.post('/register', data);
        } catch (error) {
            console.error("Register failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};
