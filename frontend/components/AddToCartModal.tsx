import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
  I18nManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { theme } from '../config/theme';

// Detect if RTL is enabled
const isRTL = I18nManager.isRTL;

interface ColorVariant {
  id: string;
  name: string;
  imageUrl?: string;
  subProperty?: {
    name: string;
    options: SizeOption[];
  };
}

interface SizeOption {
  value: string;
  quantity: number;
  wholesalePrice: number;
}

interface AddToCartModalProps {
  visible: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    wholesalePrice: number;
    minSellingPrice: number;
    maxSellingPrice: number;
    stock: number;
    maxOrderQuantity?: number;
    variants?: ColorVariant[];
  };
  onAddToCart: (data: {
    quantity: number;
    sellingPrice: number;
    selectedVariant?: string;
    selectedSize?: string;
    wholesalePrice: number;
  }) => void;
}

export const AddToCartModal: React.FC<AddToCartModalProps> = ({
  visible,
  onClose,
  product,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [sellingPrice, setSellingPrice] = useState(product.minSellingPrice);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | undefined>();
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number | undefined>();
  const [currentWholesalePrice, setCurrentWholesalePrice] = useState(product.wholesalePrice);
  const [availableStock, setAvailableStock] = useState(product.stock);

  // Debug log
  useEffect(() => {
    console.log('🛒 AddToCartModal Opened!');
    console.log('🛒 Product:', product);
    console.log('🛒 Has Variants:', !!product.variants);
    console.log('🛒 Variants Count:', product.variants?.length || 0);
    if (product.variants && product.variants.length > 0) {
      console.log('🛒 First Variant:', product.variants[0]);
      console.log('🛒 All Variants:', JSON.stringify(product.variants, null, 2));
    } else {
      console.log('❌ NO VARIANTS FOUND!');
    }
  }, [product, visible]);

  // Get available sizes based on selected color
  const availableSizes = useMemo(() => {
    if (selectedVariantIndex !== undefined && product.variants) {
      return product.variants[selectedVariantIndex]?.subProperty?.options || [];
    }
    return [];
  }, [selectedVariantIndex, product.variants]);

  // Update wholesale price and stock when variant/size changes
  useEffect(() => {
    if (selectedVariantIndex !== undefined && selectedSizeIndex !== undefined && availableSizes.length > 0) {
      const selectedSize = availableSizes[selectedSizeIndex];
      setCurrentWholesalePrice(selectedSize.wholesalePrice);
      setAvailableStock(selectedSize.quantity);
    } else {
      setCurrentWholesalePrice(product.wholesalePrice);
      setAvailableStock(product.stock);
    }
  }, [selectedVariantIndex, selectedSizeIndex, availableSizes, product]);

  const profit = useMemo(() => {
    return Math.round((sellingPrice - currentWholesalePrice) * quantity);
  }, [sellingPrice, currentWholesalePrice, quantity]);

  const handleQuantityChange = (increment: boolean) => {
    const newQuantity = increment ? quantity + 1 : quantity - 1;
    const maxQty = product.maxOrderQuantity || product.stock;
    
    if (newQuantity >= 1 && newQuantity <= maxQty) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Validate variant selection if product has variants
    if (product.variants && product.variants.length > 0 && selectedVariantIndex === undefined) {
      Alert.alert('تنبيه', 'الرجاء اختيار اللون');
      return;
    }

    // Validate size selection if available sizes exist
    if (availableSizes.length > 0 && selectedSizeIndex === undefined) {
      Alert.alert('تنبيه', 'الرجاء اختيار القياس');
      return;
    }

    const selectedVariantName = selectedVariantIndex !== undefined && product.variants
      ? product.variants[selectedVariantIndex].name
      : undefined;
      
    const selectedSizeValue = selectedSizeIndex !== undefined && availableSizes.length > 0
      ? availableSizes[selectedSizeIndex].value
      : undefined;

    onAddToCart({
      quantity,
      sellingPrice,
      selectedVariant: selectedVariantName,
      selectedSize: selectedSizeValue,
      wholesalePrice: currentWholesalePrice,
    });
    
    // Reset and close
    setQuantity(1);
    setSellingPrice(product.minSellingPrice);
    setSelectedVariantIndex(undefined);
    setSelectedSizeIndex(undefined);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{product.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Wholesale Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>سعر الجملة:</Text>
              <Text style={styles.wholesalePrice}>
                {Math.round(currentWholesalePrice).toLocaleString('ar-IQ')} د.ع
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: availableStock > 0 ? theme.colors.success : theme.colors.error }
              ]}>
                <Text style={styles.statusText}>
                  {availableStock > 0 ? `متوفر (${availableStock})` : 'غير متوفر'}
                </Text>
              </View>
            </View>

            {/* Color Variants Selection */}
            {product.variants && product.variants.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>اختر لون:</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.variantsContainer}
                  style={{ flexGrow: 0 }}
                >
                  {product.variants.map((variant, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.colorVariantCard,
                        selectedVariantIndex === index && styles.colorVariantSelected,
                        { marginLeft: index === 0 ? 0 : theme.spacing.sm }
                      ]}
                      onPress={() => {
                        console.log('🎨 Color selected:', variant.name);
                        setSelectedVariantIndex(index);
                        setSelectedSizeIndex(undefined); // Reset size when color changes
                      }}
                    >
                      {variant.imageUrl ? (
                        <Image
                          source={{ uri: variant.imageUrl }}
                          style={styles.colorImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.colorImage, { backgroundColor: theme.colors.backgroundGray, justifyContent: 'center', alignItems: 'center' }]}>
                          <Text style={{ fontSize: 40 }}>🎨</Text>
                        </View>
                      )}
                      <Text style={styles.colorName}>{variant.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Sizes Selection (appears after color selection) */}
            {selectedVariantIndex !== undefined && availableSizes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>اختر قياس:</Text>
                <View style={styles.sizesContainer}>
                  {availableSizes.map((size, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.sizeButton,
                        selectedSizeIndex === index && styles.sizeSelected,
                      ]}
                      onPress={() => setSelectedSizeIndex(index)}
                    >
                      <Text
                        style={[
                          styles.sizeText,
                          selectedSizeIndex === index && styles.sizeTextSelected,
                        ]}
                      >
                        {size.value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Selling Price */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>سعر البيع للزبون:</Text>
              <TextInput
                style={styles.priceInput}
                value={Math.round(sellingPrice).toLocaleString('ar-IQ')}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  const price = parseInt(numericText) || product.minSellingPrice;
                  // Round to nearest 250
                  const roundedPrice = Math.round(price / 250) * 250;
                  if (roundedPrice >= product.minSellingPrice && roundedPrice <= product.maxSellingPrice) {
                    setSellingPrice(roundedPrice);
                  }
                }}
                keyboardType="numeric"
              />
              <Slider
                style={styles.slider}
                minimumValue={product.minSellingPrice}
                maximumValue={product.maxSellingPrice}
                value={product.maxSellingPrice + product.minSellingPrice - sellingPrice}
                step={250}
                onValueChange={(value) => {
                  // Reverse the value for RTL
                  const reversedValue = product.maxSellingPrice + product.minSellingPrice - value;
                  const roundedValue = Math.round(reversedValue / 250) * 250;
                  setSellingPrice(roundedValue);
                }}
                minimumTrackTintColor={theme.colors.border}
                maximumTrackTintColor={theme.colors.primary}
                thumbTintColor={theme.colors.primary}
              />
              <View style={styles.priceRange}>
                <Text style={styles.rangeText}>
                  {Math.round(product.minSellingPrice).toLocaleString('ar-IQ')}
                </Text>
                <Text style={styles.rangeText}>
                  {Math.round(product.maxSellingPrice).toLocaleString('ar-IQ')}
                </Text>
              </View>
              
              {/* Profit Display */}
              <View style={styles.profitContainer}>
                <Text style={styles.profitValue}>
                  {profit.toLocaleString('ar-IQ')} د.ع
                </Text>
                <Text style={styles.profitLabel}>الربح المتوقع</Text>
              </View>
            </View>

            {/* Quantity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الكمية:</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(false)}
                >
                  <Ionicons name="remove" size={20} color={theme.colors.text} />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{quantity}</Text>
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(true)}
                >
                  <Ionicons name="add" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.stockInfo}>
                المتاح: {availableStock} / حد الطلب: {product.maxOrderQuantity || availableStock}
              </Text>
            </View>
          </ScrollView>

          {/* Add Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <Text style={styles.addButtonText}>تأكيد الإضافة</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '85%',
    paddingBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'right',
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  priceLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  wholesalePrice: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundGray,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'right',
  },
  variantsContainer: {
    flexDirection: 'row-reverse',
    paddingRight: theme.spacing.sm,
  },
  variantButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  variantSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  variantText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  variantTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  sizesContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  sizeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    minWidth: 60,
    alignItems: 'center',
  },
  sizeSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  sizeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  sizeTextSelected: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  sliderContainer: {
    transform: [{ scaleX: -1 }], // Flip horizontally for RTL
  },
  slider: {
    width: '100%',
    height: 50,
  },
  priceRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  rangeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  profitContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.success + '10',
    borderRadius: theme.borderRadius.md,
  },
  profitLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.medium,
  },
  profitValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
  quantityContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    minWidth: 60,
    textAlign: 'center',
  },
  stockInfo: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  colorVariantCard: {
    width: 110,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  colorVariantSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 3,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  colorImage: {
    width: 110,
    height: 110,
    backgroundColor: theme.colors.backgroundGray,
  },
  colorName: {
    width: '100%',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: theme.fontWeight.medium,
    backgroundColor: theme.colors.white,
  },
});
