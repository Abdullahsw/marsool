import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../config/theme';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { Banner } from '../components/Banner';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { TabBar } from '../components/TabBar';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { categories, loading: categoriesLoading } = useCategories();
  const { products, loading: productsLoading, error, refetch } = useProducts(selectedCategory, 20);
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleMenuPress = () => {
    Alert.alert('القائمة', 'سيتم فتح القائمة الجانبية');
  };

  const handleNotificationPress = () => {
    Alert.alert('الإشعارات', 'لديك 3 إشعارات جديدة');
  };

  const handleAddPress = () => {
    Alert.alert('إضافة سريعة', 'إضافة منتج جديد');
  };

  const handleVoiceSearch = () => {
    Alert.alert('البحث الصوتي', 'سيتم تفعيل البحث الصوتي');
  };

  const handleProductPress = (product: any) => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = (product: any) => {
    Alert.alert('تمت الإضافة', `تمت إضافة ${product.name} إلى السلة`);
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const renderProduct = ({ item }: any) => (
    <View style={styles.productWrapper}>
      <ProductCard
        id={item.id}
        name={item.name}
        image={item.imageUrl}
        wholesalePrice={item.wholesalePrice}
        tags={item.tags}
        status={item.status}
        onPress={() => handleProductPress(item)}
        onAddToCart={() => handleAddToCart(item)}
      />
    </View>
  );

  const renderEmptyProducts = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>لا توجد منتجات متاحة حالياً</Text>
      <Text style={styles.emptySubtext}>سنضيف المزيد قريباً!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Header
        title="الرئيسية"
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
        onAddPress={handleAddPress}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onVoiceSearch={handleVoiceSearch}
        />

        {/* Banner */}
        <Banner />

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الأقسام</Text>
          {categoriesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  icon={category.icon as any}
                  title={category.name}
                  color={category.color}
                  imageUrl={category.imageUrl}
                  onPress={() => handleCategoryPress(category.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المنتجات المميزة</Text>
          {productsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>جاري تحميل المنتجات...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : products.length === 0 ? (
            renderEmptyProducts()
          ) : (
            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.productRow}
              contentContainerStyle={styles.productsContainer}
            />
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />

      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    textAlign: 'right',
  },
  categoriesContainer: {
    paddingHorizontal: theme.spacing.sm,
  },
  productsContainer: {
    paddingHorizontal: theme.spacing.xs,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '48%',
  },
  loadingContainer: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
