import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem('onboardai_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // Call real backend API
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            const userData = {
                ...user,
                token: token,
                avatar: user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
            };

            setUser(userData);
            localStorage.setItem('onboardai_user', JSON.stringify(userData));

            return userData; // Return for navigation logic
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Invalid email or password');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('onboardai_user');
    };

    const value = {
        user,
        setUser,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
