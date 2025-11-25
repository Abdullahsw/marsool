import React from 'react';
import { TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

const WHATSAPP_NUMBER = '+9647755358009';

export const WhatsAppButton: React.FC = () => {
  const handlePress = () => {
    const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=مرحباً، أحتاج إلى مساعدة`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to web version
          const webUrl = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=مرحباً، أحتاج إلى مساعدة`;
          return Linking.openURL(webUrl);
        }
      })
      .catch(() => {
        Alert.alert(
          'خطأ',
          'لم نتمكن من فتح واتساب. يرجى التأكد من تثبيت التطبيق.'
        );
      });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons name="logo-whatsapp" size={28} color={theme.colors.white} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: theme.spacing.lg,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366', // WhatsApp green
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
    elevation: 8,
  },
});
