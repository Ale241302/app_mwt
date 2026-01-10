import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Config } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

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
    operado_mwt: string; // Operador (0 = Cliente, 1 = Muito Work Limitada)
}

import BinocularsIcon from '../components/BinocularsIcon';

// Normalize status to group similar statuses together
const normalizeStatus = (status: string): string => {
    const normalized: Record<string, string> = {
        'credito': 'Creación/Producción',
        'confirmed': 'Creación/Producción',
        'produccion': 'Creación/Producción',
        'preparacion': 'Preparación/Despacho',
        'despacho': 'Preparación/Despacho',
        'transito': 'Tránsito',
        'pagado': 'En Destino',
    };
    return normalized[status?.toLowerCase()] || 'Otros';
};

export default function OrdersScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { colors } = useTheme(); // Use Theme Context
    const { t } = useLanguage();
    const styles = getStyles(colors); // Get dynamic styles
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    // Filter State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>([]);
    const [selectedOperator, setSelectedOperator] = useState<string>(''); // '' = all, '0' = Cliente, '1' = Muito Work Limitada

    const STATUS_FILTERS: Record<string, string[]> = {
        [t('Creación')]: ['confirmed'],
        [t('Crédito')]: ['credito'],
        [t('Producción')]: ['produccion'],
        [t('Preparación')]: ['preparacion'],
        [t('Despacho')]: ['despacho'],
        [t('Tránsito')]: ['transito'],
        [t('En Destino')]: ['pagado'],
    };

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

        // 3. Status Filter
        if (selectedStatusFilters.length > 0) {
            // Flatten allowed raw statuses from selected filters
            const allowedStatuses = selectedStatusFilters.flatMap(filter => STATUS_FILTERS[filter]);
            result = result.filter(order =>
                order.order_status && allowedStatuses.includes(order.order_status.toLowerCase())
            );
        }

        // 4. Operator Filter (only for administrators)
        if (selectedOperator) {
            result = result.filter(order =>
                order.operado_mwt === selectedOperator
            );
        }

        setFilteredOrders(result);
    }, [search, orders, selectedCustomers, selectedStatusFilters, selectedOperator]);

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

    const toggleStatusFilter = (filter: string) => {
        if (selectedStatusFilters.includes(filter)) {
            setSelectedStatusFilters(prev => prev.filter(s => s !== filter));
        } else {
            setSelectedStatusFilters(prev => [...prev, filter]);
        }
    };

    const toggleOperatorFilter = (operator: string) => {
        // Toggle: if already selected, deselect; otherwise select
        if (selectedOperator === operator) {
            setSelectedOperator('');
        } else {
            setSelectedOperator(operator);
        }
    };

    const getUniqueCustomers = () => {
        const customers = orders.map(o => o.cust_customer_name).filter(c => c);
        return Array.from(new Set(customers)).sort();
    };

    // Check if user is administrator
    const isAdministrator = user?.group_titles?.includes('Administrator') || false;

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
    const statusOrder = ['Creación/Producción', 'Preparación/Despacho', 'Tránsito', 'En Destino', 'Otros'];
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
                <Ionicons name="search" size={20} color={colors.subtext} style={{ marginRight: 10 }} />
                <TextInput
                    placeholder={t('Buscar pedido...')}
                    placeholderTextColor={colors.subtext}
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
                                <Text style={styles.sectionTitle}>{t(status)}</Text>
                                <Ionicons
                                    name={isExpanded ? "remove" : "add"}
                                    size={24}
                                    color={colors.text}
                                />
                            </TouchableOpacity>

                            {isExpanded && (
                                <View style={styles.cardsContainer}>
                                    {groupedOrders[status].map((order) => (
                                        <View key={order.order_id} style={styles.card}>
                                            <View style={styles.cardHeader}>
                                                <Text style={styles.orderNumber}>{order.order_number}</Text>
                                                <View style={styles.icons}>
                                                    <TouchableOpacity
                                                        style={styles.iconButton}
                                                        onPress={() => navigation.navigate('DetailWebView', { orderNumber: order.order_number })}
                                                    >
                                                        <Ionicons name="search" size={20} color="#9ca3af" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.iconButton}
                                                        onPress={() => navigation.navigate('OrderWebView', { orderNumber: order.order_number })}
                                                    >
                                                        <BinocularsIcon size={20} color="#10b981" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            <View style={styles.cardBody}>
                                                {order.preforma_number_purchase && order.preforma_number_purchase !== 'null' && (
                                                    <Text style={styles.textRow}><Text style={styles.label}>{t('OC')}: </Text>{order.preforma_number_purchase}</Text>
                                                )}
                                                {order.sap_number_preformar && order.sap_number_preformar !== 'null' && (
                                                    <Text style={styles.textRow}><Text style={styles.label}>{t('SAP')}: </Text>{order.sap_number_preformar}</Text>
                                                )}
                                                {order.sap_number_preforma_mwt && order.sap_number_preforma_mwt !== 'null' && (
                                                    <Text style={styles.textRow}><Text style={styles.label}>{t('Proforma Muito Work')}: </Text>{order.sap_number_preforma_mwt}</Text>
                                                )}
                                                {order.sap_number_preforma && order.sap_number_preforma !== 'null' && (
                                                    <Text style={styles.textRow}><Text style={styles.label}>{t('Proforma')}: </Text>{order.sap_number_preforma}</Text>
                                                )}
                                                {order.prod_fechai && order.prod_fechai !== 'null' && (
                                                    <Text style={styles.textRow}><Text style={styles.label}>{t('Producción')}: </Text>{order.prod_fechai}</Text>
                                                )}
                                                {order.cust_customer_name && order.cust_customer_name !== 'null' && (
                                                    <Text style={styles.textRow}><Text style={styles.label}>{t('Cliente')}: </Text>{order.cust_customer_name}</Text>
                                                )}
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
                            <Text style={styles.sideMenuTitle}>{t('Filtrar por')}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.filterScroll} showsVerticalScrollIndicator={false}>
                            <Text style={styles.filterCategoryTitle}>{t('Estados')}</Text>
                            <View style={{ marginBottom: 20 }}>
                                {Object.keys(STATUS_FILTERS).map(filter => {
                                    const isChecked = selectedStatusFilters.includes(filter);
                                    return (
                                        <TouchableOpacity
                                            key={filter}
                                            style={styles.filterOption}
                                            onPress={() => toggleStatusFilter(filter)}
                                        >
                                            <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                                                {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
                                            </View>
                                            <Text style={styles.filterOptionText}>{filter}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Operator Filter - Only visible for administrators */}
                            {isAdministrator && (
                                <>
                                    <Text style={styles.filterCategoryTitle}>{t('Operador')}</Text>
                                    <View style={{ marginBottom: 20 }}>
                                        <TouchableOpacity
                                            style={styles.filterOption}
                                            onPress={() => toggleOperatorFilter('0')}
                                        >
                                            <View style={[styles.checkbox, selectedOperator === '0' && styles.checkboxChecked]}>
                                                {selectedOperator === '0' && <Ionicons name="checkmark" size={14} color="#fff" />}
                                            </View>
                                            <Text style={styles.filterOptionText}>{t('Cliente')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.filterOption}
                                            onPress={() => toggleOperatorFilter('1')}
                                        >
                                            <View style={[styles.checkbox, selectedOperator === '1' && styles.checkboxChecked]}>
                                                {selectedOperator === '1' && <Ionicons name="checkmark" size={14} color="#fff" />}
                                            </View>
                                            <Text style={styles.filterOptionText}>Muito Work Limitada</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}

                            <Text style={styles.filterCategoryTitle}>{t('Clientes')}</Text>
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
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        margin: 16,
        paddingHorizontal: 15,
        borderRadius: 12,
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
        color: colors.text,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionCollapsed: {
        marginBottom: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    cardsContainer: {
        gap: 12,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    icons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 12,
        padding: 4,
    },
    cardBody: {},
    textRow: {
        color: colors.subtext,
        fontSize: 14,
        marginBottom: 6,
    },
    label: {
        fontWeight: '600',
        color: colors.subtext,
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
        backgroundColor: colors.card,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: -2,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sideMenuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 16,
    },
    sideMenuTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
    },
    filterCategoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 12,
        marginTop: 8,
    },
    filterScroll: {
        flex: 1,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 6,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterOptionText: {
        fontSize: 15,
        color: colors.subtext,
    },
});
