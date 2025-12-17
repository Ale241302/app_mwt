import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, FeColorMatrix, Filter, Image as SvgImage } from 'react-native-svg';
import BinocularsIcon from '../components/BinocularsIcon';
import { Config } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';


const { width, height } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const CARD_WIDTH = (width - 40) / COLUMN_COUNT;


interface ProductFile {
    file_url: string;
    file_type: string;
}


interface ProductAttribute {
    text: string;
    image_url: string | null;
    class: string | null;
}


interface Product {
    product_id: string;
    product_name: string;
    product_code: string;
    product_sort_price: string;
    product_calzado?: ProductAttribute[];
    product_capellado?: ProductAttribute[];
    product_plantilla?: ProductAttribute[];
    product_puntera?: ProductAttribute[];
    product_disipativo?: ProductAttribute[];
    product_segmento?: ProductAttribute[];
    producrt_riesgo?: ProductAttribute[]; // Note: matching JSON key 'producrt_riesgo'
    product_suela?: ProductAttribute[];
    files: ProductFile[];
}


// Map user friendly names to keys
const FILTER_CATEGORIES = [
    { label: 'Planilla', key: 'product_plantilla' },
    { label: 'Calzados', key: 'product_calzado' },
    { label: 'Capellada', key: 'product_capellado' },
    { label: 'Punteras', key: 'product_puntera' },
    { label: 'Riesgos', key: 'producrt_riesgo' }, // Fixed key to match JSON
    { label: 'Suela', key: 'product_suela' },
];

/**
 * A helper component to render the attribute icon.
 * In Dark Mode, it applies a ColorMatrix filter to:
 * 1. Turn Black lines -> White
 * 2. Keep Green fills -> Green
 */
const AttributeIcon = ({ uri, isDark, style }: { uri: string; isDark: boolean; style: any }) => {
    if (!isDark) {
        return <Image source={{ uri }} style={style} resizeMode="contain" />;
    }

    // Matrix to map:
    // Black(0,0,0) -> White(1,1,1)
    // Green(0,1,0) -> Green(0,1,0)
    // White(1,1,1) -> White(1,1,1)
    // Logic: R' = R - G + 1, G' = 1, B' = B - G + 1
    const colorMatrix = [
        1, -1, 0, 0, 1, // R' = R - G + 1
        0, 0, 0, 0, 1,  // G' = 1 (Force Green/White saturation)
        0, -1, 1, 0, 1, // B' = B - G + 1
        0, 0, 0, 1, 0   // A' = A
    ];

    return (
        <Svg width={18} height={18} style={style}>
            <Defs>
                <Filter id="darkModeFilter">
                    <FeColorMatrix type="matrix" values={colorMatrix.join(' ')} />
                </Filter>
            </Defs>
            <SvgImage
                href={{ uri }}
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid meet"
                filter="url(#darkModeFilter)"
            />
        </Svg>
    );
};


