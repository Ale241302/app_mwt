import { LogBox } from 'react-native';

if (__DEV__) {
    const ignored = [
        'expo-notifications: Android Push notifications',
        'expo-background-fetch: This library is deprecated',
        'Background Fetch functionality is not available',
        '`expo-notifications` functionality is not fully supported',
    ];

    LogBox.ignoreLogs(ignored);
}
