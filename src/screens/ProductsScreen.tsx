import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Config } from '../constants/Config';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const CARD_WIDTH = (width - 40) / COLUMN_COUNT;

interface ProductFile {
    file_url: string;
    file_type: string;
}

interface Product {
    product_id: string;
    product_name: string;
    product_code: string;
    product_sort_price: string;
    product_calzado?: string;
    product_capellado?: string;
    product_plantilla?: string;
    product_puntera?: string;
    product_disipativo?: string;
    product_segmento?: string;
    product_riesgo?: string;
    product_suela?: string;
    files: ProductFile[];
}

// Map user friendly names to keys
const FILTER_CATEGORIES = [
    { label: 'Planilla', key: 'product_plantilla' },
    { label: 'Calzados', key: 'product_calzado' },
    { label: 'Capellada', key: 'product_capellado' },
    { label: 'Punteras', key: 'product_puntera' },
    { label: 'Riesgos', key: 'product_riesgo' },
    { label: 'Suela', key: 'product_suela' },
];

export default function ProductsScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Filter State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [search, selectedFilters, products]);

    const fetchProducts = async () => {
        if (!user) return;
        try {
            const response = await axios.post('https://muitowork.com/api-tracking/product.php', {
                keyhash: Config.KEY_HASH,
                keyuser: user.keyuser,
            });

            if (response.data && response.data.success) {
                setProducts(response.data.data);
                // filteredProducts set by useEffect
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = products;

        // 1. Text Search
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(p =>
                p.product_name.toLowerCase().includes(lower) ||
                p.product_code.toLowerCase().includes(lower)
            );
        }

        // 2. Category Filters
        // If any checkbox is selected in a category, the product must match one of the selected values (OR logic within category).
        // It must match across categories (AND logic between categories).
        Object.keys(selectedFilters).forEach(key => {
            const selectedValues = selectedFilters[key];
            if (selectedValues.length > 0) {
                result = result.filter(p => {
                    // @ts-ignore - dynamic key access
                    const productValue = p[key];
                    if (!productValue) return false;
                    // Exact match logic. Some fields might be comma separated in future, but assuming exact for now.
                    return selectedValues.includes(productValue);
                });
            }
        });

        setFilteredProducts(result);
    };

    const toggleFilter = (categoryKey: string, value: string) => {
        setSelectedFilters(prev => {
            const current = prev[categoryKey] || [];
            if (current.includes(value)) {
                return { ...prev, [categoryKey]: current.filter(v => v !== value) };
            } else {
                return { ...prev, [categoryKey]: [...current, value] };
            }
        });
    };

    const getUniqueValues = (key: string) => {
        // @ts-ignore
        const values = products.map(p => p[key]).filter(v => v); // filter null/undefined/empty
        return Array.from(new Set(values));
    };

    const renderItem = ({ item }: { item: Product }) => {
        const imageFile = item.files?.find(f => f.file_type === 'product' || f.file_type === 'file');
        const imageUrl = imageFile ? imageFile.file_url : 'https://via.placeholder.com/150';

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.product_id })}
                activeOpacity={0.9}
            >
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.nameText} numberOfLines={2}>{item.product_name}</Text>
                    <Text style={styles.codeText}>SKU: {item.product_code}</Text>

                    {item.product_calzado ? <Text style={styles.detailText} numberOfLines={1}>{item.product_calzado}</Text> : null}
                    {item.product_capellado ? <Text style={styles.detailText} numberOfLines={1}>{item.product_capellado}</Text> : null}

                    <View style={styles.footerRow}>
                        {item.product_sort_price && (
                            <Text style={styles.price}>${parseFloat(item.product_sort_price).toFixed(2)}</Text>
                        )}
                        <TouchableOpacity
                            style={styles.viewButton}
                            onPress={() => navigation.navigate('ProductDetail', { productId: item.product_id })}
                        >
                            <Text style={styles.viewButtonText}>Ver</Text>
                            <Ionicons name="arrow-forward" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
                <TextInput
                    placeholder="Buscar productos..."
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                />
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="filter" size={24} color="#10b981" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredProducts}
                renderItem={renderItem}
                keyExtractor={item => item.product_id}
                numColumns={COLUMN_COUNT}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
            />

            {/* Side Menu Filter Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    {/* Invisible pressable area to close onclick outside not strictly requested but good UX. 
                        User asked for side menu explicitly. 
                    */}
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />

                    <View style={styles.sideMenu}>
                        <View style={styles.sideMenuHeader}>
                            <Text style={styles.sideMenuTitle}>Filtrar por</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.filterScroll} showsVerticalScrollIndicator={false}>
                            {FILTER_CATEGORIES.map(cat => {
                                const options = getUniqueValues(cat.key);
                                if (options.length === 0) return null; // Don't show empty categories

                                return (
                                    <View key={cat.key} style={styles.filterCategoryContainer}>
                                        <Text style={styles.filterCategoryTitle}>{cat.label}</Text>
                                        {options.map((option: any) => {
                                            const isChecked = selectedFilters[cat.key]?.includes(option);
                                            return (
                                                <TouchableOpacity
                                                    key={option}
                                                    style={styles.filterOption}
                                                    onPress={() => toggleFilter(cat.key, option)}
                                                >
                                                    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                                                        {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
                                                    </View>
                                                    <Text style={styles.filterOptionText}>{option}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 5,
        minHeight: 280,
    },
    imageContainer: {
        height: 140,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        padding: 10,
        backgroundColor: '#fff',
        flex: 1,
        justifyContent: 'space-between',
    },
    nameText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    codeText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#666',
        marginBottom: 4,
    },
    detailText: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10b981',
    },
    viewButton: {
        backgroundColor: '#10b981',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    viewButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 4,
    },
    // Modal Styles
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
        width: width * 0.75, // 75% width side menu
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
    filterScroll: {
        flex: 1,
    },
    filterCategoryContainer: {
        marginBottom: 20,
    },
    filterCategoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#26d0ce',
        marginBottom: 10,
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
