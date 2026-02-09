import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Default to 'dark' or system preference, or user stored preference
    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem('onboardai_theme');
        if (stored) return stored;
        return 'dark'; // Defaulting to dark for this aesthetic
    });

    const [accentColor, setAccentColor] = useState('blue'); // blue, green, purple, teal
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        // Apply theme class to html/body
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        localStorage.setItem('onboardai_theme', theme);
    }, [theme]);

    const toggleTheme = async (newTheme) => {
        setTheme(newTheme);
        if (user) {
            try {
                // Fire and forget persistence
                await api.put(`/users/${user.id}/preference`, { theme: newTheme });
            } catch (err) {
                console.error("Failed to persist theme", err);
            }
        }
    };

    const value = {
        theme,
        toggleTheme,
        accentColor,
        setAccentColor,
        notificationsEnabled,
        setNotificationsEnabled
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
