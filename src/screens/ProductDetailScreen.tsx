import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Config } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface ProductFile {
    file_id: string;
    file_url: string;
    file_type: string;
}

interface VariantCharacteristic {
    characteristic_id: string;
    characteristic_value: string;
}

interface Variant {
    variant_id: string;
    variant_code: string;
    characteristics: VariantCharacteristic[];
}

interface ProductAttribute {
    text: string;
    image_url: string | null;
    class: string | null;
}

interface ProductDetail {
    product_id: string;
    product_name: string;
    product_code: string;
    product_sort_price: string;
    product_calzado?: ProductAttribute[] | string;
    product_puntera?: ProductAttribute[] | string;
    product_antiperforante?: ProductAttribute[] | string;
    product_metatarsal?: ProductAttribute[] | string;
    product_capellado?: ProductAttribute[] | string;
    product_suela?: ProductAttribute[] | string;
    product_disipativo?: ProductAttribute[] | string;
    product_color?: ProductAttribute[] | string;
    product_cierre?: ProductAttribute[] | string;
    product_normativa?: ProductAttribute[] | string;
    product_segmento?: ProductAttribute[] | string;
    product_riesgo?: ProductAttribute[] | string;
    producrt_riesgo?: ProductAttribute[] | string; // API typo compatibility
    product_componentes_reciclados?: ProductAttribute[] | string;
    product_cubrepuntera?: ProductAttribute[] | string;
    product_plantilla?: ProductAttribute[] | string;
    files: ProductFile[];
    variants: Variant[];
}

