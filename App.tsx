import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import { checkPermissions, registerBackgroundFetchAsync } from './src/utils/BackgroundService';
import './src/utils/ignoreWarnings';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export default function App() {
    useEffect(() => {
        // 1. Request Permissions & Register Background Task
        (async () => {
            const hasPermission = await checkPermissions();
            if (hasPermission) {
                await registerBackgroundFetchAsync();
            }
        })();

        // 2. Handle Notification Click (Foreground/Background)
        // This listener handles when a user taps on a notification
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            // The user tapped the notification. 
            // "ingresa en la app al inicio" - effectively handled by just opening the app.
            // If we needed to navigate:
            // const data = response.notification.request.content.data;
            // navigationRef.navigate('SomeScreen', data);
            console.log('Notification tapped:', response.notification.request.content);
        });

        return () => subscription.remove();
    }, []);

    return (
        <LanguageProvider>
            <AuthProvider>
                <ThemeProvider>
                    <CartProvider>
                        <StatusBar style="auto" />
                        <RootNavigator />
                    </CartProvider>
                </ThemeProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}
