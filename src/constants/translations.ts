// Translation dictionaries for all supported languages
export type Language = 'es' | 'en' | 'fr' | 'pt';

export const LANGUAGES = {
    es: { name: 'Español', code: 'ES', flag: require('../../assets/images/flags/es.png') },
    en: { name: 'English', code: 'US', flag: require('../../assets/images/flags/us.png') },
    fr: { name: 'Français', code: 'FR', flag: require('../../assets/images/flags/fr.png') },
    pt: { name: 'Português', code: 'PT', flag: require('../../assets/images/flags/pt.png') },
};

// Product Specifications Dictionary (from PHP)
export const PRODUCT_TRANSLATIONS: Record<string, Record<Language, string>> = {
    // TIPO CALZADO
    'Bota Alta': { es: 'Bota Alta', en: 'High Boot', fr: 'Botte Haute', pt: 'Bota Alta' },
    'Bota al Tobillo': { es: 'Bota al Tobillo', en: 'Ankle Boot', fr: 'Bottine', pt: 'Bota ao Tornozelo' },
    'Zapato o Tenis': { es: 'Zapato o Tenis', en: 'Shoe or Sneaker', fr: 'Chaussure ou Basket', pt: 'Sapato ou Tênis' },

    // CUBREPUNTERA
    'Cubrepuntera': { es: 'Cubrepuntera', en: 'Toe Cap Cover', fr: 'Couvre-embout', pt: 'Cobertura de Biqueira' },
    'Si': { es: 'Sí', en: 'Yes', fr: 'Oui', pt: 'Sim' },
    'Sí': { es: 'Sí', en: 'Yes', fr: 'Oui', pt: 'Sim' },
    'No': { es: 'No', en: 'No', fr: 'Non', pt: 'Não' },

    // TIPO PUNTERA
    'Acero 200J': { es: 'Acero 200J', en: 'Steel 200J', fr: 'Acier 200J', pt: 'Aço 200J' },
    'Composite 200J': { es: 'Composite 200J', en: 'Composite 200J', fr: 'Composite 200J', pt: 'Composite 200J' },
    'No tiene': { es: 'No tiene', en: 'None', fr: 'Aucun', pt: 'Não tem' },
    'Plástico': { es: 'Plástico', en: 'Plastic', fr: 'Plastique', pt: 'Plástico' },
    'Plstico': { es: 'Plástico', en: 'Plastic', fr: 'Plastique', pt: 'Plástico' }, // Handling potential typo from source
    'Citoplástico 200C': { es: 'Citoplástico 200C', en: 'Citoplastic 200C', fr: 'Citoplastique 200C', pt: 'Citoplástico 200C' },

    // ANTIPERFORANTE
    'Antiperforante': { es: 'Antiperforante', en: 'Anti-Perforation', fr: 'Anti-Perforation', pt: 'Antiperfuração' },
    'Acero 1100 N': { es: 'Acero 1100 N', en: 'Steel 1100 N', fr: 'Acier 1100 N', pt: 'Aço 1100 N' },
    'Textil 1100 N': { es: 'Textil 1100 N', en: 'Textile 1100 N', fr: 'Textile 1100 N', pt: 'Têxtil 1100 N' },

    // PROTECTOR METATARSAL
    'Protector Metatarsal': { es: 'Protector Metatarsal', en: 'Metatarsal Guard', fr: 'Protection Métatarsienne', pt: 'Protetor Metatarsal' },
    'Interno': { es: 'Interno', en: 'Internal', fr: 'Interne', pt: 'Interno' },
    'Externo': { es: 'Externo', en: 'External', fr: 'Externe', pt: 'Externo' },

    // CAPELLADA
    'Capellada': { es: 'Capellada', en: 'Upper', fr: 'Tige', pt: 'Cabedal' },
    'Cuero Carnaza': { es: 'Cuero Carnaza', en: 'Split Leather', fr: 'Cuir Refendu', pt: 'Couro Camurça' },
    'Cuero Plena Flor': { es: 'Cuero Plena Flor', en: 'Full Grain Leather', fr: 'Cuir Pleine Flor', pt: 'Couro Plena Flor' },
    'Cuero Plena Flor HIDRO': { es: 'Cuero Plena Flor HIDRO', en: 'Hydro Full Grain Leather', fr: 'Cuir Pleine Fleur HYDRO', pt: 'Couro Plena Flor HIDRO' },
    'Cuero Nobuck': { es: 'Cuero Nobuck', en: 'Nubuck Leather', fr: 'Cuir Nubuck', pt: 'Couro Nobuck' },
    'Microfibra Mmicro PVC': { es: 'Microfibra Micro PVC', en: 'Micro PVC Microfiber', fr: 'Microfibre Micro PVC', pt: 'Microfibra Micro PVC' },
    'Cuero Rodock': { es: 'Cuero Rodock', en: 'Rodock Leather', fr: 'Cuir Rodock', pt: 'Couro Rodock' },
    'Cuero Vaqueta Lisa': { es: 'Cuero Vaqueta Lisa', en: 'Smooth Cowhide', fr: 'Cuir Vaquette Lisse', pt: 'Couro Vaqueta Lisa' },
    'EVA': { es: 'EVA', en: 'EVA', fr: 'EVA', pt: 'EVA' },
    'Cuero Vaqueta HIDRO': { es: 'Cuero Vaqueta HIDRO', en: 'Hydro Cowhide', fr: 'Cuir Vaquette HYDRO', pt: 'Couro Vaqueta HIDRO' },
    'Cuero Liso Fuego': { es: 'Cuero Liso Fuego', en: 'Fire Smooth Leather', fr: 'Cuir Lisse Feu', pt: 'Couro Liso Fogo' },
    'Cuero Nobuck Hidrofugado': { es: 'Cuero Nobuck Hidrofugado', en: 'Water-Repellent Nubuck', fr: 'Cuir Nubuck Hydrofuge', pt: 'Couro Nobuck Hidrofugado' },
    'Cuero Liso HIDRO Anti-llamas': { es: 'Cuero Liso HIDRO Anti-llamas', en: 'Hydro Smooth Flame-Retardant Leather', fr: 'Cuir Lisse HYDRO Anti-Flammes', pt: 'Couro Liso HIDRO Anti-Chamas' },

    // DISIPATIVO DE ENERGÍA
    'Disipativo de Energía': { es: 'Disipativo de Energía', en: 'Energy Dissipation', fr: 'Dissipation d\'Énergie', pt: 'Dissipador de Energia' },
    'ISO 20345 14.000V': { es: 'ISO 20345 14.000V', en: 'ISO 20345 14,000V', fr: 'ISO 20345 14 000V', pt: 'ISO 20345 14.000V' },
    'ASTM 2413 18.000V': { es: 'ASTM 2413 18.000V', en: 'ASTM 2413 18,000V', fr: 'ASTM 2413 18 000V', pt: 'ASTM 2413 18.000V' },
    'ABNT NBR 16603-2017 500V': { es: 'ABNT NBR 16603-2017 500V', en: 'ABNT NBR 16603-2017 500V', fr: 'ABNT NBR 16603-2017 500V', pt: 'ABNT NBR 16603-2017 500V' },
    'ISO 20345 14.000V ANT Conductivo': { es: 'ISO 20345 14.000V ANT Conductivo', en: 'ISO 20345 14,000V ANT Conductive', fr: 'ISO 20345 14 000V ANT Conducteur', pt: 'ISO 20345 14.000V ANT Condutivo' },

    // SUELA
    'Suela': { es: 'Suela', en: 'Sole', fr: 'Semelle', pt: 'Solado' },
    'Bidensidad PU': { es: 'Bidensidad PU', en: 'Dual-Density PU', fr: 'PU Bidensité', pt: 'Bidensidade PU' },
    'Bidensidad PU Caucho': { es: 'Bidensidad PU Caucho', en: 'Dual-Density PU Rubber', fr: 'PU Caoutchouc Bidensité', pt: 'Bidensidade PU Borracha' },
    'Monodensidad Caucho': { es: 'Monodensidad Caucho', en: 'Single-Density Rubber', fr: 'Caoutchouc Monodensité', pt: 'Monodensidade Borracha' },

    // NORMATIVA
    'Normativa': { es: 'Normativa', en: 'Standards', fr: 'Normes', pt: 'Normas' },
    'ASTM F2413': { es: 'ASTM F2413', en: 'ASTM F2413', fr: 'ASTM F2413', pt: 'ASTM F2413' },
    'ISO 20345': { es: 'ISO 20345', en: 'ISO 20345', fr: 'ISO 20345', pt: 'ISO 20345' },
    'ISO 20347': { es: 'ISO 20347', en: 'ISO 20347', fr: 'ISO 20347', pt: 'ISO 20347' },
    'ABNT NBR 16.603:2017 500V - SECO': { es: 'ABNT NBR 16.603:2017 500V - SECO', en: 'ABNT NBR 16.603:2017 500V - DRY', fr: 'ABNT NBR 16.603:2017 500V - SEC', pt: 'ABNT NBR 16.603:2017 500V - SECO' },

    // CIERRE
    'Cierre': { es: 'Cierre', en: 'Closure', fr: 'Fermeture', pt: 'Fechamento' },
    'Sin Cordones': { es: 'Sin Cordones', en: 'Laceless', fr: 'Sans Lacets', pt: 'Sem Cadarço' },
    'Con Cordones': { es: 'Con Cordones', en: 'Lace-Up', fr: 'Avec Lacets', pt: 'Com Cadarço' },
    'De meter': { es: 'De meter', en: 'Slip-On', fr: 'À Enfiler', pt: 'De Calçar' },
    'Zipper': { es: 'Cremallera', en: 'Zipper', fr: 'Fermeture Éclair', pt: 'Zíper' },
    'Cierre Velcro': { es: 'Cierre Velcro', en: 'Velcro Closure', fr: 'Fermeture Velcro', pt: 'Fechamento Velcro' },

    // COLOR
    'Color': { es: 'Color', en: 'Color', fr: 'Couleur', pt: 'Cor' },
    'Negro': { es: 'Negro', en: 'Black', fr: 'Noir', pt: 'Preto' },
    'Blanco': { es: 'Blanco', en: 'White', fr: 'Blanc', pt: 'Branco' },
    'Marron': { es: 'Marrón', en: 'Brown', fr: 'Marron', pt: 'Marrom' },
    'Marrón': { es: 'Marrón', en: 'Brown', fr: 'Marron', pt: 'Marrom' },
    'Café': { es: 'Café', en: 'Coffee', fr: 'Café', pt: 'Café' },
    'Verde Musgo': { es: 'Verde Musgo', en: 'Moss Green', fr: 'Vert Mousse', pt: 'Verde Musgo' },
    'Gris': { es: 'Gris', en: 'Gray', fr: 'Gris', pt: 'Cinza' },
    'Azul Marino': { es: 'Azul Marino', en: 'Navy Blue', fr: 'Bleu Marine', pt: 'Azul Marinho' },
    'Marron Claro': { es: 'Marrón Claro', en: 'Light Brown', fr: 'Marron Clair', pt: 'Marrom Claro' },
    'Dark Brown': { es: 'Marrón Oscuro', en: 'Dark Brown', fr: 'Marron Foncé', pt: 'Marrom Escuro' },
    'Grafite': { es: 'Grafito', en: 'Graphite', fr: 'Graphite', pt: 'Grafite' },
    'Marron Taupe': { es: 'Marrón Taupe', en: 'Taupe Brown', fr: 'Marron Taupe', pt: 'Marrom Taupe' },
    'Rojo': { es: 'Rojo', en: 'Red', fr: 'Jaune', pt: 'Vermelho' },
    'Castor': { es: 'Castor', en: 'Beaver', fr: 'Castor', pt: 'Castor' },
    'Amarillo': { es: 'Amarillo', en: 'Yellow', fr: 'Jaune', pt: 'Amarelo' },

    // SEGMENTO
    'Segmento': { es: 'Segmento', en: 'Segment', fr: 'Segment', pt: 'Segmento' },
    'Agrícola': { es: 'Agrícola', en: 'Agricultural', fr: 'Agricole', pt: 'Agrícola' },
    'Alimentaria': { es: 'Alimentaria', en: 'Food Industry', fr: 'Alimentaire', pt: 'Alimentícia' },
    'Producción': { es: 'Producción', en: 'Production', fr: 'Production', pt: 'Produção' },
    'Administrativo': { es: 'Administrativo', en: 'Administrative', fr: 'Administratif', pt: 'Administrativo' },
    'Construcción': { es: 'Construcción', en: 'Construction', fr: 'Construction', pt: 'Construção' },
    'Electricista': { es: 'Electricista', en: 'Electrician', fr: 'Électricien', pt: 'Eletricista' },
    'Astillero': { es: 'Astillero', en: 'Shipyard', fr: 'Chantier Naval', pt: 'Estaleiro' },
    'Limpieza': { es: 'Limpieza', en: 'Cleaning', fr: 'Nettoyage', pt: 'Limpeza' },
    'Madereras': { es: 'Madereras', en: 'Lumber', fr: 'Bois', pt: 'Madeireiras' },
    'Metalurgia': { es: 'Metalurgia', en: 'Metallurgy', fr: 'Métallurgie', pt: 'Metalurgia' },
    'Militares': { es: 'Militares', en: 'Military', fr: 'Militaires', pt: 'Militares' },
    'Mineria': { es: 'Minería', en: 'Mining', fr: 'Minière', pt: 'Mineração' },
    'Montadoras': { es: 'Montadoras', en: 'Assembly', fr: 'Montage', pt: 'Montadoras' },
    'Mensajeria': { es: 'Mensajería', en: 'Courier', fr: 'Messagerie', pt: 'Mensageria' },
    'Petroquimicos': { es: 'Petroquímicos', en: 'Petrochemical', fr: 'Pétrochimique', pt: 'Petroquímicos' },
    'Rescate': { es: 'Rescate', en: 'Rescue', fr: 'Sauvetage', pt: 'Resgate' },
    'Salud': { es: 'Salud', en: 'Healthcare', fr: 'Santé', pt: 'Saúde' },
    'Siderurgia': { es: 'Siderurgia', en: 'Steel Industry', fr: 'Sidérurgie', pt: 'Siderurgia' },
    'Trekking': { es: 'Trekking', en: 'Trekking', fr: 'Randonnée', pt: 'Trekking' },
    'Multiservicios': { es: 'Multiservicios', en: 'Multi-Service', fr: 'Multi-Services', pt: 'Multiserviços' },
    'Agroindustria': { es: 'Agroindustria', en: 'Agribusiness', fr: 'Agro-Industrie', pt: 'Agroindústria' },

    // ECONOMÍAS CIRCULARES
    'Materiales Economías Circulares': { es: 'Materiales Economías Circulares', en: 'Circular Economy Materials', fr: 'Matériaux Économie Circulaire', pt: 'Materiais Economias Circulares' },
    'Economías': { es: 'Economías', en: 'Economies', fr: 'Économies', pt: 'Economias' },

    // PLANTILLA INTERNA
    'Plantilla Interna': { es: 'Plantilla Interna', en: 'Insole', fr: 'Semelle Intérieure', pt: 'Palmilha Interna' },
    'Poliuretano': { es: 'Poliuretano', en: 'Polyurethane', fr: 'Polyuréthane', pt: 'Poliuretano' },
    'Etilvinilacetato': { es: 'Etilvinilacetato', en: 'Ethylene-Vinyl Acetate', fr: 'Éthylène-Acétate de Vinyle', pt: 'Etilvinilacetato' },
    'Etilvinilacetato ANT': { es: 'Etilvinilacetato ANT', en: 'Ethylene-Vinyl Acetate ANT', fr: 'Éthylène-Acétate de Vinyle ANT', pt: 'Etilvinilacetato ANT' },

    // RIESGOS
    'Riesgo': { es: 'Riesgo', en: 'Risk', fr: 'Risque', pt: 'Risco' },
    'Riesgos': { es: 'Riesgos', en: 'Risks', fr: 'Risques', pt: 'Riscos' },
    'Alta Temperatura': { es: 'Alta Temperatura', en: 'High Temperature', fr: 'Haute Température', pt: 'Alta Temperatura' },
    'Ambiente Frio': { es: 'Ambiente Frío', en: 'Cold Environment', fr: 'Environnement Froid', pt: 'Ambiente Frio' },
    'Ambiente Frío': { es: 'Ambiente Frío', en: 'Cold Environment', fr: 'Environnement Froid', pt: 'Ambiente Frio' },
    'Shock': { es: 'Choque', en: 'Shock', fr: 'Choc', pt: 'Choque' },
    'Estática': { es: 'Estática', en: 'Static', fr: 'Statique', pt: 'Estática' },
    'Esguince': { es: 'Esguince', en: 'Sprain', fr: 'Entorse', pt: 'Entorse' },
    'Punción Plantar': { es: 'Punción Plantar', en: 'Puncture', fr: 'Perforation', pt: 'Perfuração Plantar' },
    'Puncin Plantar': { es: 'Punción Plantar', en: 'Puncture', fr: 'Perforation', pt: 'Perfuração Plantar' },
    'Humedad': { es: 'Humedad', en: 'Humidity', fr: 'Humidité', pt: 'Umidade' },
    'Piso Resbaladizo': { es: 'Piso Resbaladizo', en: 'Slippery Floor', fr: 'Sol Glissant', pt: 'Piso Escorregadio' },
    'Caída Objetos': { es: 'Caída Objetos', en: 'Falling Objects', fr: 'Chute d\'Objets', pt: 'Queda de Objetos' },
    'Cada Objetos': { es: 'Caída Objetos', en: 'Falling Objects', fr: 'Chute d\'Objets', pt: 'Queda de Objetos' },
    'Ocupacional': { es: 'Ocupacional', en: 'Occupational', fr: 'Professionnel', pt: 'Ocupacional' },
    'Seguridad': { es: 'Seguridad', en: 'Safety', fr: 'Sécurité', pt: 'Segurança' },
    'Polimerico': { es: 'Polimérico', en: 'Polymeric', fr: 'Polymérique', pt: 'Polimérico' },
    'Químicos': { es: 'Químicos', en: 'Chemicals', fr: 'Chimiques', pt: 'Químicos' },
    'Qumicos': { es: 'Químicos', en: 'Chemicals', fr: 'Chimiques', pt: 'Químicos' },

    // FILTER LABELS
    'Plantilla': { es: 'Plantilla', en: 'Insole', fr: 'Semelle', pt: 'Palmilha' },
    'Calzados': { es: 'Calzados', en: 'Footwear', fr: 'Chaussures', pt: 'Calçados' },
    'Punteras': { es: 'Punteras', en: 'Toe Caps', fr: 'Embouts', pt: 'Biqueiras' },
};

