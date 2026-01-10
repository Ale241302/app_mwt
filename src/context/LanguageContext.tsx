import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translate as translateFn } from '../constants/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    urlPrefix: string; // 'es', 'us', 'fr', 'pt' for WebView URLs
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = '@Language:preference';

// Map device locale to our supported languages
function getDeviceLanguage(): Language {
    let deviceLocale = 'es'; // Default

    try {
        // Try modern API first (expo-localization >= 14)
        const locales = Localization.getLocales ? Localization.getLocales() : [];
        if (locales && locales.length > 0 && locales[0].languageCode) {
            deviceLocale = locales[0].languageCode.toLowerCase();
        } else {
            // Fallback to legacy API with type casting
            const legacyLocale = (Localization as any).locale;
            if (legacyLocale) {
                deviceLocale = legacyLocale.toLowerCase();
            }
        }
    } catch (e) {
        console.warn('Error detecting device language', e);
    }

    if (deviceLocale.startsWith('es')) return 'es';
    if (deviceLocale.startsWith('en')) return 'en';
    if (deviceLocale.startsWith('fr')) return 'fr';
    if (deviceLocale.startsWith('pt')) return 'pt';

    // Default to Spanish
    return 'es';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('es');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored && ['es', 'en', 'fr', 'pt'].includes(stored)) {
                setLanguageState(stored as Language);
            } else {
                // Detect device language on first launch
                const deviceLang = getDeviceLanguage();
                setLanguageState(deviceLang);
                await AsyncStorage.setItem(STORAGE_KEY, deviceLang);
            }
        } catch (error) {
            console.error('Error loading language:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setLanguage = async (lang: Language) => {
        try {
            setLanguageState(lang);
            await AsyncStorage.setItem(STORAGE_KEY, lang);
        } catch (error) {
            console.error('Error saving language:', error);
        }
    };

    const t = (key: string): string => {
        return translateFn(key, language);
    };

    // URL prefix for WebView screens (en -> us for URLs)
    const urlPrefix = language === 'en' ? 'us' : language;

    if (isLoading) {
        return null; // Or a loading spinner
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, urlPrefix }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
