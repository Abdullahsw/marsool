import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { useCoupons, Coupon } from '../hooks/useCoupons';

interface CouponSectionProps {
  orderTotal: number;
  onCouponApplied: (discount: number, coupon: Coupon) => void;
  onCouponRemoved: () => void;
}

export const CouponSection: React.FC<CouponSectionProps> = ({
  orderTotal,
  onCouponApplied,
  onCouponRemoved,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  
  const { validateCoupon, loading } = useCoupons();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setMessage('الرجاء إدخال رمز الكوبون');
      setMessageType('error');
      return;
    }

    const result = await validateCoupon(couponCode, orderTotal);
    
    setMessage(result.message);
    setMessageType(result.valid ? 'success' : 'error');

    if (result.valid && result.coupon && result.discount) {
      setAppliedCoupon(result.coupon);
      setAppliedDiscount(result.discount);
      onCouponApplied(result.discount, result.coupon);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setMessage('');
    setMessageType(null);
    setAppliedCoupon(null);
    setAppliedDiscount(0);
    onCouponRemoved();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="gift-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.title}>هل لديك كوبون خصم؟</Text>
      </View>

      {/* Applied Coupon Display */}
      {appliedCoupon ? (
        <View style={styles.appliedContainer}>
          <View style={styles.appliedInfo}>
            <Text style={styles.appliedCode}>{appliedCoupon.code}</Text>
            <Text style={styles.appliedDescription}>{appliedCoupon.description}</Text>
            <Text style={styles.appliedDiscount}>
              خصم: {appliedDiscount.toLocaleString('ar-IQ')} د.ع
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveCoupon}
          >
            <Ionicons name="close-circle" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Input Field */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[
                styles.applyButton,
                loading && styles.applyButtonDisabled
              ]}
              onPress={handleApplyCoupon}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Text style={styles.applyButtonText}>تطبيق</Text>
              )}
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              placeholder="أدخل رمز التوفير هنا"
              placeholderTextColor={theme.colors.textLight}
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
              textAlign="right"
            />
          </View>

          {/* Message */}
          {message && (
            <View
              style={[
                styles.messageContainer,
                messageType === 'success' && styles.successMessage,
                messageType === 'error' && styles.errorMessage,
              ]}
            >
              <Ionicons
                name={messageType === 'success' ? 'checkmark-circle' : 'alert-circle'}
                size={16}
                color={messageType === 'success' ? theme.colors.success : theme.colors.error}
              />
              <Text
                style={[
                  styles.messageText,
                  messageType === 'success' && styles.successText,
                  messageType === 'error' && styles.errorText,
                ]}
              >
                {message}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  messageContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  successMessage: {
    backgroundColor: theme.colors.success + '15',
  },
  errorMessage: {
    backgroundColor: theme.colors.error + '15',
  },
  messageText: {
    fontSize: theme.fontSize.sm,
    flex: 1,
    textAlign: 'right',
  },
  successText: {
    color: theme.colors.success,
  },
  errorText: {
    color: theme.colors.error,
  },
  appliedContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.success + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.success + '30',
  },
  appliedInfo: {
    flex: 1,
    gap: 4,
  },
  appliedCode: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
    textAlign: 'right',
  },
  appliedDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  appliedDiscount: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
    textAlign: 'right',
  },
  removeButton: {
    padding: theme.spacing.xs,
  },
});
