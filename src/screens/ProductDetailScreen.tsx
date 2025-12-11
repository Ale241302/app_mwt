import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Config } from '../constants/Config';
import { useAuth } from '../context/AuthContext';

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

interface ProductDetail {
    product_id: string;
    product_name: string;
    product_code: string;
    product_sort_price: string;
    product_calzado?: string;
    product_puntera?: string;
    product_antiperforante?: string;
    product_metatarsal?: string;
    product_capellado?: string;
    product_suela?: string;
    product_disipativo?: string;
    product_color?: string;
    product_cierre?: string;
    product_normativa?: string;
    product_segmento?: string;
    product_riesgo?: string;
    product_componentes_reciclados?: string;
    product_cubrepuntera?: string;
    product_plantilla?: string;
    files: ProductFile[];
    variants: Variant[];
}

export default function ProductDetailScreen({ route, navigation }: any) {
    const { productId } = route.params;
    const { user } = useAuth();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [quantities, setQuantities] = useState<Record<string, string>>({}); // variant_id -> quantity
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        fetchProductDetail();
    }, [productId]);

    const fixText = (text: string | undefined) => {
        if (!text) return '';
        // Dictionary of corrections based on user feedback
        const corrections: Record<string, string> = {
            'Produccin': 'Producción',
            'Construccin': 'Construcción',
            'Puncin': 'Punción',
            'Economas': 'Economías',
            'Plastico': 'Plástico',
            'Citoplastico': 'Citoplástico',
            'Estatica': 'Estática',
            'Caida': 'Caída',
            'Quimicos': 'Químicos',
            'Frio': 'Frío',
            'Agricola': 'Agrícola',
            'Electrico': 'Eléctrico',
            'Bota al Tobillo': 'Bota al Tobillo', // Ensure casing if needed, but primarily accents
            // Add other potential matches if observed
        };

        let fixedText = text;
        Object.keys(corrections).forEach(key => {
            // Global replace for the key
            const regex = new RegExp(key, 'g');
            fixedText = fixedText.replace(regex, corrections[key]);
        });
        return fixedText;
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
            Alert.alert('Error', 'Hubo un problema al agregar al carrito.');
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#000" />
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

    return (
        <View style={styles.container}>
            {/* Header with Back Button - Optional if Stack Navigator provides one, but custom is safe */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
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
                                            <Ionicons name="document-text" size={20} color="#fff" style={{ marginRight: 5 }} />
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

                        {product.product_calzado && <View style={styles.specItem}><Text style={styles.specLabel}>Tipo Calzado</Text><Text style={styles.specValue}>{fixText(product.product_calzado)}</Text></View>}
                        {product.product_puntera && <View style={styles.specItem}><Text style={styles.specLabel}>Tipo Puntera</Text><Text style={styles.specValue}>{fixText(product.product_puntera)}</Text></View>}
                        {product.product_antiperforante && <View style={styles.specItem}><Text style={styles.specLabel}>Antiperforante</Text><Text style={styles.specValue}>{fixText(product.product_antiperforante)}</Text></View>}
                        {product.product_metatarsal && <View style={styles.specItem}><Text style={styles.specLabel}>Protector Metatarsal</Text><Text style={styles.specValue}>{fixText(product.product_metatarsal)}</Text></View>}
                        {product.product_capellado && <View style={styles.specItem}><Text style={styles.specLabel}>Capellada</Text><Text style={styles.specValue}>{fixText(product.product_capellado)}</Text></View>}
                        {product.product_suela && <View style={styles.specItem}><Text style={styles.specLabel}>Suela</Text><Text style={styles.specValue}>{fixText(product.product_suela)}</Text></View>}
                        {product.product_disipativo && <View style={styles.specItem}><Text style={styles.specLabel}>Disipativo de Energía</Text><Text style={styles.specValue}>{fixText(product.product_disipativo)}</Text></View>}
                        {product.product_color && <View style={styles.specItem}><Text style={styles.specLabel}>Color</Text><Text style={styles.specValue}>{fixText(product.product_color)}</Text></View>}
                        {product.product_cierre && <View style={styles.specItem}><Text style={styles.specLabel}>Cierre</Text><Text style={styles.specValue}>{fixText(product.product_cierre)}</Text></View>}
                        {product.product_normativa && <View style={styles.specItem}><Text style={styles.specLabel}>Normativa</Text><Text style={styles.specValue}>{fixText(product.product_normativa)}</Text></View>}
                        {product.product_segmento && <View style={styles.specItem}><Text style={styles.specLabel}>Segmento</Text><Text style={styles.specValue}>{fixText(product.product_segmento)}</Text></View>}
                        {product.product_riesgo && <View style={styles.specItem}><Text style={styles.specLabel}>Riesgo</Text><Text style={styles.specValue}>{fixText(product.product_riesgo)}</Text></View>}
                        {product.product_componentes_reciclados && <View style={styles.specItem}><Text style={styles.specLabel}>Materiales Reciclados</Text><Text style={styles.specValue}>{fixText(product.product_componentes_reciclados)}</Text></View>}
                        {product.product_cubrepuntera && <View style={styles.specItem}><Text style={styles.specLabel}>Cubrepuntera</Text><Text style={styles.specValue}>{fixText(product.product_cubrepuntera)}</Text></View>}
                        {product.product_plantilla && <View style={styles.specItem}><Text style={styles.specLabel}>Plantilla Interna</Text><Text style={styles.specValue}>{fixText(product.product_plantilla)}</Text></View>}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        paddingTop: 50, // StatusBar compensation
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
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
        borderColor: '#eee',
        borderRadius: 8,
        overflow: 'hidden',
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
        borderColor: '#eee',
        borderRadius: 4,
        overflow: 'hidden',
    },
    thumbnailSelected: {
        borderColor: '#10b981',
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
        backgroundColor: '#333',
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
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10b981',
    },
    specsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        borderBottomWidth: 2,
        borderBottomColor: '#26d0ce',
        alignSelf: 'flex-start',
    },
    specItem: {
        marginBottom: 8,
    },
    specLabel: {
        fontSize: 10,
        color: '#888',
        fontWeight: 'bold',
    },
    specValue: {
        fontSize: 12,
        color: '#333',
    },
    tableContainer: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f1f1f1',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        alignItems: 'center',
    },
    tableRefTitle: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 14,
        color: '#333',
    },
    tableQtyTitle: {
        width: 60,
        fontWeight: 'bold',
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    rowEven: {
        backgroundColor: '#fff',
    },
    rowOdd: {
        backgroundColor: '#fafafa',
    },
    variantText: {
        flex: 1,
        fontSize: 12,
        color: '#555',
        marginRight: 10,
        flexWrap: 'wrap',
    },
    qtyInput: {
        width: 60,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        textAlign: 'center',
        backgroundColor: '#fff',
        padding: 0,
        color: '#333',
        fontSize: 16,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        elevation: 10,
    },
    addButton: {
        backgroundColor: '#10b981',
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
