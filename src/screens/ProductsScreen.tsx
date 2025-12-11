import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Config } from '../constants/Config';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const CARD_WIDTH = (width - 40) / COLUMN_COUNT; // 20px padding total -> 10px each side

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
    files: ProductFile[];
}

export default function ProductsScreen() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (search) {
            const lower = search.toLowerCase();
            setFilteredProducts(products.filter(p =>
                p.product_name.toLowerCase().includes(lower) ||
                p.product_code.toLowerCase().includes(lower)
            ));
        } else {
            setFilteredProducts(products);
        }
    }, [search, products]);

    const fetchProducts = async () => {
        if (!user) return;
        try {
            const response = await axios.post('https://muitowork.com/api-tracking/product.php', {
                keyhash: Config.KEY_HASH,
                keyuser: user.keyuser,
            });

            if (response.data && response.data.success) {
                setProducts(response.data.data);
                setFilteredProducts(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Product }) => {
        // Find first image
        const imageFile = item.files?.find(f => f.file_type === 'product' || f.file_type === 'file');
        const imageUrl = imageFile ? imageFile.file_url : 'https://via.placeholder.com/150';

        return (
            <View style={styles.card}>
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
                        <TouchableOpacity style={styles.viewButton}>
                            <Text style={styles.viewButtonText}>Ver</Text>
                            <Ionicons name="arrow-forward" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
        // Increased height implicit by content, but we can set minHeight if needed
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
        backgroundColor: '#10b981', // Emerald green/Teal
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
});
