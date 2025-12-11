import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen'; // Import the real screen
import ProductsScreen from '../screens/ProductsScreen';

const Tab = createBottomTabNavigator();

const LogoutComponent = () => {
    const { signOut } = useAuth();
    React.useEffect(() => {
        signOut();
    }, []);
    return <View style={{ flex: 1, backgroundColor: '#fff' }}><ActivityIndicator /></View>;
};

export default function MainTabNavigator() {
    const { user } = useAuth();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                headerTitle: user ? `Hola, ${user.name}` : 'MuitoWork',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Pedidos') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Productos') {
                        iconName = focused ? 'cube' : 'cube-outline';
                    } else if (route.name === 'Carrito') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else if (route.name === 'Salir') {
                        iconName = focused ? 'log-out' : 'log-out-outline';
                    } else {
                        iconName = 'alert';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'tomato',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Pedidos" component={OrdersScreen} />
            <Tab.Screen name="Productos" component={ProductsScreen} />
            <Tab.Screen name="Carrito" component={CartScreen} />
            <Tab.Screen name="Salir" component={LogoutComponent} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
}
