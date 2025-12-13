import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    colors: typeof lightColors;
}

// Colors Palette
export const lightColors = {
    background: '#f3f4f6',
    card: '#ffffff',
    text: '#111827',
    subtext: '#4b5563',
    border: '#e5e7eb',
    primary: '#10b981',
    tint: '#f9fafb', // headers
    icon: '#4b5563',
    sectionHeader: '#111827',
};

export const darkColors = {
    background: '#111827', // Very dark blue/gray
    card: '#1f2937',        // Lighter dark card
    text: '#f9fafb',        // Whiteish text
    subtext: '#9ca3af',     // Gray text
    border: '#374151',
    primary: '#10b981',     // Keep primary color or adjust slightly
    tint: '#111827',        // dark header
    icon: '#9ca3af',
    sectionHeader: '#f3f4f6',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');

    // Load saved preference
    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem('user_theme');
            if (savedTheme) {
                setTheme(savedTheme as Theme);
            } else if (systemScheme) {
                setTheme(systemScheme);
            }
        };
        loadTheme();
    }, []);

    // Listen to system changes if no manual override (optional, but good for auto)
    useEffect(() => {
        if (!process.env.MANUAL_OVERRIDE) { // Simple check concept
            if (systemScheme) setTheme(systemScheme);
        }
    }, [systemScheme]);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        await AsyncStorage.setItem('user_theme', newTheme);
    };

    const colors = theme === 'light' ? lightColors : darkColors;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
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
