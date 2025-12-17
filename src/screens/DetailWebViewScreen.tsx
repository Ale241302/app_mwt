import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

    const webViewUrl = `https://mwt.one/es/?option=com_sppagebuilder&view=page&id=84&order_number=${orderNumber}&user_id=${user?.id || ''}`;

    const injectedJavaScript = React.useMemo(() => {
        // CSS para modo oscuro (Dark Mode)
        const darkModeCSS = `
        :root {
            --mwt-primary: ${colors.primary};
            --mwt-primary-2: ${colors.primary};
            --mwt-deep: ${colors.text};
            --mwt-border: ${colors.border};
            --mwt-bg: ${colors.card};
            --mwt-text-muted: ${colors.subtext};
            --mwt-shadow: none;
        }

        body {
            background-color: ${colors.background} !important;
            color: ${colors.text} !important;
        }

        /* Overrides específicos de estructura y gradientes */
        #section-id-b8d672c4-9d06-4327-b643-ebd1a5483357 {
            background: ${colors.background} !important;
             padding: 0!important;
        }
        
        .usuarios-container {
            background: ${colors.background} !important;
                 padding: 0!important;
        }

        .usuarios-inner {
            background-color: ${colors.card} !important;
            color: ${colors.text} !important;
            box-shadow: none !important;
            border: 1px solid ${colors.border} !important;
        }

        /* Mobile Cards (Responsive) */
        .order-card, .order-card-cliente {
            background-color: ${colors.card} !important;
            border: 1px solid ${colors.border} !important;
            color: ${colors.text} !important;
            box-shadow: none !important;
        }

        .order-label-detail {
            color: ${colors.text} !important;
            background: transparent !important;
        }

        .order-value {
            color: ${colors.text} !important;
        }

        .order-input, 
        input.order-input,
        .order-card .order-input, 
        .order-card-cliente .order-input {
            background-color: #202938 !important;
            color: #9da6b5 !important;
            border: 1px solid #313a49 !important;
        }

        /* Header Titles */
        .usuarios-title, .usuarios-header h1 {
            color: ${colors.text} !important;
        }

        /* Botones */
        .btn-back {
            background: transparent !important;
            border: 2px solid ${colors.primary} !important;
            color: ${colors.primary} !important;
        }
        .btn-back:hover {
            background: ${colors.primary} !important;
            color: #fff !important;
        }

        .btn-nuevo {
            background: ${colors.primary} !important;
            color: #fff !important;
        }
        .btn-nuevo:hover {
            background: ${colors.primary} !important;
            opacity: 0.8;
        }

        .btn-home {
            background: ${colors.border} !important;
            color: ${colors.text} !important;
            border: 1px solid ${colors.border} !important;
        }
        .btn-home:hover {
            background: ${colors.card} !important;
            border-color: ${colors.primary} !important;
        }
        
        /* Inputs, Selects y Tablas */
        input, select, textarea, .form-control {
            background-color: #202938 !important;
            color: #9da6b5 !important;
            border: 1px solid #313a49 !important;
        }
        input:focus, select:focus, textarea:focus {
            border-color: ${colors.primary} !important;
        }

        /* Textos generales */
        p, span, label, div, td, th {
            color: ${colors.text} !important;
        }
        
        .order-summary {
            background: ${colors.card} !important;
            border: 1px solid ${colors.border} !important;
        }
        
        /* Links */
        a {
            color: ${colors.primary} !important;
        }
        a.btn {
            text-decoration: none !important;
        }

        /* Ocultar elementos innecesarios */
        #sp-header, #sp-footer {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
            position: absolute !important;
            top: -9999px !important;
        }
            .order-summary {
       background: transparent  !important;
  }
       .btn.btn-home, .btn-back {
       display: none  !important;
  }
       .usuarios-inner {
       border-radius: 0px!important;
  }
       .usuarios-title{
       display: none  !important;
  }
    `;

        // CSS para modo claro (Light Mode)
        const lightModeCSS = `
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        #section-id-b8d672c4-9d06-4327-b643-ebd1a5483357,.usuarios-container, .order-summary {
       background: ${colors.background}  !important;
        padding: 0!important;
  }
       .order-summary {
       background: transparent  !important;
  }
       .btn.btn-home, .btn-back {
       display: none  !important;
  }
       .usuarios-inner {
       border-radius: 0px!important;
  }
       .usuarios-title{
       display: none  !important;
  }
    `;

        // Seleccionar CSS según el tema
        const css = theme === 'dark' ? darkModeCSS : lightModeCSS;

        // Retornar JavaScript que inyecta los estilos
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
                        const elements = document.querySelectorAll('#' + id);
                        elements.forEach(el => {
                            el.style.setProperty('display', 'none', 'important');
                            el.style.setProperty('visibility', 'hidden', 'important');
                            el.style.setProperty('height', '0', 'important');
                            el.style.setProperty('opacity', '0', 'important');
                        });
                    });
                }

                // Ejecutar limpieza inmediata y periódica
                removeElements();
                setTimeout(removeElements, 100);
                setTimeout(removeElements, 500);
                setInterval(removeElements, 2000);

            } catch (e) {
                console.error('Error in injected script:', e);
            }
        })();
        true;
    `;
    }, [colors, theme]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    Detalle: {orderNumber}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* WebView */}
            <WebView
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