export default function ProductsScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { colors, theme } = useTheme();
    // Re-calculate styles when theme changes isn't automatic with this pattern unless we pass theme, 
    // but colors updates.
    // However, styles object is constant for valid lifecycle. 
    // We used to rely on inline styles for dark mode overrides.
    const styles = getStyles(colors);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const isDark = theme === 'dark';

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

    const getAttributeText = (attr: ProductAttribute[] | undefined) => {
        if (!attr || !Array.isArray(attr) || attr.length === 0) return '';
        return attr[0].text || '';
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
        Object.keys(selectedFilters).forEach(key => {
            const selectedValues = selectedFilters[key];
            if (selectedValues.length > 0) {
                result = result.filter(p => {
                    // @ts-ignore - dynamic key access
                    const productAttrs = p[key] as ProductAttribute[] | undefined;
                    if (!productAttrs || !Array.isArray(productAttrs)) return false;

                    // Check if any of the product's attribute texts are in the selected values
                    return productAttrs.some(attr => selectedValues.includes(attr.text));
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
        const allValues = products.flatMap(p => {
            // @ts-ignore
            const val = p[key] as ProductAttribute[] | undefined;
            if (Array.isArray(val)) return val.map(v => v.text);
            return [];
        });
        return Array.from(new Set(allValues.filter(v => v))).sort();
    };

    const getAttributeImage = (attr: ProductAttribute[] | undefined) => {
        if (!attr || !Array.isArray(attr) || attr.length === 0) return null;
        return attr[0].image_url;
    };

    const renderItem = ({ item }: { item: Product }) => {
        const imageFile = item.files?.find(f => f.file_type === 'product' || f.file_type === 'file');
        const imageUrl = imageFile ? imageFile.file_url : 'https://via.placeholder.com/150';

        const calzadoImg = getAttributeImage(item.product_calzado);
        const capelladoImg = getAttributeImage(item.product_capellado);
        const punteraImg = getAttributeImage(item.product_puntera);
        const suelaImg = getAttributeImage(item.product_suela);

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

                    <View style={styles.iconRow}>
                        {calzadoImg && (
                            <View style={[styles.iconWrapper, isDark && { backgroundColor: 'transparent', borderWidth: 0 }]}>
                                <AttributeIcon uri={calzadoImg} isDark={isDark} style={styles.attributeIcon} />
                            </View>
                        )}
                        {capelladoImg && (
                            <View style={[styles.iconWrapper, isDark && { backgroundColor: 'transparent', borderWidth: 0 }]}>
                                <AttributeIcon uri={capelladoImg} isDark={isDark} style={styles.attributeIcon} />
                            </View>
                        )}
                        {punteraImg && (
                            <View style={[styles.iconWrapper, isDark && { backgroundColor: 'transparent', borderWidth: 0 }]}>
                                <AttributeIcon uri={punteraImg} isDark={isDark} style={styles.attributeIcon} />
                            </View>
                        )}
                        {suelaImg && (
                            <View style={[styles.iconWrapper, isDark && { backgroundColor: 'transparent', borderWidth: 0 }]}>
                                <AttributeIcon uri={suelaImg} isDark={isDark} style={styles.attributeIcon} />
                            </View>
                        )}
                    </View>

                    <View style={styles.footerRow}>
                        {item.product_sort_price && (
                            <Text style={styles.price}>${parseFloat(item.product_sort_price).toFixed(2)}</Text>
                        )}
                        <TouchableOpacity
                            style={{ marginLeft: 'auto', padding: 8 }}
                            onPress={() => navigation.navigate('ProductDetail', { productId: item.product_id })}
                        >
                            <BinocularsIcon size={24} color="#10b981" />
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
                <Ionicons name="search" size={20} color={colors.subtext} style={{ marginRight: 10 }} />
                <TextInput
                    placeholder="Buscar productos..."
                    placeholderTextColor={colors.subtext}
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                />
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="filter" size={24} color={colors.primary} />
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
                                <Ionicons name="close" size={24} color={colors.text} />
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


const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        color: colors.text,
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
        backgroundColor: colors.card,
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
        backgroundColor: colors.card,
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
        backgroundColor: colors.card,
        flex: 1,
        justifyContent: 'space-between',
    },
    nameText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    codeText: {
        fontSize: 12,
        fontWeight: '400',
        color: colors.subtext,
        marginBottom: 4,
    },
    detailText: {
        fontSize: 12,
        color: colors.subtext,
        marginBottom: 2,
    },
    iconRow: {
        flexDirection: 'row',
        marginTop: 5,
        marginBottom: 5,
        alignItems: 'center',
    },
    attributeIcon: {
        width: 18,
        height: 18,
    },
    iconWrapper: {
        width: 26,
        height: 26,
        marginRight: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
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
        color: colors.primary,
    },
    viewButton: {
        backgroundColor: colors.primary,
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
        backgroundColor: colors.card,
        padding: 20,
    },
    sideMenuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 10,
    },
    sideMenuTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
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
        color: colors.primary,
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
        borderColor: colors.border,
        borderRadius: 4,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterOptionText: {
        fontSize: 14,
        color: colors.subtext,
    },
});