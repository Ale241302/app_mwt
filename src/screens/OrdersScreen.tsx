import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
}

// Normalize status to group similar statuses together
const normalizeStatus = (status: string): string => {
    const normalized: Record<string, string> = {
        'credito': 'Creación/Producción',
        'confirmed': 'Creación/Producción',
        'produccion': 'Creación/Producción',
        'transito': 'Tránsito',
        'preparacion': 'Preparación/Despacho',
        'despacho': 'Preparación/Despacho',
        'pagado': 'Pagado',
    };
    return normalized[status?.toLowerCase()] || 'Otros';
};

export default function OrdersScreen() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    // Filter State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

    const { width } = Dimensions.get('window');

    const fetchOrders = async () => {
        if (!user) return;
        try {
            const response = await axios.post('https://muitowork.com/api-tracking/order.php', {
                keyhash: Config.KEY_HASH,
                keyuser: user.keyuser,
            });

            if (response.data && response.data.success) {
                setOrders(response.data.data);

                // Initialize expanded state for normalized statuses
                const newExpandedState: Record<string, boolean> = {};
                const uniqueNormalizedStatuses = Array.from(
                    new Set(response.data.data.map((o: Order) => normalizeStatus(o.order_status)))
                );
                uniqueNormalizedStatuses.forEach((status: any) => {
                    newExpandedState[status] = true; // Default open
                });
                setExpandedSections(prev => ({ ...newExpandedState, ...prev }));
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

    useEffect(() => {
        let result = orders;

        // 1. Text Search
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(order =>
                (order.order_number && order.order_number.toLowerCase().includes(lower)) ||
                (order.preforma_number_purchase && order.preforma_number_purchase.toLowerCase().includes(lower)) ||
                (order.sap_number_preformar && order.sap_number_preformar.toLowerCase().includes(lower)) ||
                (order.sap_number_preforma && order.sap_number_preforma.toLowerCase().includes(lower)) ||
                (order.sap_number_preforma_mwt && order.sap_number_preforma_mwt.toLowerCase().includes(lower)) ||
                (order.cust_customer_name && order.cust_customer_name.toLowerCase().includes(lower))
            );
        }

        // 2. Customer Filter
        if (selectedCustomers.length > 0) {
            result = result.filter(order =>
                order.cust_customer_name && selectedCustomers.includes(order.cust_customer_name)
            );
        }

        setFilteredOrders(result);
    }, [search, orders, selectedCustomers]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const toggleSection = (status: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [status]: !prev[status]
        }));
    };

    const toggleCustomer = (customer: string) => {
        if (selectedCustomers.includes(customer)) {
            setSelectedCustomers(prev => prev.filter(c => c !== customer));
        } else {
            setSelectedCustomers(prev => [...prev, customer]);
        }
    };

    const getUniqueCustomers = () => {
        const customers = orders.map(o => o.cust_customer_name).filter(c => c);
        return Array.from(new Set(customers)).sort();
    };

    // Grouping Logic: Group by NORMALIZED status
    const groupedOrders = filteredOrders.reduce((acc, order) => {
        const normalizedStatus = normalizeStatus(order.order_status);
        if (!acc[normalizedStatus]) {
            acc[normalizedStatus] = [];
        }
        acc[normalizedStatus].push(order);
        return acc;
    }, {} as Record<string, Order[]>);

    // Sort groups by custom order
    const statusOrder = ['Creación/Producción', 'Preparación/Despacho', 'Tránsito', 'Pagado', 'Otros'];
    const sortedGroupKeys = Object.keys(groupedOrders).sort((a, b) => {
        const indexA = statusOrder.indexOf(a);
        const indexB = statusOrder.indexOf(b);
        const aIndex = indexA === -1 ? 999 : indexA;
        const bIndex = indexB === -1 ? 999 : indexB;
        return aIndex - bIndex;
    });

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            {/* Search Bar Fixed at Top */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
                <TextInput
                    placeholder="Buscar pedido..."
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                />
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="filter" size={24} color="#10b981" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {sortedGroupKeys.map((status) => {
                    const isExpanded = expandedSections[status] ?? true;

                    return (
                        <View key={status} style={[styles.sectionContainer, !isExpanded && styles.sectionCollapsed]}>
                            <TouchableOpacity
                                style={styles.sectionHeader}
                                onPress={() => toggleSection(status)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.sectionTitle}>{status}</Text>
                                <Ionicons
                                    name={isExpanded ? "remove" : "add"}
                                    size={24}
                                    color="#0d1b2a"
                                />
                            </TouchableOpacity>

                            {isExpanded && (
                                <View style={styles.cardsContainer}>
                                    {groupedOrders[status].map((order) => (
                                        <View key={order.order_id} style={styles.card}>
                                            <View style={styles.cardHeader}>
                                                <Text style={styles.orderNumber}>{order.order_number}</Text>
                                                <View style={styles.icons}>
                                                    <TouchableOpacity style={styles.iconButton}>
                                                        <Ionicons name="search" size={18} color="#fff" />
                                                    </TouchableOpacity>
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
                            )}
                        </View>
                    );
                })}
                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Filter Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
                    <View style={[styles.sideMenu, { width: width * 0.75 }]}>
                        <View style={styles.sideMenuHeader}>
                            <Text style={styles.sideMenuTitle}>Filtrar por</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.filterCategoryTitle}>Clientes</Text>
                        <ScrollView style={styles.filterScroll} showsVerticalScrollIndicator={false}>
                            {getUniqueCustomers().map(customer => {
                                const isChecked = selectedCustomers.includes(customer);
                                return (
                                    <TouchableOpacity
                                        key={customer}
                                        style={styles.filterOption}
                                        onPress={() => toggleCustomer(customer)}
                                    >
                                        <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                                            {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
                                        </View>
                                        <Text style={styles.filterOptionText}>{customer}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 10,
        paddingHorizontal: 15,
        borderRadius: 25,
        height: 50,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    sectionContainer: {
        backgroundColor: '#26d0ce',
        borderRadius: 15,
        padding: 10,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionCollapsed: {
        height: null,
        paddingBottom: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0d1b2a',
    },
    cardsContainer: {
        gap: 10,
        marginTop: 5,
    },
    card: {
        backgroundColor: '#0d1b2a',
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
    cardBody: {},
    textRow: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 4,
    },
    label: {
        fontWeight: 'bold',
        color: '#e0e0e0',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        flex: 1,
    },
    sideMenu: {
        height: '100%',
        backgroundColor: '#fff',
        padding: 20,
    },
    sideMenuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    sideMenuTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    filterCategoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#26d0ce',
        marginBottom: 10,
    },
    filterScroll: {
        flex: 1,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 4,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    filterOptionText: {
        fontSize: 14,
        color: '#555',
    },
});
