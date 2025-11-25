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
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';
import { TabBar } from '../../components/TabBar';
import { ImageCarousel } from '../../components/ImageCarousel';
import { AddToCartModal } from '../../components/AddToCartModal';
import { ProductCard } from '../../components/ProductCard';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Clipboard from 'expo-clipboard';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const productDoc = await getDoc(doc(db, 'products', id as string));
      
      if (productDoc.exists()) {
        const data = productDoc.data();
        
        // Parse product data
        const parsedProduct = {
          id: productDoc.id,
          name: typeof data.name === 'object' ? (data.name.ar || data.name.en || data.name.ku) : data.name,
          description: typeof data.description === 'object' ? (data.description.ar || data.description.en || data.description.ku) : data.description,
          wholesalePrice: data.wholesalePrice || 0,
          minSellingPrice: data.minSellingPrice || 0,
          maxSellingPrice: data.maxSellingPrice || 30000,
          stock: data.quantity || data.stock || 0,
          maxOrderQuantity: data.maxOrderQuantity || 6,
          images: parseImages(data),
          downloadMediaLinks: data.downloadMediaLinks || [],
          variants: parseVariants(data.variantSchema),
          sizes: parseSizes(data.variantSchema),
          categories: data.categories || [],
        };
        
        setProduct(parsedProduct);
        
        // Fetch similar products
        if (parsedProduct.categories.length > 0) {
          fetchSimilarProducts(parsedProduct.categories[0], productDoc.id);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء جلب تفاصيل المنتج');
    } finally {
      setLoading(false);
    }
  };

  const parseImages = (data: any) => {
    const images: string[] = [];
    
    if (data.media && Array.isArray(data.media)) {
      data.media.forEach((m: any) => {
        if (m.type === 'image' && m.url) {
          images.push(m.url);
        }
      });
    }
    
    if (images.length === 0 && data.imageUrl) {
      images.push(data.imageUrl);
    }
    
    return images;
  };

  const parseVariants = (variantSchema: any) => {
    if (!variantSchema || !Array.isArray(variantSchema)) return undefined;
    
    const colorVariant = variantSchema.find((v: any) => v.type === 'color');
    if (colorVariant && colorVariant.options) {
      return colorVariant.options.map((opt: any, index: number) => ({
        id: opt.value || `color-${index}`,
        name: typeof opt.label === 'object' ? (opt.label.ar || opt.label.en) : opt.label,
        color: opt.value,
      }));
    }
    
    return undefined;
  };

  const parseSizes = (variantSchema: any) => {
    if (!variantSchema || !Array.isArray(variantSchema)) return undefined;
    
    const sizeVariant = variantSchema.find((v: any) => v.type === 'size');
    if (sizeVariant && sizeVariant.options) {
      return sizeVariant.options.map((opt: any) => 
        typeof opt.label === 'object' ? (opt.label.ar || opt.label.en) : opt.label
      );
    }
    
    return undefined;
  };

  const fetchSimilarProducts = async (categoryId: string, currentProductId: string) => {
    try {
      const q = query(
        collection(db, 'products'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const products: any[] = [];
      
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentProductId) {
          const data = doc.data();
          const categories = data.categories || [];
          
          if (categories.includes(categoryId)) {
            products.push({
              id: doc.id,
              name: typeof data.name === 'object' ? (data.name.ar || data.name.en) : data.name,
              imageUrl: parseImages(data)[0] || '',
              wholesalePrice: data.wholesalePrice || 0,
              status: 'متوفر',
            });
          }
        }
      });
      
      setSimilarProducts(products.slice(0, 6));
    } catch (error) {
      console.error('Error fetching similar products:', error);
    }
  };

  const handleDownloadImage = async (imageUrl: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى المعرض');
        return;
      }

      const fileUri = FileSystem.documentDirectory + 'product-image.jpg';
      const downloadResumable = FileSystem.createDownloadResumable(
        imageUrl,
        fileUri
      );

      const result = await downloadResumable.downloadAsync();
      if (result) {
        await MediaLibrary.createAssetAsync(result.uri);
        Alert.alert('نجح', 'تم تحميل الصورة بنجاح');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل الصورة');
    }
  };

  const handleCopyDescription = async () => {
    const text = `${product.name}\n\n${product.description}`;
    await Clipboard.setStringAsync(text);
    Alert.alert('تم النسخ', 'تم نسخ الاسم والوصف إلى الحافظة');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${product.name}\n\nسعر الجملة: ${product.wholesalePrice} د.ع\n\n${product.description}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddToCart = (data: any) => {
    Alert.alert('تمت الإضافة', 'تمت إضافة المنتج إلى السلة بنجاح');
    // TODO: Add to cart logic
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>المنتج غير موجود</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Keep Main Header and TabBar visible */}
      <Header
        title="تفاصيل المنتج"
        onMenuPress={() => Alert.alert('القائمة', 'القائمة')}
        onNotificationPress={() => Alert.alert('الإشعارات', 'الإشعارات')}
        onAddPress={() => Alert.alert('إضافة', 'إضافة')}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <ImageCarousel images={product.images} />
          
          {/* Action Buttons Overlay - Vertical on Left */}
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Alert.alert(
                  'تحميل الصور',
                  'اختر ماتريد تحميله',
                  [
                    {
                      text: 'تحميل الصورة الرئيسية',
                      onPress: () => handleDownloadImage(product.images[0]),
                    },
                    {
                      text: `تحميل كل الصور (${product.images.length})`,
                      onPress: () => {
                        product.images.forEach((img: string) => handleDownloadImage(img));
                      },
                    },
                    { text: 'إلغاء', style: 'cancel' },
                  ]
                );
              }}
            >
              <Ionicons name="download" size={20} color={theme.colors.white} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
          
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-forward" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameContainer}>
            <TouchableOpacity
              style={styles.copyIcon}
              onPress={async () => {
                await Clipboard.setStringAsync(product.name);
                Alert.alert('تم النسخ', 'تم نسخ اسم المنتج');
              }}
            >
              <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.productName}>{product.name}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>سعر الجملة:</Text>
            <Text style={styles.price}>
              {Math.round(product.wholesalePrice).toLocaleString('ar-IQ')} د.ع
            </Text>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="cart" size={20} color={theme.colors.white} />
            <Text style={styles.addToCartText}>إضافة للسلة</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              style={styles.copyIcon}
              onPress={async () => {
                await Clipboard.setStringAsync(product.description);
                Alert.alert('تم النسخ', 'تم نسخ الوصف');
              }}
            >
              <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>الوصف</Text>
          </View>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Download Media */}
        {product.downloadMediaLinks && product.downloadMediaLinks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تحميل الوسائط</Text>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => setShowMediaModal(true)}
            >
              <Text style={styles.downloadButtonText}>
                تحميل صور وفيديوهات إعلانية
              </Text>
            </TouchableOpacity>
            
            {showMediaModal && (
              <View style={styles.mediaLinksContainer}>
                {product.downloadMediaLinks.map((link: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.mediaLinkButton}
                    onPress={() => Linking.openURL(link.url)}
                  >
                    <Ionicons name="videocam" size={20} color={theme.colors.primary} />
                    <Text style={styles.mediaLinkText}>
                      {typeof link.label === 'object' 
                        ? (link.label.ar || link.label.en || link.label.ku)
                        : link.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>منتجات مشابهة</Text>
              <TouchableOpacity>
                <Text style={styles.viewMore}>مشاهدة المزيد</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={similarProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.similarProduct}>
                  <ProductCard
                    {...item}
                    image={item.imageUrl}
                    onPress={() => router.push(`/product/${item.id}`)}
                    onAddToCart={() => Alert.alert('إضافة', 'سيتم إضافة المنتج')}
                  />
                </View>
              )}
            />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add to Cart Modal */}
      <AddToCartModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        product={product}
        onAddToCart={handleAddToCart}
      />

      {/* Bottom Tab Bar */}
      <TabBar activeTab="products" onTabPress={() => {}} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.error,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  carouselContainer: {
    position: 'relative',
  },
  imageActions: {
    position: 'absolute',
    top: theme.spacing.xl,
    left: theme.spacing.md,
    gap: theme.spacing.md,
    zIndex: 10,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing.xl,
    right: theme.spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  infoContainer: {
    padding: theme.spacing.lg,
  },
  nameContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  productName: {
    flex: 1,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'right',
  },
  copyIcon: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  priceLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  price: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  addToCartButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  addToCartText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  section: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.backgroundGray,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    textAlign: 'right',
  },
  downloadButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  mediaLinksContainer: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  mediaLinkButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundGray,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  mediaLinkText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    textAlign: 'right',
  },
  viewMore: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  similarProduct: {
    width: 180,
    marginLeft: theme.spacing.sm,
  },
});
