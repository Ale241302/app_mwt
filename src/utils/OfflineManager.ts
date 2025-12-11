import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';

const QUEUE_KEY = 'offline_action_queue';

interface OfflineAction {
    id: string;
    url: string;
    method: 'POST' | 'PUT' | 'DELETE' | 'GET';
    data?: any;
    timestamp: number;
}

class OfflineManager {
    private isConnected: boolean = true;

    constructor() {
        NetInfo.addEventListener(state => {
            const wasConnected = this.isConnected;
            this.isConnected = !!state.isConnected;
            if (!wasConnected && this.isConnected) {
                this.processQueue();
            }
        });
    }

    async addToQueue(action: Omit<OfflineAction, 'id' | 'timestamp'>) {
        const queue = await this.getQueue();
        const newAction: OfflineAction = {
            ...action,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
        };
        queue.push(newAction);
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        console.log('Action queued:', newAction);
    }

    async getQueue(): Promise<OfflineAction[]> {
        const json = await AsyncStorage.getItem(QUEUE_KEY);
        return json ? JSON.parse(json) : [];
    }

    async processQueue() {
        const queue = await this.getQueue();
        if (queue.length === 0) return;

        console.log(`Processing ${queue.length} offline actions...`);
        const remainingQueue: OfflineAction[] = [];

        for (const action of queue) {
            try {
                await axios({
                    method: action.method,
                    url: action.url,
                    data: action.data,
                });
                console.log(`Action ${action.id} synced successfully.`);
            } catch (error) {
                console.error(`Failed to sync action ${action.id}:`, error);
                // If error is 5xx or network error, maybe keep it. If 4xx, discard?
                // For now, if we are supposedly online but fail, we keep it to retry unless it's a specific error.
                // But for simplicity, we might retry later.
                remainingQueue.push(action);
            }
        }

        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
    }

    async request(method: 'POST' | 'GET' | 'PUT' | 'DELETE', url: string, data?: any) {
        const state = await NetInfo.fetch();

        if (state.isConnected && state.isInternetReachable !== false) {
            try {
                const response = await axios({ method, url, data });
                return { success: true, data: response.data };
            } catch (error) {
                // If network error specifically, might want to queue.
                // Axios error handling...
                console.warn('Online request failed, checking if should queue...', error);
                // For now, let's assume if it fails we notify user, unless we want aggressive offline-first where everything is queued.
                // Requirement: "Guardar acciones realizadas offline". So explicitly when offline.
                return { success: false, error };
            }
        } else {
            await this.addToQueue({ method, url, data });
            return { success: true, offline: true, message: 'Action saved locally.' };
        }
    }
}

export const offlineManager = new OfflineManager();