export default function ProductDetailScreen({ route, navigation }: any) {
    const { productId } = route.params;
    const { user } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [quantities, setQuantities] = useState<Record<string, string>>({}); // variant_id -> quantity
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedSpecText, setSelectedSpecText] = useState<string | null>(null);

    useEffect(() => {
        fetchProductDetail();
    }, [productId]);

    const getAttributeText = (attr: ProductAttribute[] | string | undefined) => {
        if (!attr) return '';
        if (Array.isArray(attr)) {
            return attr.length > 0 ? attr[0].text : '';
        }
        return attr;
    };

    const getAttributeData = (attr: ProductAttribute[] | string | undefined): { url: string, text: string }[] => {
        if (!attr) return [];
        if (Array.isArray(attr)) {
            return attr
                .filter(a => a.image_url && a.image_url.trim() !== '')
                .map(a => ({ url: a.image_url!, text: a.text }));
        }
        return [];
    };

    const fetchProductDetail = async () => {
        if (!user) return;
        try {
            const response = await axios.post('https://muitowork.com/api-tracking/detalleproduct.php', {
                keyhash: Config.KEY_HASH,
                keyuser: user.keyuser,
                product_id: productId,
            });

            if (response.data && response.data.success) {
                const data = response.data.data;
                // Fix API typo mapping
                if (data.producrt_riesgo && !data.product_riesgo) {
                    data.product_riesgo = data.producrt_riesgo;
                }
                setProduct(data);
                // Set initial selected image
                const mainImg = data.files.find((f: any) => f.file_type === 'product' || f.file_type === 'file');
                if (mainImg) setSelectedImage(mainImg.file_url);
            }
        } catch (error) {
            console.error('Error fetching product detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (variantId: string, text: string) => {
        // Allow only numbers
        if (/^\d*$/.test(text)) {
            setQuantities(prev => ({ ...prev, [variantId]: text }));
        }
    };

    const addToCart = async () => {
        if (!user) return;

        const variantsToAdd = Object.keys(quantities).filter(key => {
            const qty = parseInt(quantities[key]);
            return qty > 0;
        });

        if (variantsToAdd.length === 0) {
            Alert.alert('Atención', 'Seleccione al menos una cantidad.');
            return;
        }

        setAddingToCart(true);

        try {
            const netInfo = await AsyncStorage.getItem('last_net_info_status'); // Or use NetInfo hook directly if available context
            // For now assume online or basic failure handling. Real offline logic is in connectivity listener.

            // Basic offline check if we don't have global state here - just try/catch
            for (const variantId of variantsToAdd) {
                const quantity = quantities[variantId];

                // Sequential API call
                const response = await axios.post('https://muitowork.com/api-tracking/agregarcart.php', {
                    keyhash: Config.KEY_HASH,
                    keyuser: user.keyuser,
                    product_id: variantId, // variant_id is the product_id for cart
                    quantity: quantity
                });

                if (response.data && response.data.success) {
                    // Save cart_id to session (AsyncStorage)
                    if (response.data.cart_id) {
                        await AsyncStorage.setItem('@Session:cart_id', response.data.cart_id.toString());
                    }
                } else {
                    console.warn(`Failed to add variant ${variantId}:`, response.data.message);
                }
            }

            Alert.alert('Éxito', 'Productos agregados al carrito.');
            setQuantities({}); // Reset quantities
        } catch (error) {
            console.error('Error adding to cart:', error);
            // Here you might add to offline queue if you had the logic imported
            Alert.alert('Error', 'Hubo un problema al agregar al carrito.');
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.text} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.center}>
                <Text>Producto no encontrado</Text>
            </View>
        );
    }

    // Filter images for gallery
    const images = product.files.filter(f => f.file_type === 'product' || f.file_type === 'file');

    // Collect all unique icons to display
    const iconAttributes = [
        product.product_calzado,
        product.product_puntera,
        product.product_suela,
        product.product_capellado,
        product.product_antiperforante,
        product.product_disipativo,
        product.product_metatarsal,
        product.product_cierre,
        product.product_normativa,
        product.product_segmento,
        product.product_riesgo,
        product.product_componentes_reciclados,
        product.product_cubrepuntera,
        product.product_plantilla,
    ];

    const allIconData: { url: string, text: string }[] = [];
    iconAttributes.forEach(attr => {
        const data = getAttributeData(attr);
        allIconData.push(...data);
    });

    // Deduplicate by URL
    const uniqueIconsMap = new Map<string, string>();
    allIconData.forEach(item => {
        if (!uniqueIconsMap.has(item.url)) {
            uniqueIconsMap.set(item.url, item.text);
        }
    });


    // Helper function for text formatting if needed, otherwise just returns text
    const fixText = (text: string) => {
        // Example: Capitalize first letter, or other formatting
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    return (
        <View style={styles.container}>
            {/* Header with Back Button - Optional if Stack Navigator provides one, but custom is safe */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{product.product_name}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Top Section: Split Columns */}
                <View style={styles.topSection}>
                    {/* Left Column: Gallery */}
                    <View style={styles.leftColumn}>
                        <View style={styles.mainImageContainer}>
                            <Image
                                source={{ uri: selectedImage || 'https://via.placeholder.com/300' }}
                                style={styles.mainImage}
                                resizeMode="contain"
                            />
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailList}>
                            {images.map((img) => (
                                <TouchableOpacity
                                    key={img.file_id}
                                    onPress={() => setSelectedImage(img.file_url)}
                                    style={[styles.thumbnailButton, selectedImage === img.file_url && styles.thumbnailSelected]}
                                >
                                    <Image
                                        source={{ uri: img.file_url }}
                                        style={styles.thumbnail}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* PDF Download Button & Price - Added as per request */}
                        {(() => {
                            const pdfFile = product.files.find(f => f.file_url.endsWith('.pdf'));
                            return (
                                <View style={styles.leftColumnExtras}>
                                    {pdfFile && (
                                        <TouchableOpacity
                                            style={styles.pdfButton}
                                            onPress={() => Linking.openURL(pdfFile.file_url)}
                                        >
                                            <Ionicons name="document-text" size={20} color={colors.background} style={{ marginRight: 5 }} />
                                            <Text style={styles.pdfButtonText}>Descargar Ficha</Text>
                                        </TouchableOpacity>
                                    )}
                                    {product.product_sort_price && (
                                        <Text style={styles.priceText}>
                                            Valor ${parseFloat(product.product_sort_price).toFixed(2)} USD
                                        </Text>
                                    )}
                                </View>
                            );
                        })()}
                    </View>

                    {/* Right Column: Specifications */}
                    <View style={styles.rightColumn}>
                        <Text style={styles.specsTitle}>Especificaciones</Text>

                        <View style={styles.iconsContainer}>
                            {Array.from(uniqueIconsMap.entries()).map(([url, text], index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.iconWrapper, selectedSpecText === fixText(text) && styles.iconWrapperSelected]}
                                    onPress={() => setSelectedSpecText(fixText(text))}
                                >
                                    <Image
                                        source={{ uri: url }}
                                        style={styles.specIcon}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {selectedSpecText && (
                            <View style={styles.selectedSpecContainer}>
                                <Text style={styles.selectedSpecText}>{selectedSpecText}</Text>
                            </View>
                        )}

                        {/* Fallback for Color (usually has no icon but implies visual) - keep as text if desired, or skip */}
                        {getAttributeText(product.product_color) ? (
                            <View style={styles.specItem}>
                                <Text style={styles.specLabel}>Color</Text>
                                <Text style={styles.specValue}>{getAttributeText(product.product_color)}</Text>
                            </View>
                        ) : null}

                    </View>
                </View>

                {/* Variants Table */}
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableRefTitle}>Tallas Marluvas Composite</Text>
                        <Text style={styles.tableQtyTitle}>Cant.</Text>
                    </View>

                    {product.variants.map((variant, index) => {
                        // Assuming first characteristic is the one to display (e.g. BRA 33...)
                        const charValue = variant.characteristics?.[0]?.characteristic_value || variant.variant_code;
                        const isEven = index % 2 === 0;

                        return (
                            <View key={variant.variant_id} style={[styles.tableRow, isEven ? styles.rowEven : styles.rowOdd]}>
                                <Text style={styles.variantText}>{charValue}</Text>
                                <TextInput
                                    style={styles.qtyInput}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={colors.subtext}
                                    value={quantities[variant.variant_id] || ''}
                                    onChangeText={(text) => handleQuantityChange(variant.variant_id, text)}
                                />
                            </View>
                        );
                    })}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.addButton, addingToCart && styles.addButtonDisabled]}
                    onPress={addToCart}
                    disabled={addingToCart}
                >
                    {addingToCart ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.addButtonText}>Añadir a tu pedido</Text>
                    )}
                </TouchableOpacity>
            </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        flex: 1,
        textAlign: 'center',
    },
    scrollContent: {
        padding: 10,
    },
    topSection: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    leftColumn: {
        flex: 1,
        paddingRight: 10,
    },
    rightColumn: {
        flex: 1,
        paddingLeft: 10,
    },
    mainImageContainer: {
        width: '100%',
        aspectRatio: 1,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff', // Images usually need white bg
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    thumbnailList: {
        flexDirection: 'row',
    },
    thumbnailButton: {
        width: 50,
        height: 50,
        marginRight: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    thumbnailSelected: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    leftColumnExtras: {
        marginTop: 15,
        alignItems: 'center',
    },
    pdfButton: {
        backgroundColor: colors.text, // inverse of text? or just dark gray
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginBottom: 10,
        width: '100%',
        justifyContent: 'center',
    },
    pdfButtonText: {
        color: colors.background, // inverse text color
        fontWeight: 'bold',
        fontSize: 12,
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    specsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: colors.text,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        alignSelf: 'flex-start',
    },
    specItem: {
        marginBottom: 8,
    },
    specLabel: {
        fontSize: 10,
        color: colors.subtext,
        fontWeight: 'bold',
    },
    specValue: {
        fontSize: 12,
        color: colors.text,
    },
    tableContainer: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.tint,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'center',
    },
    tableRefTitle: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 14,
        color: colors.text,
    },
    tableQtyTitle: {
        width: 60,
        fontWeight: 'bold',
        fontSize: 14,
        color: colors.text,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    rowEven: {
        backgroundColor: colors.card,
    },
    rowOdd: {
        backgroundColor: colors.background,
    },
    iconsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        marginRight: 8,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconWrapperSelected: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    specIcon: {
        width: 36,
        height: 36,
    },
    selectedSpecContainer: {
        marginBottom: 10,
        backgroundColor: colors.card,
        padding: 5,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    selectedSpecText: {
        fontSize: 12,
        color: colors.text,
        fontWeight: 'bold',
    },
    variantText: {
        flex: 1,
        fontSize: 12,
        color: colors.text,
        marginRight: 10,
        flexWrap: 'wrap',
    },
    qtyInput: {
        width: 60,
        height: 40,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
        textAlign: 'center',
        backgroundColor: colors.card,
        padding: 0,
        color: colors.text,
        fontSize: 16,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        elevation: 10,
    },
    addButton: {
        backgroundColor: colors.primary,
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    addButtonDisabled: {
        backgroundColor: '#a7f3d0',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
