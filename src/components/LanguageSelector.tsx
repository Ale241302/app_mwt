import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Language, LANGUAGES } from '../constants/translations';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);

    const currentLang = LANGUAGES[language];

    const handleLanguageSelect = (lang: Language) => {
        setLanguage(lang);
        setModalVisible(false);
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.container, { backgroundColor: colors.card }]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Image source={currentLang.flag} style={styles.flag} />
                <Text style={[styles.code, { color: colors.text }]}>{currentLang.code}</Text>
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={[styles.dropdown, { backgroundColor: colors.card }]}>
                        {(Object.keys(LANGUAGES) as Language[]).map((lang, index, arr) => {
                            const langData = LANGUAGES[lang];
                            const isSelected = lang === language;
                            const isLast = index === arr.length - 1;

                            return (
                                <TouchableOpacity
                                    key={lang}
                                    style={[
                                        styles.option,
                                        { borderBottomColor: colors.border },
                                        !isLast && { borderBottomWidth: 1 }, // Only show border if not last
                                        isSelected && { backgroundColor: colors.tint },
                                    ]}
                                    onPress={() => handleLanguageSelect(lang)}
                                >
                                    <Image source={langData.flag} style={styles.optionFlag} />
                                    <View style={styles.optionTextContainer}>
                                        <Text style={[styles.optionName, { color: colors.text }]}>
                                            {langData.name}
                                        </Text>
                                        <Text style={[styles.optionCode, { color: colors.subtext }]}>
                                            {langData.code}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                                            <Text style={styles.checkmarkText}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 10,
    },
    flag: {
        width: 24,
        height: 16,
        borderRadius: 2,
        marginRight: 6,
    },
    code: {
        fontSize: 14,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 50,
        paddingRight: 10,
    },
    dropdown: {
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minWidth: 200,
        overflow: 'hidden', // Ensure content doesn't bleed
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        // borderBottomWidth removed from here, handled dynamically
    },
    optionFlag: {
        width: 32,
        height: 22,
        borderRadius: 2,
        marginRight: 12,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    optionCode: {
        fontSize: 12,
    },
    checkmark: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
