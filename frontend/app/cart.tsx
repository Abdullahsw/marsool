import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { useCart } from '../contexts/CartContext';
import { useOrders } from '../hooks/useOrders';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';
import { CartItem } from '../components/CartItem';
import { CouponSection } from '../components/CouponSection';
import { OrderSummary } from '../components/OrderSummary';
import { ShippingForm, ShippingData } from '../components/ShippingForm';
import { Coupon } from '../hooks/useCoupons';

export default function CartScreen() {
  const router = useRouter();
  const cart = useCart();
  const { createOrder } = useOrders();
  
  const [shippingData, setShippingData] = useState<ShippingData>({
    customerName: '',
    phone1: '',
    landmark: '',
  });
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const wholesaleTotal = cart.getWholesaleTotal();
  const sellingTotal = cart.getSellingTotal();
  const profit = cart.getProfit();
  const deliveryFee = shippingData.city?.deliveryFee || 0;
  const finalTotal = sellingTotal + deliveryFee - discount;

  const handleCouponApplied = (discountAmount: number, coupon: Coupon) => {
    setDiscount(discountAmount);
    setAppliedCoupon(coupon);
  };

  const handleCouponRemoved = () => {
    setDiscount(0);
    setAppliedCoupon(null);
  };

  const validateForm = (): boolean => {
    console.log('🔍 Validating form...', shippingData);

    // Phone1 is required
    if (!shippingData.phone1 || !shippingData.phone1.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال رقم الهاتف الأول');
      return false;
    }

    // Validate Iraqi phone format (+964 + 10 digits starting with 7)
    const phoneRegex = /^\+9647\d{9}$/;
    if (!phoneRegex.test(shippingData.phone1)) {
      Alert.alert('خطأ', 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 7 ويتكون من 10 أرقام');
      return false;
    }

    // Validate phone2 if provided
    if (shippingData.phone2 && shippingData.phone2.trim() && !phoneRegex.test(shippingData.phone2)) {
      Alert.alert('خطأ', 'رقم الهاتف الثاني غير صحيح. يجب أن يبدأ بـ 7 ويتكون من 10 أرقام');
      return false;
    }

    // City is required
    if (!shippingData.city) {
      Alert.alert('خطأ', 'الرجاء اختيار المحافظة');
      return false;
    }

    // Area is required
    if (!shippingData.area || !shippingData.area.trim()) {
      Alert.alert('خطأ', 'الرجاء اختيار المنطقة');
      return false;
    }

    // Name, phone2, landmark, notes are optional
    console.log('✅ Validation passed');
    return true;
  };

  const handleSubmitOrder = async () => {
    console.log('🔵 handleSubmitOrder called');
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    if (cart.items.length === 0) {
      Alert.alert('تنبيه', 'السلة فارغة');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('📝 Preparing order data...');

      // Prepare order data
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId,
          name: item.name,
          imageUrl: item.imageUrl,
          wholesalePrice: item.wholesalePrice,
          sellingPrice: item.sellingPrice,
          quantity: item.quantity,
          variant: item.selectedVariant,
          size: item.selectedSize,
        })),
        customer: {
          name: shippingData.customerName,
          phone1: shippingData.phone1,
          phone2: shippingData.phone2 || '',
        },
        shipping: {
          city: shippingData.city?.displayName || '',
          cityId: shippingData.city?.companyCityId || '',
          area: shippingData.area || '',
          landmark: shippingData.landmark,
        },
        pricing: {
          wholesaleTotal,
          sellingTotal,
          profit,
          deliveryFee,
          discount,
          finalTotal,
        },
        notes: shippingData.notes || '',
      };

      console.log('📦 Order Data:', JSON.stringify(orderData, null, 2));

      // Save order to Firebase
      console.log('💾 Saving order to Firebase...');
      const newOrder = await createOrder(orderData);
      console.log('✅ Order created successfully:', newOrder);

      // Clear cart first
      cart.clearCart();

      // Show success message and redirect to orders
      Alert.alert(
        'نجح الطلب! 🎉',
        `تم إنشاء الطلب رقم #${newOrder.orderNumber}\nالمبلغ الإجمالي: ${finalTotal.toLocaleString('ar-IQ')} د.ع\nربحك: ${profit.toLocaleString('ar-IQ')} د.ع`,
        [
          {
            text: 'عرض الطلب',
            onPress: () => {
              router.push('/orders');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Error submitting order:', error);
      console.error('❌ Error details:', error.message);
      Alert.alert('خطأ', `حدث خطأ أثناء إرسال الطلب: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empty Cart State
  if (cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title="السلة"
          onMenuPress={() => Alert.alert('القائمة', 'القائمة')}
          onNotificationPress={() => Alert.alert('الإشعارات', 'الإشعارات')}
          onAddPress={() => Alert.alert('إضافة', 'إضافة')}
        />

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart-outline" size={100} color={theme.colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>سلتك فارغة حالياً</Text>
          <Text style={styles.emptySubtitle}>لنبدأ بتحقيق الأرباح!</Text>
          
          <TouchableOpacity
            style={styles.startShoppingButton}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.startShoppingButtonText}>ابدأ بالتسوق الآن</Text>
          </TouchableOpacity>
        </View>

        <TabBar activeTab="cart" onTabPress={() => {}} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={`السلة (${cart.getTotalItems()})`}
        onMenuPress={() => Alert.alert('القائمة', 'القائمة')}
        onNotificationPress={() => Alert.alert('الإشعارات', 'الإشعارات')}
        onAddPress={() => Alert.alert('إضافة', 'إضافة')}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المنتجات ({cart.items.length})</Text>
          {cart.items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={(quantity) => cart.updateQuantity(item.id, quantity)}
              onUpdatePrice={(price) => cart.updateSellingPrice(item.id, price)}
              onRemove={() => {
                Alert.alert(
                  'تأكيد الحذف',
                  'هل تريد حذف هذا المنتج من السلة؟',
                  [
                    { text: 'إلغاء', style: 'cancel' },
                    {
                      text: 'حذف',
                      style: 'destructive',
                      onPress: () => cart.removeFromCart(item.id),
                    },
                  ]
                );
              }}
            />
          ))}
        </View>

        {/* Coupon Section */}
        <CouponSection
          orderTotal={sellingTotal}
          onCouponApplied={handleCouponApplied}
          onCouponRemoved={handleCouponRemoved}
        />

        {/* Order Summary */}
        <OrderSummary
          wholesaleTotal={wholesaleTotal}
          sellingTotal={sellingTotal}
          profit={profit}
          deliveryFee={deliveryFee}
          discount={discount}
          finalTotal={finalTotal}
        />

        {/* Shipping Form */}
        <ShippingForm onShippingChange={setShippingData} />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmitOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.white} />
              <Text style={styles.submitButtonText}>إتمام الطلب</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <TabBar activeTab="cart" onTabPress={() => {}} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: theme.spacing.md,
  },
  submitButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  startShoppingButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl * 2,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  startShoppingButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
});
