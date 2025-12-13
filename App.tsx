// import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

// Notifications.setNotificationHandler({
//     handleNotification: async () => ({
//         shouldShowAlert: true,
//         shouldPlaySound: true,
//         shouldSetBadge: false,
//         shouldShowBanner: true,
//         shouldShowList: true,
//     }),
// });

import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
    // useEffect(() => {
    //     (async () => {
    //         const { status } = await Notifications.requestPermissionsAsync();
    //         // handle status if needed
    //     })();
    // }, []);

    return (
        <AuthProvider>
            <ThemeProvider>
                <StatusBar style="auto" />
                <RootNavigator />
            </ThemeProvider>
        </AuthProvider>
    );
}


