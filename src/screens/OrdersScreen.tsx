import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Config } from '../constants/Config';
import { useAuth } from '../context/AuthContext';

interface Order {
    order_id: string;
    order_number: string;
    order_status: string;
    preforma_number_purchase: string; // OC
    sap_number_preformar: string; // SAP
    sap_number_preforma_mwt: string; // Preforma Muito Work
    sap_number_preforma: string; // Preforma
    prod_fechai: string; // Producción
    cust_customer_name: string; // Cliente
    // Add other fields if necessary
}

// Helper to capitalize status for display
const formatStatus = (status: string) => {
    if (!status) return '';
    // Map "produccion" to "Creación/Producción" if needed, based on image?
    // User said "agrupar por estados". The image shows "Creación/Producción". 
    // Let's assume the raw status is "produccion" and we might want to map it.
    // Or just capitalize. I'll just capitalize for now or use the raw string if unsure.
    // Given the image shows "Creación/Producción" and JSON has "produccion", I'll add a mapper.
    const map: Record<string, string> = {
        'produccion': 'Creación/Producción',
        'transito': 'Tránsito',
        'preparacion': 'Preparación',
        'pagado': 'Pagado',
    };
    return map[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

export default function OrdersScreen() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        if (!user) return;
        try {
            // Double check if payload needs exact keys
            const response = await axios.post('https://muitowork.com/api-tracking/order.php', {
                keyhash: Config.KEY_HASH,
                keyuser: user.keyuser,
            });

            if (response.data && response.data.success) {
                setOrders(response.data.data);
            } else {
                console.warn('Failed to fetch orders:', response.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    // Grouping Logic
    const groupedOrders = orders.reduce((acc, order) => {
        const status = order.order_status || 'Otros';
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(order);
        return acc;
    }, {} as Record<string, Order[]>);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {Object.keys(groupedOrders).map((status) => (
                <View key={status} style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{formatStatus(status)}</Text>
                    </View>

                    <View style={styles.cardsContainer}>
                        {groupedOrders[status].map((order) => (
                            <View key={order.order_id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.orderNumber}>{order.order_number}</Text>
                                    <View style={styles.icons}>
                                        {/* Search Icon */}
                                        <TouchableOpacity style={styles.iconButton}>
                                            <Ionicons name="search" size={18} color="#fff" />
                                        </TouchableOpacity>
                                        {/* Eye Icon */}
                                        <TouchableOpacity style={styles.iconButton}>
                                            <Ionicons name="eye" size={18} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.cardBody}>
                                    <Text style={styles.textRow}><Text style={styles.label}>OC: </Text>{order.preforma_number_purchase}</Text>
                                    <Text style={styles.textRow}><Text style={styles.label}>SAP: </Text>{order.sap_number_preformar}</Text>
                                    <Text style={styles.textRow}><Text style={styles.label}>Preforma Muito Work Limitida: </Text>{order.sap_number_preforma_mwt}</Text>
                                    <Text style={styles.textRow}><Text style={styles.label}>Preforma: </Text>{order.sap_number_preforma}</Text>
                                    <Text style={styles.textRow}><Text style={styles.label}>Producción: </Text>{order.prod_fechai}</Text>
                                    <Text style={styles.textRow}><Text style={styles.label}>Cliente: </Text>{order.cust_customer_name}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            ))}
            <View style={{ height: 20 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionContainer: {
        backgroundColor: '#26d0ce', // Teal color similar to image
        borderRadius: 15,
        padding: 10,
        marginBottom: 20,
        // Add shadow
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionHeader: {
        marginBottom: 10,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0d1b2a', // Dark text for contrast on teal
    },
    cardsContainer: {
        gap: 10,
    },
    card: {
        backgroundColor: '#0d1b2a', // Dark Navy/Black
        borderRadius: 10,
        padding: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    icons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 10,
    },
    cardBody: {

    },
    textRow: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 4,
    },
    label: {
        fontWeight: 'bold',
        color: '#a0a0a0', // Slightly dimmer for labels? Or keep white. Image looks white/bold.
        // Let's keep it white but maybe slightly different weight if needed.
        // Actually in the image the labels "OC:", "SAP:", etc seems white.
        color: '#e0e0e0',
    }
});
