import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { theme } from '../config/theme';

interface Variant {
  id: string;
  name: string;
  color?: string;
  image?: string;
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
    variants?: Variant[];
    sizes?: string[];
  };
  onAddToCart: (data: {
    quantity: number;
    sellingPrice: number;
    selectedVariant?: string;
    selectedSize?: string;
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
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();

  const profit = useMemo(() => {
    return Math.round((sellingPrice - product.wholesalePrice) * quantity);
  }, [sellingPrice, product.wholesalePrice, quantity]);

  const handleQuantityChange = (increment: boolean) => {
    const newQuantity = increment ? quantity + 1 : quantity - 1;
    const maxQty = product.maxOrderQuantity || product.stock;
    
    if (newQuantity >= 1 && newQuantity <= maxQty) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Validate variant selection if product has variants
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      Alert.alert('تنبيه', 'الرجاء اختيار اللون');
      return;
    }

    // Validate size selection if product has sizes
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      Alert.alert('تنبيه', 'الرجاء اختيار القياس');
      return;
    }

    onAddToCart({
      quantity,
      sellingPrice,
      selectedVariant,
      selectedSize,
    });
    
    // Reset and close
    setQuantity(1);
    setSellingPrice(product.minSellingPrice);
    setSelectedVariant(undefined);
    setSelectedSize(undefined);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
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
                {Math.round(product.wholesalePrice).toLocaleString('ar-IQ')} د.ع
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>متوفر</Text>
              </View>
            </View>

            {/* Variants Selection */}
            {product.variants && product.variants.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>اختر اللون:</Text>
                <View style={styles.variantsContainer}>
                  {product.variants.map((variant) => (
                    <TouchableOpacity
                      key={variant.id}
                      style={[
                        styles.variantButton,
                        selectedVariant === variant.id && styles.variantSelected,
                      ]}
                      onPress={() => setSelectedVariant(variant.id)}
                    >
                      <Text
                        style={[
                          styles.variantText,
                          selectedVariant === variant.id && styles.variantTextSelected,
                        ]}
                      >
                        {variant.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Sizes Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>اختر القياس:</Text>
                <View style={styles.sizesContainer}>
                  {product.sizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeButton,
                        selectedSize === size && styles.sizeSelected,
                      ]}
                      onPress={() => setSelectedSize(size)}
                    >
                      <Text
                        style={[
                          styles.sizeText,
                          selectedSize === size && styles.sizeTextSelected,
                        ]}
                      >
                        {size}
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
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={product.minSellingPrice}
                  maximumValue={product.maxSellingPrice}
                  value={sellingPrice}
                  step={250}
                  onValueChange={(value) => {
                    const roundedValue = Math.round(value / 250) * 250;
                    setSellingPrice(roundedValue);
                  }}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.border}
                  thumbTintColor={theme.colors.primary}
                />
              </View>
              <View style={styles.priceRange}>
                <Text style={styles.rangeText}>
                  {Math.round(product.maxSellingPrice).toLocaleString('ar-IQ')}
                </Text>
                <Text style={styles.rangeText}>
                  {Math.round(product.minSellingPrice).toLocaleString('ar-IQ')}
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
                المتاح: {product.stock} / حد الطلب: {product.maxOrderQuantity || product.stock}
              </Text>
            </View>
          </ScrollView>

          {/* Add Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <Text style={styles.addButtonText}>تأكيد الإضافة</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
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
  slider: {
    width: '100%',
    height: 40,
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
});
