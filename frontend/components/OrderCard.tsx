import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../config/theme';
import { Order } from '../hooks/useOrders';

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const router = useRouter();

  // Safety check
  if (!order || !order.pricing) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      case 'shipped':
        return '#FF9800';
      case 'pending':
      default:
        return theme.colors.primary;
    }
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/order-details/${order.id}`)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <Text style={styles.title}>طلب لزبون</Text>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>رقم الطلب: #{order.orderNumber}</Text>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
        </View>
        
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.statusAr}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Financial Summary */}
      <View style={styles.financialSection}>
        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>مبلغ الزبون:</Text>
          <Text style={styles.financialValue}>
            {Math.round(order.pricing.finalTotal).toLocaleString('ar-IQ')} د.ع
          </Text>
        </View>

        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>سعر الجملة:</Text>
          <Text style={styles.financialValue}>
            {Math.round(order.pricing.wholesaleTotal).toLocaleString('ar-IQ')} د.ع
          </Text>
        </View>

        <View style={styles.profitRow}>
          <Text style={styles.profitLabel}>ربحك الصافي من الطلب:</Text>
          <Text style={styles.profitValue}>
            {Math.round(order.pricing.profit).toLocaleString('ar-IQ')} د.ع
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push(`/order-details/${order.id}`)}
      >
        <Ionicons name="document-text" size={18} color={theme.colors.primary} />
        <Text style={styles.actionButtonText}>عرض الفاتورة</Text>
      </TouchableOpacity>
    </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  headerRight: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: theme.spacing.xs,
  },
  orderInfo: {
    gap: 4,
  },
  orderNumber: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  orderDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginLeft: theme.spacing.sm,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  financialSection: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  financialRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  financialValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  profitRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xs,
  },
  profitLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
  },
  profitValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
  actionButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.md,
  },
  actionButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
});
