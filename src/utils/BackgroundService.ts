import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Config } from '../constants/Config';

const BACKGROUND_TRACKING_TASK = 'BACKGROUND_TRACKING_TASK';
const LAST_LOG_ID_KEY = '@BackgroundTracking:last_log_id';

interface TrackingLog {
    id: string; // The API returns id as string "74"
    order_number: string;
    funcion_handler: string;
    response_status: string;
    fecha_creacion: string;
}

interface User {
    id: string;
    keyuser: string;
    name: string;
    email: string;
    group_titles: string[];
}

TaskManager.defineTask(BACKGROUND_TRACKING_TASK, async () => {
    try {
        // 1. Get user credentials
        const userJSON = await AsyncStorage.getItem('@Auth:user');
        if (!userJSON) {
            console.log('BackgroundFetch: No user found, skipping.');
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }
        const user: User = JSON.parse(userJSON);

        // 2. Poll API
        console.log('BackgroundFetch: Fetching tracking data...');
        const response = await axios.post(Config.API_URL + '/monitor.php', { // Use explicit URL construction based on request
            keyhash: Config.KEY_HASH,
            keyuser: user.keyuser,
        });

        // 3. Process Response
        if (response.data && response.data.success && response.data.tracking_logs) {
            const logs: TrackingLog[] = response.data.tracking_logs;

            // Get last stored log ID
            const lastLogIdStr = await AsyncStorage.getItem(LAST_LOG_ID_KEY);
            let lastLogId = lastLogIdStr ? parseInt(lastLogIdStr, 10) : 0;

            // Filter new logs: log.id > lastLogId
            // Sort logs by ID ascending to process them in order if needed, but for "max ID" check, just filtering is enough.
            // The API seems to return them descending by time (74, 72, 70...), so reverse or allow "latest" check.
            // We want to notify for ANY log that is newer than what we last saw.

            const newLogs = logs.filter(log => parseInt(log.id, 10) > lastLogId);

            if (newLogs.length > 0) {
                console.log(`BackgroundFetch: Found ${newLogs.length} new logs.`);

                // Find the highest ID in this batch to update storage later
                let maxIdInBatch = lastLogId;

                for (const log of newLogs) {
                    const logId = parseInt(log.id, 10);
                    if (logId > maxIdInBatch) {
                        maxIdInBatch = logId;
                    }

                    // Schedule Local Notification
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: 'Actualización de Pedido',
                            body: `El pedido ${log.order_number} ha recibido una actualización.`,
                            data: { order_number: log.order_number },
                            sound: true,
                        },
                        trigger: null, // Send immediately
                    });
                }

                // Update stored ID
                await AsyncStorage.setItem(LAST_LOG_ID_KEY, maxIdInBatch.toString());

                return BackgroundFetch.BackgroundFetchResult.NewData;
            } else {
                console.log('BackgroundFetch: No new logs.');
                return BackgroundFetch.BackgroundFetchResult.NoData;
            }
        }

        return BackgroundFetch.BackgroundFetchResult.NoData;
    } catch (error) {
        console.error('BackgroundFetch failed:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export async function registerBackgroundFetchAsync() {
    try {
        // Register the task
        await BackgroundFetch.registerTaskAsync(BACKGROUND_TRACKING_TASK, {
            minimumInterval: 15 * 60, // 15 minutes
            stopOnTerminate: false, // Continue even if app is terminated (Android only reliable)
            startOnBoot: true, // Android only
        });
        console.log('BackgroundFetch registered');
    } catch (err) {
        console.log('BackgroundFetch registration failed (likely running in Expo Go - logic requires Dev Build):', err);
    }
}

export async function checkPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    return finalStatus === 'granted';
}
