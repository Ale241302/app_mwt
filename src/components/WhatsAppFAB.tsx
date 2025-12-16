import React from 'react';
import { Image, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const WhatsAppFAB = () => {
    const openWhatsApp = () => {
        const phoneNumber = '+14255170007';
        const message = 'Menu';
        const url = `whatsapp://send?phone=${phoneNumber}&text=${message}`;

        Linking.canOpenURL(url)
            .then((supported) => {
                if (!supported) {
                    console.error("WhatsApp is not installed or cannot be opened");
                } else {
                    return Linking.openURL(url);
                }
            })
            .catch((err) => console.error('An error occurred', err));
    };

    const offset = useSharedValue({ x: 0, y: 0 });
    const start = useSharedValue({ x: 0, y: 0 });

    const pan = Gesture.Pan()
        .onStart(() => {
            start.value = { x: offset.value.x, y: offset.value.y };
        })
        .onUpdate((e) => {
            offset.value = {
                x: start.value.x + e.translationX,
                y: start.value.y + e.translationY,
            };
        })
        .runOnJS(true); // Ensure JS callbacks like onPress work nicely if interop is needed, but mainly for safety.

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offset.value.x },
                { translateY: offset.value.y },
            ],
        };
    });

    return (
        <GestureDetector gesture={pan}>
            <Animated.View style={[styles.container, animatedStyles]}>
                <TouchableOpacity onPress={openWhatsApp} style={styles.button} activeOpacity={0.8}>
                    <Image
                        source={{ uri: 'https://mwt.one/images/whatsapp_logo.png' }}
                        style={styles.image}
                    />
                </TouchableOpacity>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 80, // Initial position
        right: 20,  // Initial position
        zIndex: 1000,
        elevation: 5, // For Android shadow
        shadowColor: '#000', // For iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    button: {
        borderRadius: 30,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
});

export default WhatsAppFAB;