// UI Translations
export const TRANSLATIONS: Record<Language, Record<string, string>> = {
    es: {
        // Navigation Tabs
        'Dashboard': 'Dashboard',
        'Pedidos': 'Pedidos',
        'Productos': 'Productos',
        'Carrito': 'Carrito',
        'Salir': 'Salir',
        'Hola': 'Hola',

        // ProductDetailScreen
        'Especificaciones': 'Especificaciones',
        'Tallas': 'Tallas',
        'Cant.': 'Cant.',
        'Añadir a tu pedido': 'Añadir a tu pedido',
        'Volver': 'Volver',
        'Descargar ficha': 'Descargar ficha',
        'Valor': 'Valor',
        'Producto no encontrado': 'Producto no encontrado',
        'Atención': 'Atención',
        'Seleccione al menos una cantidad.': 'Seleccione al menos una cantidad.',
        'Éxito': 'Éxito',
        'Productos agregados al carrito.': 'Productos agregados al carrito.',
        'Error': 'Error',
        'Hubo un problema al agregar al carrito.': 'Hubo un problema al agregar al carrito.',
        'Tallas Marluvas Composite': 'Tallas Marluvas Composite',

        // ProductsScreen
        'Buscar productos...': 'Buscar productos...',
        'Filtrar por': 'Filtrar por',

        // CartScreen
        'Mi Carrito': 'Mi Carrito',
        'Tu carrito está vacío': 'Tu carrito está vacío',
        'Empieza a agregar productos': 'Empieza a agregar productos',
        'Producto': 'Producto',
        'Cantidad': 'Cantidad',
        'Precio Unit.': 'Precio Unit.',
        'Total': 'Total',
        'Subtotal': 'Subtotal',
        'Confirmar Pedido': 'Confirmar Pedido',
        'Eliminar': 'Eliminar',
        'Confirmar': 'Confirmar',
        '¿Eliminar este producto?': '¿Eliminar este producto?',
        'Eliminar producto': 'Eliminar producto',
        '¿Estás seguro de que deseas eliminar este producto del carrito?': '¿Estás seguro de que deseas eliminar este producto del carrito?',
        'Eliminado': 'Eliminado',
        'No se pudo eliminar': 'No se pudo eliminar',
        'Falló la conexión al eliminar': 'Falló la conexión al eliminar',
        'No se pudo actualizar la cantidad': 'No se pudo actualizar la cantidad',
        'Falló la actualización de cantidad': 'Falló la actualización de cantidad',
        'No se encontró información del carrito': 'No se encontró información del carrito',
        'Agrega productos antes de comprar': 'Agrega productos antes de comprar',
        'Compra realizada con éxito': 'Compra realizada con éxito',
        'No se pudo completar la compra': 'No se pudo completar la compra',
        'Falló la conexión al procesar la compra': 'Falló la conexión al procesar la compra',
        'Cancelar': 'Cancelar',
        'Pedido confirmado': 'Pedido confirmado',
        'Tu pedido ha sido confirmado exitosamente.': 'Tu pedido ha sido confirmado exitosamente.',

        // OrdersScreen
        'Mis Pedidos': 'Mis Pedidos',
        'No tienes pedidos': 'No tienes pedidos',
        'Tus pedidos aparecerán aquí': 'Tus pedidos aparecerán aquí',
        'Pedido': 'Pedido',
        'Fecha': 'Fecha',
        'Estado': 'Estado',
        'Ver detalle': 'Ver detalle',

        // LoginScreen
        'Iniciar Sesión': 'Iniciar Sesión',
        'Correo electrónico': 'Correo electrónico',
        'Contraseña': 'Contraseña',
        'Ingresar': 'Ingresar',
        'Credenciales incorrectas': 'Credenciales incorrectas',

        // WebView Screens
        'Cargando...': 'Cargando...',
        'Error al cargar': 'Error al cargar',
        'No se pudo cargar la página': 'No se pudo cargar la página',
        'Reintentar': 'Reintentar',
        'Rastreo': 'Rastreo',
        'Cargando rastreo...': 'Cargando rastreo...',
        'No se pudo cargar la página de rastreo': 'No se pudo cargar la página de rastreo',

        // Order Statuses
        'Creación': 'Creación',
        'Crédito': 'Crédito',
        'Producción': 'Producción',
        'Preparación': 'Preparación',
        'Despacho': 'Despacho',
        'Tránsito': 'Tránsito',
        'En Destino': 'En Destino',
        'Confirmado': 'Confirmado',
        'Archivados': 'Archivados',
        'Pagado': 'Pagado',
        'Otros': 'Otros',
        'Operador': 'Operador',
        'Cliente': 'Cliente',
        'Clientes': 'Clientes',
    },
    en: {
        // Navigation Tabs
        'Dashboard': 'Dashboard',
        'Pedidos': 'Orders',
        'Productos': 'Products',
        'Carrito': 'Cart',
        'Salir': 'Logout',
        'Hola': 'Hello',

        // ProductDetailScreen
        'Especificaciones': 'Specifications',
        'Tallas': 'Sizes',
        'Cant.': 'Qty.',
        'Añadir a tu pedido': 'Add to Order',
        'Volver': 'Back',
        'Descargar ficha': 'Download Datasheet',
        'Valor': 'Price',
        'Producto no encontrado': 'Product not found',
        'Atención': 'Attention',
        'Seleccione al menos una cantidad.': 'Please select at least one quantity.',
        'Éxito': 'Success',
        'Productos agregados al carrito.': 'Products added to cart.',
        'Error': 'Error',
        'Hubo un problema al agregar al carrito.': 'There was a problem adding to cart.',
        'Tallas Marluvas Composite': 'Marluvas Composite Sizes',

        // ProductsScreen
        'Buscar productos...': 'Search products...',
        'Filtrar por': 'Filter by',

        // CartScreen
        'Mi Carrito': 'My Cart',
        'Tu carrito está vacío': 'Your cart is empty',
        'Empieza a agregar productos': 'Start adding products',
        'Producto': 'Product',
        'Cantidad': 'Quantity',
        'Precio Unit.': 'Unit Price',
        'Total': 'Total',
        'Subtotal': 'Subtotal',
        'Confirmar Pedido': 'Confirm Order',
        'Eliminar': 'Delete',
        'Confirmar': 'Confirm',
        '¿Eliminar este producto?': 'Delete this product?',
        'Eliminar producto': 'Delete Product',
        '¿Estás seguro de que deseas eliminar este producto del carrito?': 'Are you sure you want to remove this product from the cart?',
        'Eliminado': 'Deleted',
        'No se pudo eliminar': 'Could not delete',
        'Falló la conexión al eliminar': 'Deletion connection failed',
        'No se pudo actualizar la cantidad': 'Could not update quantity',
        'Falló la actualización de cantidad': 'Quantity update failed',
        'No se encontró información del carrito': 'Cart information not found',
        'Agrega productos antes de comprar': 'Add products before checking out',
        'Compra realizada con éxito': 'Purchase completed successfully',
        'No se pudo completar la compra': 'Could not complete purchase',
        'Falló la conexión al procesar la compra': 'Connection failed while processing purchase',
        'Cancelar': 'Cancel',
        'Pedido confirmado': 'Order confirmed',
        'Tu pedido ha sido confirmado exitosamente.': 'Your order has been confirmed successfully.',

        // OrdersScreen
        'Mis Pedidos': 'My Orders',
        'No tienes pedidos': 'No orders',
        'Tus pedidos aparecerán aquí': 'Your orders will appear here',
        'Pedido': 'Order',
        'Fecha': 'Date',
        'Estado': 'Status',
        'Ver detalle': 'View details',

        // LoginScreen
        'Iniciar Sesión': 'Sign In',
        'Correo electrónico': 'Email',
        'Contraseña': 'Password',
        'Ingresar': 'Sign In',
        'Credenciales incorrectas': 'Invalid credentials',

        // WebView Screens
        'Cargando...': 'Loading...',
        'Error al cargar': 'Loading error',
        'No se pudo cargar la página': 'Could not load page',
        'Reintentar': 'Retry',
        'Rastreo': 'Tracking',
        'Cargando rastreo...': 'Loading tracking...',
        'No se pudo cargar la página de rastreo': 'Could not load tracking page',

        // Order Statuses
        'Creación': 'Creation',
        'Crédito': 'Credit',
        'Producción': 'Production',
        'Preparación': 'Preparation',
        'Despacho': 'Dispatch',
        'Tránsito': 'In Transit',
        'En Destino': 'Delivered',
        'Confirmado': 'Confirmed',
        'Archivados': 'Archived',
        'Pagado': 'Paid',
        'Otros': 'Others',
        'Operador': 'Operator',
        'Cliente': 'Customer',
        'Clientes': 'Customers',
        'Tu Pedido': 'Your Order',
        'Buscar pedido...': 'Search order...',
        'OC': 'PO', // Purchase Order
        'SAP': 'SAP',
        'Proforma': 'Proforma',
        'Proforma Muito Work': 'MWT Proforma',
        'Comprar': 'Checkout',
        'Cant Total': 'Total Qty',
        'un.': 'ea.', // each
    },
    fr: {
        // Navigation Tabs
        'Dashboard': 'Tableau de Bord',
        'Pedidos': 'Commandes',
        'Productos': 'Produits',
        'Carrito': 'Panier',
        'Salir': 'Déconnexion',
        'Hola': 'Bonjour',

        // ProductDetailScreen
        'Especificaciones': 'Spécifications',
        'Tallas': 'Tailles',
        'Cant.': 'Qté.',
        'Añadir a tu pedido': 'Ajouter à la Commande',
        'Volver': 'Retour',
        'Descargar ficha': 'Télécharger Fiche',
        'Valor': 'Prix',
        'Producto no encontrado': 'Produit non trouvé',
        'Atención': 'Attention',
        'Seleccione al menos una cantidad.': 'Veuillez sélectionner au moins une quantité.',
        'Éxito': 'Succès',
        'Productos agregados al carrito.': 'Produits ajoutés au panier.',
        'Error': 'Erreur',
        'Hubo un problema al agregar al carrito.': 'Un problème est survenu lors de l\'ajout au panier.',
        'Tallas Marluvas Composite': 'Tailles Marluvas Composite',

        // ProductsScreen
        'Buscar productos...': 'Rechercher produits...',
        'Filtrar por': 'Filtrer par',

        // CartScreen
        'Mi Carrito': 'Mon Panier',
        'Tu carrito está vacío': 'Votre panier est vide',
        'Empieza a agregar productos': 'Commencez à ajouter des produits',
        'Producto': 'Produit',
        'Cantidad': 'Quantité',
        'Precio Unit.': 'Prix Unit.',
        'Total': 'Total',
        'Subtotal': 'Sous-total',
        'Confirmar Pedido': 'Confirmer Commande',
        'Eliminar': 'Supprimer',
        'Confirmar': 'Confirmer',
        '¿Eliminar este producto?': 'Supprimer ce produit?',
        'Eliminar producto': 'Supprimer le produit',
        '¿Estás seguro de que deseas eliminar este producto del carrito?': 'Êtes-vous sûr de vouloir supprimer ce produit du panier?',
        'Eliminado': 'Supprimé',
        'No se pudo eliminar': 'Impossible de supprimer',
        'Falló la conexión al eliminar': 'Échec de la connexion lors de la suppression',
        'No se pudo actualizar la cantidad': 'Impossible de mettre à jour la quantité',
        'Falló la actualización de cantidad': 'Échec de la mise à jour de la quantité',
        'No se encontró información del carrito': 'Informations sur le panier introuvables',
        'Agrega productos antes de comprar': 'Ajoutez des produits avant d\'acheter',
        'Compra realizada con éxito': 'Achat effectué avec succès',
        'No se pudo completar la compra': 'Impossible de terminer l\'achat',
        'Falló la conexión al procesar la compra': 'Échec de la connexion lors du traitement de l\'achat',
        'Cancelar': 'Annuler',
        'Pedido confirmado': 'Commande confirmée',
        'Tu pedido ha sido confirmado exitosamente.': 'Votre commande a été confirmée avec succès.',

        // OrdersScreen
        'Mis Pedidos': 'Mes Commandes',
        'No tienes pedidos': 'Aucune commande',
        'Tus pedidos aparecerán aquí': 'Vos commandes apparaîtront ici',
        'Pedido': 'Commande',
        'Fecha': 'Date',
        'Estado': 'Statut',
        'Ver detalle': 'Voir détails',

        // LoginScreen
        'Iniciar Sesión': 'Se Connecter',
        'Correo electrónico': 'Email',
        'Contraseña': 'Mot de passe',
        'Ingresar': 'Connexion',
        'Credenciales incorrectas': 'Identifiants invalides',

        // WebView Screens
        'Cargando...': 'Chargement...',
        'Error al cargar': 'Erreur de chargement',
        'No se pudo cargar la página': 'Impossible de charger la page',
        'Reintentar': 'Réessayer',
        'Rastreo': 'Suivi',
        'Cargando rastreo...': 'Chargement du suivi...',
        'No se pudo cargar la página de rastreo': 'Impossible de charger la page de suivi',

        // Order Statuses
        'Creación': 'Création',
        'Crédito': 'Crédit',
        'Producción': 'Production',
        'Preparación': 'Préparation',
        'Despacho': 'Expédition',
        'Tránsito': 'En Transit',
        'En Destino': 'Livré',
        'Confirmado': 'Confirmé',
        'Archivados': 'Archivés',
        'Pagado': 'Payé',
        'Otros': 'Autres',
        'Operador': 'Opérateur',
        'Cliente': 'Client',
        'Clientes': 'Clients',
        'Tu Pedido': 'Votre Commande',
        'Buscar pedido...': 'Rechercher commande...',
        'OC': 'BC', // Bon de Commande
        'SAP': 'SAP',
        'Proforma': 'Proforma',
        'Proforma Muito Work': 'Proforma MWT',
        'Comprar': 'Commander',
        'Cant Total': 'Qté Totale',
        'un.': 'un.',
    },
    pt: {
        // Navigation Tabs
        'Dashboard': 'Painel',
        'Pedidos': 'Pedidos',
        'Productos': 'Produtos',
        'Carrito': 'Carrinho',
        'Salir': 'Sair',
        'Hola': 'Olá',

        // ProductDetailScreen
        'Especificaciones': 'Especificações',
        'Tallas': 'Tamanhos',
        'Cant.': 'Qtd.',
        'Añadir a tu pedido': 'Adicionar ao Pedido',
        'Volver': 'Voltar',
        'Descargar ficha': 'Baixar Ficha',
        'Valor': 'Valor',
        'Producto no encontrado': 'Produto não encontrado',
        'Atención': 'Atenção',
        'Seleccione al menos una cantidad.': 'Por favor, selecione pelo menos uma quantidade.',
        'Éxito': 'Sucesso',
        'Productos agregados al carrito.': 'Produtos adicionados ao carrinho.',
        'Error': 'Erro',
        'Hubo un problema al agregar al carrito.': 'Houve um problema ao adicionar ao carrinho.',
        'Tallas Marluvas Composite': 'Tamanhos Marluvas Composite',

        // ProductsScreen
        'Buscar productos...': 'Buscar produtos...',
        'Filtrar por': 'Filtrar por',

        // CartScreen
        'Mi Carrito': 'Meu Carrinho',
        'Tu carrito está vacío': 'Seu carrinho está vazio',
        'Empieza a agregar productos': 'Comece a adicionar produtos',
        'Producto': 'Produto',
        'Cantidad': 'Quantidade',
        'Precio Unit.': 'Preço Unit.',
        'Total': 'Total',
        'Subtotal': 'Subtotal',
        'Confirmar Pedido': 'Confirmar Pedido',
        'Eliminar': 'Excluir',
        'Confirmar': 'Confirmar',
        '¿Eliminar este producto?': 'Excluir este produto?',
        'Eliminar producto': 'Excluir produto',
        '¿Estás seguro de que deseas eliminar este producto del carrito?': 'Tem certeza de que deseja excluir este produto do carrinho?',
        'Eliminado': 'Excluído',
        'No se pudo eliminar': 'Não foi possível excluir',
        'Falló la conexión al eliminar': 'Falha na conexão ao excluir',
        'No se pudo actualizar la cantidad': 'Não foi possível atualizar a quantidade',
        'Falló la actualización de cantidad': 'Falha na atualização da quantidade',
        'No se encontró información del carrito': 'Informações do carrinho não encontradas',
        'Agrega productos antes de comprar': 'Adicione produtos antes de comprar',
        'Compra realizada con éxito': 'Compra concluída com sucesso',
        'No se pudo completar la compra': 'Não foi possível concluir a compra',
        'Falló la conexión al procesar la compra': 'Falha na conexão ao processar a compra',
        'Cancelar': 'Cancelar',
        'Pedido confirmado': 'Pedido confirmado',
        'Tu pedido ha sido confirmado exitosamente.': 'Seu pedido foi confirmado com sucesso.',

        // OrdersScreen
        'Mis Pedidos': 'Meus Pedidos',
        'No tienes pedidos': 'Sem pedidos',
        'Tus pedidos aparecerán aquí': 'Seus pedidos aparecerão aqui',
        'Pedido': 'Pedido',
        'Fecha': 'Data',
        'Estado': 'Status',
        'Ver detalle': 'Ver detalhes',

        // LoginScreen
        'Iniciar Sesión': 'Entrar',
        'Correo electrónico': 'E-mail',
        'Contraseña': 'Senha',
        'Ingresar': 'Entrar',
        'Credenciales incorrectas': 'Credenciais inválidas',

        // WebView Screens
        'Cargando...': 'Carregando...',
        'Error al cargar': 'Erro ao carregar',
        'No se pudo cargar la página': 'Não foi possível carregar a página',
        'Reintentar': 'Tentar novamente',
        'Rastreo': 'Rastreamento',
        'Cargando rastreo...': 'Carregando rastreamento...',
        'No se pudo cargar la página de rastreo': 'Não foi possível carregar a página de rastreamento',

        // Order Statuses
        'Creación': 'Criação',
        'Crédito': 'Crédito',
        'Producción': 'Produção',
        'Preparación': 'Preparação',
        'Despacho': 'Envio',
        'Tránsito': 'Em Trânsito',
        'En Destino': 'Entregue',
        'Confirmado': 'Confirmado',
        'Archivados': 'Arquivados',
        'Pagado': 'Pago',
        'Otros': 'Outros',
        'Operador': 'Operador',
        'Cliente': 'Cliente',
        'Clientes': 'Clientes',
        'Tu Pedido': 'Seu Pedido',
        'Buscar pedido...': 'Buscar pedido...',
        'OC': 'OC', // Ordem de Compra
        'SAP': 'SAP',
        'Proforma': 'Proforma',
        'Proforma Muito Work': 'Proforma MWT',
        'Comprar': 'Comprar',
        'Cant Total': 'Qtd Total',
        'un.': 'un.',
    },
};

// Helper function to translate a key
export function translate(key: string, lang: Language): string {
    // First check if it's a product translation
    if (PRODUCT_TRANSLATIONS[key]) {
        return PRODUCT_TRANSLATIONS[key][lang] || key;
    }

    // Then check UI translations
    if (TRANSLATIONS[lang][key]) {
        return TRANSLATIONS[lang][key];
    }

    // Return the key itself if no translation found
    return key;
}
