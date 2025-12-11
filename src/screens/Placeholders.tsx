import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f2' },
    text: { fontSize: 20, fontWeight: 'bold', color: '#333' }
});

export const OrdersScreen = () => (
    <View style={styles.container}>
        <Text style={styles.text}>Pedidos</Text>
    </View>
);

export const ProductsScreen = () => (
    <View style={styles.container}>
        <Text style={styles.text}>Productos</Text>
    </View>
);

export const CartScreen = () => (
    <View style={styles.container}>
        <Text style={styles.text}>Carrito</Text>
    </View>
);
