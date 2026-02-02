import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

    const login = (role) => {
        const mockUser = {
            id: 1,
            name: role === 'hr' ? 'Alex HR' : 'Sam Employee',
            email: role === 'hr' ? 'alex@company.com' : 'sam@company.com',
            role: role, // 'hr' or 'employee'
            avatar: role === 'hr' ? 'AH' : 'SE'
        };

        setUser(mockUser);
        localStorage.setItem('onboardai_user', JSON.stringify(mockUser));
        return mockUser; // Return for navigation logic
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('onboardai_user');
    };

    const value = {
        user,
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
