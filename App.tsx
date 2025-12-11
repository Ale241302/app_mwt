import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-gesture-handler'; // Recommended import for react-navigation
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

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
        (async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            // handle status if needed
        })();
    }, []);

    return (
        <AuthProvider>
            <StatusBar style="light" />
            <RootNavigator />
        </AuthProvider>
    );
}
