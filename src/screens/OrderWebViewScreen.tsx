import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { WebView } from 'react-native-webview';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function OrderWebViewScreen({ route, navigation }: any) {
    const { orderNumber } = route.params;
    const { colors, theme } = useTheme();
    const { user } = useAuth();
    const styles = getStyles(colors);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const webViewRef = useRef<WebView>(null);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX } = event.nativeEvent;

            // Swipe Left (translationX < 0) -> Go Back
            if (translationX < -50) {
                if (canGoBack && webViewRef.current) {
                    webViewRef.current.goBack();
                }
            }
            // Swipe Right (translationX > 0) -> Go Forward
            else if (translationX > 50) {
                if (canGoForward && webViewRef.current) {
                    webViewRef.current.goForward();
                }
            }
        }
    };

    const webViewUrl = `https://mwt.one/es/?option=com_sppagebuilder&view=page&id=143&order_number=${orderNumber}&user_id=${user?.id || ''}`;

    const injectedJavaScript = React.useMemo(() => {
        // Solo inyectar CSS si el modo oscuro está activo
        const darkModeCSS = `
            :root {
                --mwt-primary: ${colors.primary};
                --mwt-primary-2: ${colors.primary};
                --mwt-deep: ${colors.text}; /* Para textos en dark mode */
                --mwt-border: ${colors.border};
                --mwt-bg: ${colors.card};
                --mwt-text-muted: ${colors.subtext};
                --mwt-shadow: none;
                --mwt-danger: #ef4444;
            }

            body {
                background-color: ${colors.background} !important;
                color: ${colors.text} !important;
            }

            /* Container Overrides */
            #section-id-b8d672c4-9d06-4327-b643-ebd1a5483357,
            .rastreo-container {
                background: ${colors.background} !important;
                 padding: 0!important;
            }

            .rastreo-inner {
                background-color:${colors.background} !important;
                color: ${colors.text} !important;
                box-shadow: none !important;
                border: 1px solid ${colors.border} !important;
                 border-radius: 0px!important;
            }

            /* Status Icons & Labels */
            .status-label {
                color: #fff !important;
            }
            .status-item:hover .status-label, 
            .status-item.active .status-label {
                color: ${colors.primary} !important; 
            }

            /* Forms */
            .form-label {
                color: #fff !important;
            }
            
            .form-control {
                background-color: #202938 !important;
                color: #9da6b5 !important;
                border: 1px solid #313a49 !important;
            }
            .form-control:focus {
                border-color: ${colors.primary} !important;
            }
            
            /* Buttons */
            .btn {
                 color: #fff !important;
            }
            .btn-danger {
                background-color: #ef4444 !important;
            }
            .btn-dashboard, .btn-siguiente {
                background-color: ${colors.primary} !important;
            }
            .btn-guardar {
                background-color: ${colors.border} !important; /* Darker bg for secondary action */
                color: ${colors.text} !important;
            }
            
            /* Upload Zone */
            .upload-zone {
                background-color: ${colors.background} !important;
                border-color: ${colors.primary} !important;
                color: ${colors.text} !important;
            }
            .upload-title, .upload-meta {
                color: ${colors.text} !important;
            }

            /* Radio Group */
            .radio-inline {
                color: ${colors.text} !important;
            }
            .radio-with-icon {
                background-color: #fff !important;
                border-color: ${colors.border} !important;
            }
            
            /* Ocultar header/footer */
            #sp-header, #sp-footer {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                position: absolute !important;
                top: -9999px !important;
            }
                .btn.btn-home, .btn-back {
       display: none  !important;
  }
       .btn-dashboard{
       display: none  !important;
  }
       div.preforma-preview a{
       background-color: #fff !important;
  }
       /* Convierte los iconos de status a blanco */
.status-icon.icon-vacio {
    filter: brightness(0) invert(1);
}
    /* Opción 1: Eliminar bordes izquierdos */
.status-icon.icon-vacio,
.status-icon.icon-vacio::before,
.status-icon.icon-vacio::after {
    border-left: none !important;
    border: none !important;
}

/* Opción 2: Si es del contenedor padre */
.status-icon {
    border-left: none !important;
}

/* Opción 3: Si hay un pseudo-elemento causando la línea */
.status-icon::before,
.status-icon::after {
    display: none !important;
}

/* Opción 4: Eliminar cualquier outline o box-shadow */
.status-icon.icon-vacio {
    outline: none !important;
    box-shadow: none !important;
}


        `;
        // CSS para modo claro (Light Mode)
        const lightModeCSS = `
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        #section-id-b8d672c4-9d06-4327-b643-ebd1a5483357, .rastreo-container{
       background: ${colors.background}  !important;
       padding: 0!important;
  }
        .rastreo-inner {
                 border-radius: 0px!important;
            }
       .order-summary {
       background: transparent  !important;
  }
       .btn.btn-home, .btn-back {
       display: none  !important;
  }
       .btn-dashboard{
       display: none  !important;
  }
    `;

        // Seleccionar CSS según el tema
        const css = theme === 'dark' ? darkModeCSS : lightModeCSS;

        return `
            (function() {
                try {
                    // 1. Inyectar Estilos
                    const styleId = 'mwt-injected-styles';
                    let style = document.getElementById(styleId);
                    if (!style) {
                        style = document.createElement('style');
                        style.id = styleId;
                        document.head.appendChild(style);
                    }
                    style.innerHTML = \`${css}\`;

                    // 2. Remover Header/Footer (Lógica robusta)
                    function removeElements() {
                        const ids = ['sp-header', 'sp-footer'];
                        ids.forEach(id => {
                            const params = document.querySelectorAll('#' + id);
                            params.forEach(el => {
                                el.style.setProperty('display', 'none', 'important');
                                el.style.setProperty('visibility', 'hidden', 'important');
                                el.style.setProperty('height', '0', 'important');
                                el.style.setProperty('opacity', '0', 'important');
                            });
                        });
                    }

                    // Ejecutar limpieza
                    removeElements();
                    setTimeout(removeElements, 100);
                    setTimeout(removeElements, 500);
                    setInterval(removeElements, 2000); 

                } catch (e) {
                    console.error('Error in injected script:', e);
                }
            })();
        `;
    }, [colors, theme]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PanGestureHandler
                onHandlerStateChange={onHandlerStateChange}
                activeOffsetX={[-20, 20]}
                activeOffsetY={[-50, 50]}
                failOffsetY={[-50, 50]}
            >
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
                        ref={webViewRef}
                        source={{ uri: webViewUrl }}
                        style={styles.webview}
                        injectedJavaScript={injectedJavaScript}
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                        onError={() => {
                            setLoading(false);
                            setError(true);
                        }}
                        startInLoadingState={true}
                        onNavigationStateChange={(navState) => {
                            setCanGoBack(navState.canGoBack);
                            setCanGoForward(navState.canGoForward);
                        }}
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
            </PanGestureHandler>
        </GestureHandlerRootView>
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
