import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { theme } from '../config/theme';
import { CartItem as CartItemType } from '../contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onUpdatePrice: (price: number) => void;
  onRemove: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onUpdatePrice,
  onRemove,
}) => {
  const [localPrice, setLocalPrice] = useState(item.sellingPrice);

  const handleQuantityChange = (increment: boolean) => {
    const newQuantity = increment ? item.quantity + 1 : item.quantity - 1;
    if (newQuantity >= 1) {
      onUpdateQuantity(newQuantity);
    }
  };

  const handlePriceChange = (price: number) => {
    setLocalPrice(price);
    onUpdatePrice(price);
  };

  const profit = (item.sellingPrice - item.wholesalePrice) * item.quantity;

  return (
    <View style={styles.container}>
      {/* Delete Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={onRemove}>
        <Ionicons name="close-circle" size={24} color={theme.colors.error} />
      </TouchableOpacity>

      {/* Product Image */}
      <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />

      {/* Product Info */}
      <View style={styles.content}>
        {/* Product Name */}
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>

        {/* Variant Info */}
        {(item.selectedVariant || item.selectedSize) && (
          <View style={styles.variantContainer}>
            {item.selectedVariant && (
              <Text style={styles.variantText}>اللون: {item.selectedVariant}</Text>
            )}
            {item.selectedSize && (
              <Text style={styles.variantText}>القياس: {item.selectedSize}</Text>
            )}
          </View>
        )}

        {/* Wholesale Price */}
        <Text style={styles.wholesalePrice}>
          سعر الجملة: {Math.round(item.wholesalePrice).toLocaleString('ar-IQ')} د.ع
        </Text>

        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <Text style={styles.label}>الكمية:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(false)}
            >
              <Ionicons name="remove" size={18} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(true)}
            >
              <Ionicons name="add" size={18} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Selling Price Slider */}
        <View style={styles.priceSection}>
          <View style={styles.priceHeader}>
            <Text style={styles.label}>سعر البيع للقطعة:</Text>
            <TextInput
              style={styles.priceInput}
              value={Math.round(localPrice).toLocaleString('ar-IQ')}
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, '');
                const price = parseInt(numericText) || item.minSellingPrice;
                const roundedPrice = Math.round(price / 250) * 250;
                if (roundedPrice >= item.minSellingPrice && roundedPrice <= item.maxSellingPrice) {
                  handlePriceChange(roundedPrice);
                }
              }}
              keyboardType="numeric"
            />
            <Text style={styles.currency}>د.ع</Text>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={item.minSellingPrice}
            maximumValue={item.maxSellingPrice}
            value={item.maxSellingPrice + item.minSellingPrice - localPrice}
            step={250}
            onValueChange={(value) => {
              const reversedValue = item.maxSellingPrice + item.minSellingPrice - value;
              const roundedValue = Math.round(reversedValue / 250) * 250;
              handlePriceChange(roundedValue);
            }}
            minimumTrackTintColor={theme.colors.border}
            maximumTrackTintColor={theme.colors.primary}
            thumbTintColor={theme.colors.primary}
          />

          <View style={styles.priceRange}>
            <Text style={styles.rangeText}>
              {Math.round(item.minSellingPrice).toLocaleString('ar-IQ')}
            </Text>
            <Text style={styles.rangeText}>
              {Math.round(item.maxSellingPrice).toLocaleString('ar-IQ')}
            </Text>
          </View>
        </View>

        {/* Profit Display */}
        <View style={styles.profitContainer}>
          <Text style={styles.profitLabel}>الربح:</Text>
          <Text style={styles.profitValue}>
            {profit.toLocaleString('ar-IQ')} د.ع
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    zIndex: 10,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.backgroundGray,
  },
  content: {
    gap: theme.spacing.sm,
  },
  name: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'right',
  },
  variantContainer: {
    flexDirection: 'row-reverse',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  variantText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.backgroundGray,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  wholesalePrice: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  quantityContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  quantityControls: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  priceSection: {
    gap: theme.spacing.xs,
  },
  priceHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  currency: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  priceRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  profitContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.success + '10',
    borderRadius: theme.borderRadius.md,
  },
  profitLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.medium,
  },
  profitValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
});
