import AsyncStorage from '@react-native-async-storage/async-storage'; // Import directly from package
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Config } from '../constants/Config';

interface User {
    id: string;
    keyuser: string;
    name: string;
    email: string;
}

interface AuthContextData {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, pass: string) => Promise<any>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    async function loadStorageData() {
        try {
            const userJSON = await AsyncStorage.getItem('@Auth:user');
            if (userJSON) {
                setUser(JSON.parse(userJSON));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    async function signIn(email: string, pass: string) {
        try {
            const response = await axios.post(Config.LOGIN_URL, {
                keyhash: Config.KEY_HASH,
                email: email,
                password: pass,
            });

            if (response.data.success) {
                const userData = response.data.data;
                setUser(userData);
                await AsyncStorage.setItem('@Auth:user', JSON.stringify(userData));
                return { success: true };
            } else {
                return { success: false, message: response.data.message || 'Login failed' };
            }
        } catch (error) {
            console.error(error);
            return { success: false, message: 'Network or Server Error' };
        }
    }

    async function signOut() {
        setUser(null);
        await AsyncStorage.removeItem('@Auth:user');
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
