import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function OrderWebViewScreen({ route, navigation }: any) {
    const { orderNumber } = route.params;
    const { colors } = useTheme();
    const { user } = useAuth();
    const styles = getStyles(colors);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const webViewUrl = `https://mwt.one/es/?option=com_sppagebuilder&view=page&id=143&order_number=${orderNumber}&user_id=${user?.id || ''}`;

    // JavaScript para ocultar el header y footer de forma más agresiva
    const hideHeaderScript = `
        (function() {
            // Inyectar estilos CSS
            const style = document.createElement('style');
            style.innerHTML = \`
                #sp-header,
                #sp-footer {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    height: 0 !important;
                    overflow: hidden !important;
                    position: absolute !important;
                    top: -9999px !important;
                }
            \`;
            document.head.appendChild(style);
            
            // Función para remover el header y footer directamente del DOM
            function removeElements() {
                const header = document.getElementById('sp-header');
                if (header) {
                    header.style.cssText = 'display: none !important; visibility: hidden !important; height: 0 !important;';
                    header.remove();
                }
                
                const footer = document.getElementById('sp-footer');
                if (footer) {
                    footer.style.cssText = 'display: none !important; visibility: hidden !important; height: 0 !important;';
                    footer.remove();
                }
            }
            
            // Intentar remover inmediatamente
            removeElements();
            
            // Intentar nuevamente después de un delay (por si carga dinámicamente)
            setTimeout(removeElements, 100);
            setTimeout(removeElements, 500);
            setTimeout(removeElements, 1000);
        })();
    `;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    Rastreo: {orderNumber}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* WebView */}
            <WebView
                source={{ uri: webViewUrl }}
                style={styles.webview}
                injectedJavaScript={hideHeaderScript}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setError(true);
                }}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Cargando rastreo...</Text>
                    </View>
                )}
            />

            {/* Error State */}
            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={64} color={colors.subtext} />
                    <Text style={styles.errorTitle}>Error al cargar</Text>
                    <Text style={styles.errorMessage}>
                        No se pudo cargar la página de rastreo
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            setError(false);
                            setLoading(true);
                        }}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Loading Overlay */}
            {loading && !error && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Cargando...</Text>
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
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        flex: 1,
        textAlign: 'center',
    },
    webview: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.text,
    },
    errorContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: colors.subtext,
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
