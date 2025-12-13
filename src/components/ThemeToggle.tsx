import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
            <Ionicons
                name={theme === 'light' ? 'moon' : 'sunny'}
                size={24}
                color={theme === 'light' ? '#333' : '#fbbf24'}
            />
        </TouchableOpacity>
    );
}
