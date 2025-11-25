import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../config/theme';

interface OrderSummaryProps {
  wholesaleTotal: number;
  sellingTotal: number;
  profit: number;
  deliveryFee: number;
  discount: number;
  finalTotal: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  wholesaleTotal,
  sellingTotal,
  profit,
  deliveryFee,
  discount,
  finalTotal,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ملخص الطلب</Text>

      {/* Wholesale Total */}
      <View style={styles.row}>
        <Text style={styles.value}>
          {Math.round(wholesaleTotal).toLocaleString('ar-IQ')} د.ع
        </Text>
        <Text style={styles.label}>تكلفة الجملة</Text>
      </View>

      {/* Final Cost */}
      <View style={styles.row}>
        <Text style={styles.value}>
          {Math.round(wholesaleTotal).toLocaleString('ar-IQ')} د.ع
        </Text>
        <Text style={styles.label}>التكلفة النهائية عليك</Text>
      </View>

      <View style={styles.divider} />

      {/* Selling Total */}
      <View style={styles.row}>
        <Text style={styles.value}>
          {Math.round(sellingTotal).toLocaleString('ar-IQ')} د.ع
        </Text>
        <Text style={styles.label}>مجموع سعر البيع</Text>
      </View>

      {/* Profit - Highlighted */}
      <View style={styles.profitRow}>
        <Text style={styles.profitValue}>
          {Math.round(profit).toLocaleString('ar-IQ')} د.ع
        </Text>
        <Text style={styles.profitLabel}>ربحك الصافي من الطلب</Text>
      </View>

      <View style={styles.divider} />

      {/* Delivery Fee */}
      <View style={styles.row}>
        <Text style={styles.value}>
          {deliveryFee > 0 
            ? `${Math.round(deliveryFee).toLocaleString('ar-IQ')} د.ع`
            : 'اختر المحافظة'
          }
        </Text>
        <Text style={styles.label}>رسوم التوصيل</Text>
      </View>

      {/* Discount */}
      {discount > 0 && (
        <View style={styles.row}>
          <Text style={styles.discountValue}>
            - {Math.round(discount).toLocaleString('ar-IQ')} د.ع
          </Text>
          <Text style={styles.label}>الخصم</Text>
        </View>
      )}

      <View style={styles.divider} />

      {/* Final Total for Customer */}
      <View style={styles.totalRow}>
        <Text style={styles.totalValue}>
          {Math.round(finalTotal).toLocaleString('ar-IQ')} د.ع
        </Text>
        <Text style={styles.totalLabel}>المبلغ الإجمالي للزبون</Text>
      </View>
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
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  value: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'left',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  profitRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '15',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
  },
  profitLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
    textAlign: 'right',
  },
  profitValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
    textAlign: 'left',
  },
  discountValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
    textAlign: 'left',
  },
  totalRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    textAlign: 'left',
  },
});
