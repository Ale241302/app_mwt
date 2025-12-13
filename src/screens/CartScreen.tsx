import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Config } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface CartProduct {
    cart_product_id: string;
    product_id: string;
    cart_product_quantity: string;
    product_type: string;
    product_parent_id: string;
    product_name: string;
    product_code: string;
    product_sort_price: string;
    product_image: string;
    variant_code: string;
    characteristics: {
        characteristic_id: string;
        characteristic_value: string;
        characteristic_alias: string;
    }[];
    subtotal: string;
}

interface GroupedCartItem {
    product_code: string;
    product_name: string;
    product_image: string;
    product_parent_id: string;
    total_quantity: number;
    total_subtotal: number;
    items: CartProduct[];
}

export default function CartScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const [cartData, setCartData] = useState<CartProduct[]>([]);
    const [groupedCart, setGroupedCart] = useState<GroupedCartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [totalAmount, setTotalAmount] = useState('0.00');
    const [cartId, setCartId] = useState<string | null>(null);
    const [updatingQuantity, setUpdatingQuantity] = useState<string | null>(null);
    const [buyingNow, setBuyingNow] = useState(false);

    // Estado temporal para edición de cantidades
    const [tempQuantities, setTempQuantities] = useState<Record<string, string>>({});

    const fetchCart = async () => {
        if (!user) return;
        try {
            const response = await axios.post('https://muitowork.com/api-tracking/cart.php', {
                keyhash: Config.KEY_HASH,
                keyuser: user.keyuser,
            });

            if (response.data && response.data.success) {
                setCartData(response.data.data);

                // Fix NaN issue: ensure totalAmount is valid
                const total = parseFloat(response.data.total_amount);
                setTotalAmount(isNaN(total) ? '0.00' : total.toFixed(2));

                // Save cart_id
                if (response.data.cart_id) {
                    setCartId(response.data.cart_id);
                    await AsyncStorage.setItem('@Session:cart_id', response.data.cart_id.toString());
                }

                processCartData(response.data.data);
            } else {
                setCartData([]);
                setGroupedCart([]);
                setTotalAmount('0.00');
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            Alert.alert('Error', 'No se pudo cargar el carrito');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const processCartData = (data: CartProduct[]) => {
        const groups: Record<string, GroupedCartItem> = {};

        data.forEach(item => {
            if (!groups[item.product_code]) {
                groups[item.product_code] = {
                    product_code: item.product_code,
                    product_name: item.product_name,
                    product_image: item.product_image,
                    product_parent_id: item.product_parent_id,
                    total_quantity: 0,
                    total_subtotal: 0,
                    items: []
                };
            }

            groups[item.product_code].items.push(item);
            groups[item.product_code].total_quantity += parseInt(item.cart_product_quantity);

            const subtotal = parseFloat(item.subtotal);
            groups[item.product_code].total_subtotal += isNaN(subtotal) ? 0 : subtotal;
        });

        setGroupedCart(Object.values(groups));
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCart();
    };

    const handleQuantityChange = async (productId: string, newQuantity: string) => {
        if (!user || !cartId) return;

        const quantity = parseInt(newQuantity);
        if (isNaN(quantity) || quantity < 1) return;

        setUpdatingQuantity(productId);

        const updatedCartData = cartData.map(item => {
            if (item.product_id === productId) {
                const newSubtotal = parseFloat(item.product_sort_price) * quantity;
                return {
                    ...item,
                    cart_product_quantity: quantity.toString(),
                    subtotal: newSubtotal.toFixed(2)
                };
            }
            return item;
        });

        processCartData(updatedCartData);
        setCartData(updatedCartData);

        const newTotal = updatedCartData.reduce((sum, item) => {
            return sum + parseFloat(item.subtotal || '0');
        }, 0);
        setTotalAmount(newTotal.toFixed(2));

        try {
            const response = await axios.post('https://muitowork.com/api-tracking/updatecart.php', {
                keyhash: Config.KEY_HASH,
                keyuser: user.keyuser,
                product_id: productId,
                cart_id: cartId,
                quantity: quantity
            });

            if (response.data && response.data.success) {
                fetchCart();
            } else {
                Alert.alert('Error', response.data.message || 'No se pudo actualizar la cantidad');
                fetchCart();
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            Alert.alert('Error', 'Falló la actualización de cantidad');
            fetchCart();
        } finally {
            setUpdatingQuantity(null);
        }
    };

    // Manejar cambio temporal (permite borrar)
    const handleTempQuantityChange = (productId: string, text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        setTempQuantities(prev => ({
            ...prev,
            [productId]: numericValue
        }));
    };

    // Validar al perder foco
    const handleQuantityBlur = (productId: string, originalQuantity: string) => {
        const tempValue = tempQuantities[productId];

        // Si está vacío o es inválido, restaurar valor original
        if (!tempValue || parseInt(tempValue) < 1) {
            setTempQuantities(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
            return;
        }

        // Si cambió, actualizar en el servidor
        if (tempValue !== originalQuantity) {
            handleQuantityChange(productId, tempValue);
        }

        // Limpiar estado temporal
        setTempQuantities(prev => {
            const newState = { ...prev };
            delete newState[productId];
            return newState;
        });
    };

    const handleDelete = (productId: string) => {
        Alert.alert(
            'Eliminar producto',
            '¿Estás seguro de que deseas eliminar este producto del carrito?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => performDelete(productId)
                }
            ]
        );
    };

    const performDelete = async (productId: string) => {
        if (!user || !cartId) return;

        try {
            const response = await axios.post('https://muitowork.com/api-tracking/eliminarproductcart.php', {
                keyhash: Config.KEY_HASH,
                keyuser: user.keyuser,
                product_id: productId,
                cart_id: cartId
            });

            if (response.data && response.data.success) {
                Alert.alert('Eliminado', response.data.message);
                fetchCart();
            } else {
                Alert.alert('Error', response.data.message || 'No se pudo eliminar');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            Alert.alert('Error', 'Falló la conexión al eliminar');
        }
    };

    const handleProductPress = (productParentId: string) => {
        navigation.navigate('ProductDetail' as never, { productId: productParentId } as never);
    };

    const handleBuyNow = async () => {
        if (!user || !cartId) {
            Alert.alert('Error', 'No se encontró información del carrito');
            return;
        }

        if (groupedCart.length === 0) {
            Alert.alert('Carrito vacío', 'Agrega productos antes de comprar');
            return;
        }

        setBuyingNow(true);

        try {
            const response = await axios.post('https://muitowork.com/api-tracking/comprarproduct.php', {
                keyhash: Config.KEY_HASH,
                keyuser: user.keyuser,
                cart_id: cartId
            });

            if (response.data && response.data.success) {
                Alert.alert('Éxito', response.data.message || 'Compra realizada con éxito');
                fetchCart();
            } else {
                Alert.alert('Error', response.data.message || 'No se pudo completar la compra');
            }
        } catch (error) {
            console.error('Error completing purchase:', error);
            Alert.alert('Error', 'Falló la conexión al procesar la compra');
        } finally {
            setBuyingNow(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tu Pedido</Text>
                <Text style={styles.headerTotal}>Total: ${totalAmount}</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {groupedCart.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={64} color={colors.subtext} />
                        <Text style={styles.emptyText}>Tu carrito está vacío</Text>
                    </View>
                ) : (
                    groupedCart.map((group) => (
                        <View key={group.product_code} style={styles.groupCard}>
                            <TouchableOpacity
                                style={styles.groupHeader}
                                onPress={() => handleProductPress(group.product_parent_id)}
                                activeOpacity={0.7}
                            >
                                <Image source={{ uri: group.product_image }} style={styles.groupImage} resizeMode="contain" />
                                <View style={styles.groupInfo}>
                                    <Text style={styles.groupName}>{group.product_name}</Text>
                                    <Text style={styles.groupCode}>SKU: {group.product_code}</Text>
                                    <View style={styles.groupStats}>
                                        <Text style={styles.groupStatText}>Cant Total: {group.total_quantity}</Text>
                                        <Text style={styles.groupStatText}>Subtotal: ${group.total_subtotal.toFixed(2)}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.variantsList}>
                                {group.items.map((item) => (
                                    <View key={item.cart_product_id} style={styles.variantRow}>
                                        <View style={styles.variantInfo}>
                                            <Text style={styles.variantText}>
                                                {item.characteristics[0]?.characteristic_value || 'Variante'}
                                            </Text>
                                            <Text style={styles.variantSubtext}>
                                                ${parseFloat(item.product_sort_price).toFixed(2)} un.
                                            </Text>
                                        </View>

                                        <View style={styles.actionsContainer}>
                                            <TextInput
                                                style={styles.qtyInput}
                                                value={
                                                    tempQuantities[item.product_id] !== undefined
                                                        ? tempQuantities[item.product_id]
                                                        : item.cart_product_quantity
                                                }
                                                keyboardType="numeric"
                                                maxLength={3}
                                                placeholder="0"
                                                onChangeText={(text) => handleTempQuantityChange(item.product_id, text)}
                                                onBlur={() => handleQuantityBlur(item.product_id, item.cart_product_quantity)}
                                                editable={updatingQuantity !== item.product_id}
                                            />

                                            <TouchableOpacity
                                                onPress={() => handleDelete(item.product_id)}
                                                style={styles.deleteButton}
                                            >
                                                <Ionicons name="close" size={20} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {groupedCart.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.buyButton, buyingNow && styles.buyButtonDisabled]}
                        onPress={handleBuyNow}
                        disabled={buyingNow}
                    >
                        {buyingNow ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buyButtonText}>Comprar</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
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
        padding: 20,
        backgroundColor: colors.card,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    headerTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    scrollContent: {
        padding: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: colors.subtext,
    },
    groupCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    groupHeader: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: colors.tint,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    groupImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: colors.background,
    },
    groupInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    groupName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    groupCode: {
        fontSize: 12,
        color: colors.subtext,
        marginBottom: 4,
    },
    groupStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    groupStatText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primary,
    },
    variantsList: {
        padding: 12,
    },
    variantRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    variantInfo: {
        flex: 1,
        paddingRight: 10,
    },
    variantText: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 2,
    },
    variantSubtext: {
        fontSize: 12,
        color: colors.subtext,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyInput: {
        width: 50,
        height: 32,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        textAlign: 'center',
        textAlignVertical: 'center',
        marginRight: 8,
        fontSize: 14,
        color: colors.text,
        backgroundColor: colors.card,
        paddingHorizontal: 4,
        paddingVertical: 0,
        lineHeight: 16,
    },
    deleteButton: {
        padding: 6,
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
    buyButton: {
        backgroundColor: colors.primary,
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    buyButtonDisabled: {
        backgroundColor: '#a7f3d0', // Maybe use a lighter primary from palette if available, but hardcoded is ok for now or make opacity
        opacity: 0.6,
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
