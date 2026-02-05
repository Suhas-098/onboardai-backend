import React, { createContext, useContext, useState, useEffect } from 'react';

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

    useEffect(() => {
        // Apply theme class to html/body
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        localStorage.setItem('onboardai_theme', theme);
    }, [theme]);

    const toggleTheme = (newTheme) => {
        setTheme(newTheme);
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
