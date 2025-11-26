import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { theme } from '../../config/theme';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../hooks/useOrders';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    if (!user || !id) return;

    try {
      setLoading(true);
      const orderRef = doc(db, 'traders', user.uid, 'orders', id as string);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        setOrder({
          id: orderSnap.id,
          ...orderSnap.data(),
        } as Order);
      } else {
        Alert.alert('خطأ', 'لم يتم العثور على الطلب');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('تم النسخ', `تم نسخ ${label}`);
  };

  const handleCallCustomer = (phone: string) => {
    Alert.alert(
      'اتصال',
      `هل تريد الاتصال بـ ${phone}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'اتصال',
          onPress: () => Linking.openURL(`tel:${phone}`),
        },
      ]
    );
  };

  const handleWhatsApp = (phone: string, customerName: string) => {
    const message = `مرحباً ${customerName}، بخصوص طلبك رقم #${order?.orderNumber}`;
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('خطأ', 'لم نتمكن من فتح واتساب');
    });
  };

  const handleShareOrder = async () => {
    if (!order) return;

    const message = `
📦 تفاصيل الطلب #${order.orderNumber}

👤 العميل: ${order.customer.name}
📞 الهاتف: ${order.customer.phone1}
📍 العنوان: ${order.shipping.city} - ${order.shipping.area}
   ${order.shipping.landmark}

💰 المبلغ الإجمالي: ${Math.round(order.pricing.finalTotal).toLocaleString('ar-IQ')} د.ع

حالة الطلب: ${order.statusAr}
    `.trim();

    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>جاري تحميل الفاتورة...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-forward" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>فاتورة الطلب</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Invoice Header */}
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceHeaderTop}>
            <View>
              <Text style={styles.invoiceNumber}>#{order.orderNumber}</Text>
              <Text style={styles.invoiceDate}>{formatDate(order.createdAt)}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) + '20' },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.statusAr}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات العميل</Text>

          {/* Name */}
          <View style={styles.infoRow}>
            <TouchableOpacity
              onPress={() => handleCopyText(order.customer.name, 'الاسم')}
              style={styles.iconButton}
            >
              <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>الاسم:</Text>
              <Text style={styles.infoValue}>{order.customer.name}</Text>
            </View>
          </View>

          {/* Phone 1 */}
          <View style={styles.infoRow}>
            <View style={styles.phoneActions}>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('خيارات الاتصال', 'اختر طريقة الاتصال', [
                    { text: 'إلغاء', style: 'cancel' },
                    {
                      text: 'واتساب',
                      onPress: () => handleWhatsApp(order.customer.phone1, order.customer.name),
                    },
                    {
                      text: 'مكالمة',
                      onPress: () => handleCallCustomer(order.customer.phone1),
                    },
                  ])
                }
                style={styles.iconButton}
              >
                <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>الهاتف:</Text>
              <Text style={styles.infoValue}>{order.customer.phone1}</Text>
            </View>
          </View>

          {/* Phone 2 */}
          {order.customer.phone2 && (
            <View style={styles.infoRow}>
              <TouchableOpacity
                onPress={() => handleCallCustomer(order.customer.phone2!)}
                style={styles.iconButton}
              >
                <Ionicons name="call-outline" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>هاتف ثاني:</Text>
                <Text style={styles.infoValue}>{order.customer.phone2}</Text>
              </View>
            </View>
          )}

          {/* Address */}
          <View style={styles.infoRow}>
            <TouchableOpacity
              onPress={() =>
                handleCopyText(
                  `${order.shipping.city} - ${order.shipping.area} - ${order.shipping.landmark}`,
                  'العنوان'
                )
              }
              style={styles.iconButton}
            >
              <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>العنوان:</Text>
              <Text style={styles.infoValue}>
                {order.shipping.city} - {order.shipping.area}
                {'\n'}
                {order.shipping.landmark}
              </Text>
            </View>
          </View>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المنتجات</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productInfo}>
                {item.imageUrl && (
                  <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                )}
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.name}</Text>
                  {(item.variant || item.size) && (
                    <View style={styles.productVariants}>
                      {item.variant && (
                        <Text style={styles.productVariant}>اللون: {item.variant}</Text>
                      )}
                      {item.size && (
                        <Text style={styles.productVariant}>المقاس: {item.size}</Text>
                      )}
                    </View>
                  )}
                  <Text style={styles.productQuantity}>الكمية: {item.quantity}</Text>
                </View>
              </View>
              <Text style={styles.productPrice}>
                {Math.round(item.sellingPrice).toLocaleString('ar-IQ')} د.ع
              </Text>
            </View>
          ))}
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملخص الفاتورة</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryValue}>
              {Math.round(order.pricing.sellingTotal).toLocaleString('ar-IQ')} د.ع
            </Text>
            <Text style={styles.summaryLabel}>سعر المنتجات:</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryValue}>
              {Math.round(order.pricing.deliveryFee).toLocaleString('ar-IQ')} د.ع
            </Text>
            <Text style={styles.summaryLabel}>رسوم التوصيل:</Text>
          </View>

          {order.pricing.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                - {Math.round(order.pricing.discount).toLocaleString('ar-IQ')} د.ع
              </Text>
              <Text style={styles.summaryLabel}>الخصم:</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalValue}>
              {Math.round(order.pricing.finalTotal).toLocaleString('ar-IQ')} د.ع
            </Text>
            <Text style={styles.totalLabel}>الإجمالي النهائي:</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>إغلاق</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleShareOrder}>
          <Ionicons name="share-social" size={20} color={theme.colors.white} />
          <Text style={styles.primaryButtonText}>مشاركة</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  invoiceHeader: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  invoiceHeaderTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceNumber: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'right',
  },
  invoiceDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  section: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    textAlign: 'right',
    lineHeight: 22,
  },
  iconButton: {
    padding: theme.spacing.xs,
  },
  phoneActions: {
    flexDirection: 'row-reverse',
    gap: theme.spacing.xs,
  },
  productItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundGray,
  },
  productInfo: {
    flexDirection: 'row-reverse',
    flex: 1,
    gap: theme.spacing.md,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundGray,
  },
  productDetails: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'right',
  },
  productVariants: {
    flexDirection: 'row-reverse',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  productVariant: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.backgroundGray,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  productQuantity: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  productPrice: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'left',
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  totalRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  totalLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  totalValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  bottomActions: {
    flexDirection: 'row-reverse',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  primaryButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundGray,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  secondaryButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
});
