import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../config/theme';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { Banner } from '../components/Banner';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { TabBar } from '../components/TabBar';
import { WhatsAppButton } from '../components/WhatsAppButton';

// Mock data - في الإصدار النهائي سيتم جلبها من Firebase
const categories = [
  { id: '1', name: 'الكل', icon: 'grid' as const, color: theme.colors.primary },
  { id: '2', name: 'جمال', icon: 'rose' as const, color: '#EC4899' },
  { id: '3', name: 'أزياء', icon: 'shirt' as const, color: '#8B5CF6' },
  { id: '4', name: 'إلكترونيات', icon: 'phone-portrait' as const, color: '#3B82F6' },
  { id: '5', name: 'منزل', icon: 'home' as const, color: '#10B981' },
];

const mockProducts = [
  {
    id: '1',
    name: 'سماعة Air Pro اللاسلكية',
    image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400',
    wholesalePrice: 4750,
    tags: ['بطارية قوية', 'صوت نقي'],
    status: 'متوفر',
  },
  {
    id: '2',
    name: 'طقم مكياج فاخر',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    wholesalePrice: 12500,
    tags: ['حصري', 'جو رومانسي'],
    status: 'كمية محدودة',
  },
  {
    id: '3',
    name: 'ساعة ذكية رياضية',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    wholesalePrice: 8900,
    tags: ['مقاوم للماء', 'تتبع صحي'],
    status: 'متوفر',
  },
  {
    id: '4',
    name: 'مقلاة غير لاصقة',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    wholesalePrice: 3200,
    tags: ['مسطح غير لاصق', 'سهل التنظيف'],
    status: 'متوفر',
  },
  {
    id: '5',
    name: 'حقيبة جلدية فاخرة',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
    wholesalePrice: 15750,
    tags: ['جلد أصلي', 'تصميم عصري'],
    status: 'متوفر',
  },
  {
    id: '6',
    name: 'عطر رجالي فاخر',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
    wholesalePrice: 6800,
    tags: ['رائحة مميزة', 'يدوم طويلاً'],
    status: 'كمية محدودة',
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');

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
    Alert.alert(product.name, 'سيتم فتح تفاصيل المنتج');
  };

  const handleAddToCart = (product: any) => {
    Alert.alert('تمت الإضافة', `تمت إضافة ${product.name} إلى السلة`);
  };

  const renderProduct = ({ item }: any) => (
    <View style={styles.productWrapper}>
      <ProductCard
        {...item}
        onPress={() => handleProductPress(item)}
        onAddToCart={() => handleAddToCart(item)}
      />
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                icon={category.icon}
                title={category.name}
                color={category.color}
                onPress={() => Alert.alert(category.name, 'تصفح قسم ' + category.name)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المنتجات المميزة</Text>
          <FlatList
            data={mockProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.productsContainer}
          />
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
});
