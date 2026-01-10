import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Config } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const { t } = useLanguage();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('Error'), t('Por favor ingrese email y contraseña'));
            return;
        }
        setLoading(true);
        const result = await signIn(email, password);
        setLoading(false);
        if (!result.success) {
            Alert.alert(t('Error'), result.message);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: Config.IMAGES.BACKGROUND_BOTTOM }}
                style={styles.backgroundImage}
                resizeMode="cover"
            />
            <Image
                source={{ uri: Config.IMAGES.BACKGROUND_TOP }}
                style={styles.backgroundImageOverlay}
                resizeMode="cover"
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.contentContainer}
            >
                <Image
                    source={{ uri: Config.IMAGES.LOGO_LOGIN }}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder={t('Correo electrónico')}
                        placeholderTextColor="#rgba(255,255,255,0.7)"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder={t('Contraseña')}
                            placeholderTextColor="#rgba(255,255,255,0.7)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={24}
                                color="rgba(255,255,255,0.7)"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.buttonText}>{t('Iniciar Sesión')}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
        zIndex: 0,
    },
    backgroundImageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
        zIndex: 1,
    },
    contentContainer: {
        flex: 1,
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 50,
    },
    formContainer: {
        width: '100%',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 15,
        color: '#fff',
        marginBottom: 15,
    },
    passwordContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
        height: 50,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 15,
        color: '#fff',
    },
    eyeIcon: {
        padding: 10,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
