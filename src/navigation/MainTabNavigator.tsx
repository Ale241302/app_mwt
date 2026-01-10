import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartScreen from '../screens/CartScreen';
import DashboardWebViewScreen from '../screens/DashboardWebViewScreen';
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

import DashboardIcon from '../components/DashboardIcon';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';
import WhatsAppFAB from '../components/WhatsAppFAB';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function MainTabNavigator() {
    const { user } = useAuth();
    const { colors, theme } = useTheme();
    const { cartCount } = useCart();
    const { t } = useLanguage();

    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: true,
                    headerTitle: user ? `${t('Hola')}, ${user.name}` : 'MuitoWork',
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <LanguageSelector />
                            <ThemeToggle />
                        </View>
                    ),
                    headerStyle: {
                        backgroundColor: colors.card,
                        shadowColor: 'transparent',
                        elevation: 0,
                    },
                    headerTintColor: colors.text,
                    tabBarStyle: {
                        backgroundColor: colors.card,
                        borderTopColor: colors.border,
                    },
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.subtext,
                    headerTitleStyle: {
                        color: colors.text,
                    },
                    tabBarIcon: ({ focused, color, size }) => {
                        // Special case for Dashboard - use custom SVG icon
                        if (route.name === 'Dashboard') {
                            return <DashboardIcon size={size} color={color} focused={focused} />;
                        }

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

                        return (
                            <View>
                                <Ionicons name={iconName} size={size} color={color} />
                                {route.name === 'Carrito' && cartCount > 0 && (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            right: -6,
                                            top: -3,
                                            backgroundColor: '#10b981',
                                            borderRadius: 10,
                                            width: 16,
                                            height: 16,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: '#fff',
                                                fontSize: 10,
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {cartCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    },
                    tabBarLabel: ({ focused, color }) => {
                        const label = t(route.name);
                        return (
                            <Text
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                style={{
                                    color,
                                    fontSize: 10,
                                    fontWeight: focused ? '600' : '400',
                                    textAlign: 'center',
                                    width: '100%'
                                }}
                            >
                                {label}
                            </Text>
                        );
                    },
                })}
            >
                <Tab.Screen name="Pedidos" component={OrdersScreen} />
                <Tab.Screen name="Productos" component={ProductsScreen} />
                <Tab.Screen
                    name="Dashboard"
                    component={DashboardWebViewScreen}
                    listeners={({ navigation }) => ({
                        tabPress: (e) => {
                            if (navigation.isFocused()) {
                                // If already on Dashboard, trigger a reset
                                e.preventDefault(); // Stop default behavior (though staying on tab is default)
                                navigation.setParams({ resetTs: Date.now() });
                            }
                        },
                    })}
                />
                <Tab.Screen
                    name="Carrito"
                    component={CartScreen}
                    listeners={({ navigation }) => ({
                        tabPress: (e) => {
                            if (navigation.isFocused()) {
                                e.preventDefault();
                                navigation.setParams({ refreshTs: Date.now() });
                            }
                        },
                    })}
                />
                <Tab.Screen name="Salir" component={LogoutComponent} options={{ headerShown: false }} />
            </Tab.Navigator>
            <WhatsAppFAB />
        </View>
    );
}
