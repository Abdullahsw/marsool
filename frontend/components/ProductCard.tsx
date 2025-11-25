import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  wholesalePrice: number;
  tags?: string[];
  status?: string;
  onPress: () => void;
  onAddToCart: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  image,
  wholesalePrice,
  tags = [],
  status = 'متوفر',
  onPress,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onToggleFavorite}
        >
          <Ionicons
            name={isFavorite ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isFavorite ? theme.colors.primary : theme.colors.white}
          />
        </TouchableOpacity>
        
        {/* Status Badge */}
        {status && (
          <View style={[
            styles.statusBadge,
            status.includes('محدود') && styles.limitedBadge
          ]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Product Name */}
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>

        {/* Price and Add to Cart */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddToCart}
          >
            <Ionicons name="cart" size={18} color={theme.colors.white} />
          </TouchableOpacity>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currency}>د.ع</Text>
            <Text style={styles.price}>
              {wholesalePrice.toLocaleString('ar-IQ')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    margin: theme.spacing.xs,
    ...theme.shadows.md,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: theme.spacing.xs,
  },
  statusBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  limitedBadge: {
    backgroundColor: theme.colors.error,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
  },
  content: {
    padding: theme.spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: theme.spacing.xs,
  },
  tag: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  name: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.sm,
    textAlign: 'right',
    minHeight: 32,
  },
  footer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
  },
  price: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  currency: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginLeft: 2,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
