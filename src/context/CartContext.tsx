import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Config } from '../constants/Config';
import { useAuth } from './AuthContext';

interface CartContextProps {
    cartCount: number;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextProps>({
    cartCount: 0,
    refreshCart: async () => { },
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [cartCount, setCartCount] = useState(0);

    const refreshCart = async () => {
        if (!user) {
            setCartCount(0);
            return;
        }

        try {
            const response = await axios.post('https://muitowork.com/api-tracking/cart.php', {
                keyhash: Config.KEY_HASH,
                keyuser: user.keyuser,
            });

            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                // Calculate total quantity
                const total = response.data.data.reduce((sum: number, item: any) => {
                    const qty = parseInt(item.cart_product_quantity, 10);
                    return sum + (isNaN(qty) ? 0 : qty);
                }, 0);
                setCartCount(total);
            } else {
                setCartCount(0);
            }
        } catch (error) {
            console.error('Error fetching cart count:', error);
            // Don't reset to 0 on error immediately, maybe keep old value or handle better?
            // For now, if exact fetch fails, we might want to leave it alone or set 0. 
            // Setting 0 is safer UI wise than showing a stale wrong number potentially.
        }
    };

    useEffect(() => {
        refreshCart();
    }, [user]);

    return (
        <CartContext.Provider value={{ cartCount, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
