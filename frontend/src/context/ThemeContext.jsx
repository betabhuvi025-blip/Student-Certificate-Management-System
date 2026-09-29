import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
    {
        id: 'cyber-midnight',
        name: 'Cyber Midnight',
        subtitle: 'Sleek Dark Mode & Neon Glassmorphism',
        mode: 'dark',
        accentColor: '#38bdf8',
        previewGradient: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 60%, #38bdf8 100%)',
        badge: 'Popular'
    },
    {
        id: 'royal-indigo',
        name: 'Royal Sapphire',
        subtitle: 'Vibrant Modern Executive Light Theme',
        mode: 'light',
        accentColor: '#2563eb',
        previewGradient: 'linear-gradient(135deg, #eff6ff 0%, #3b82f6 50%, #1e3a8a 100%)',
        badge: 'Classic'
    },
    {
        id: 'emerald-matrix',
        name: 'Emerald Luminary',
        subtitle: 'High-Tech Forest & Mint Luminescence',
        mode: 'dark',
        accentColor: '#10b981',
        previewGradient: 'linear-gradient(135deg, #05140d 0%, #059669 60%, #34d399 100%)',
        badge: 'Tech'
    },
    {
        id: 'sunset-nova',
        name: 'Sunset Nebula',
        subtitle: 'Deep Cosmic Violet & Rose Aurora',
        mode: 'dark',
        accentColor: '#ec4899',
        previewGradient: 'linear-gradient(135deg, #11091f 0%, #7c3aed 50%, #ec4899 100%)',
        badge: 'Vibrant'
    }
];

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        try {
            return localStorage.getItem('student_event_tracker_theme') || 'cyber-midnight';
        } catch {
            return 'cyber-midnight';
        }
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('student_event_tracker_theme', theme);
        } catch (e) {
            console.error('Failed to save theme:', e);
        }
    }, [theme]);

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };

    const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, currentTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
