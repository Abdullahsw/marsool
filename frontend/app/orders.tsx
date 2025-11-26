import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { useOrders } from '../hooks/useOrders';
import { Header } from '../components/Header';
import { TabBar } from '../components/TabBar';
import { OrderCard } from '../components/OrderCard';

const STATUS_FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'pending', label: 'جديد' },
  { id: 'processing', label: 'قيد المراجعة' },
  { id: 'shipped', label: 'تم الشحن' },
  { id: 'completed', label: 'مكتمل' },
  { id: 'cancelled', label: 'ملغي' },
];

export default function OrdersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const { orders, loading } = useOrders(statusFilter === 'all' ? undefined : statusFilter);

  // Filter orders by search query
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber.toString().includes(query) ||
      order.customer.name.toLowerCase().includes(query) ||
      order.customer.phone1.includes(query)
    );
  });

  const selectedFilterLabel = STATUS_FILTERS.find((f) => f.id === statusFilter)?.label || 'الكل';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="الطلبات"
        onMenuPress={() => {}}
        onNotificationPress={() => {}}
        onAddPress={() => {}}
      />

      <View style={styles.content}>
        {/* Search and Filter Section */}
        <View style={styles.searchSection}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث برقم الطلب، اسم الزبون، أو رقم الهاتف"
              placeholderTextColor={theme.colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign="right"
            />
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={20} color={theme.colors.primary} />
            <Text style={styles.filterButtonText}>{selectedFilterLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>جاري تحميل الطلبات...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={80} color={theme.colors.textLight} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'لا توجد نتائج' : 'لا توجد طلبات حالياً'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'جرب البحث بكلمات مختلفة'
                : 'ابدأ بإضافة منتجات إلى السلة وإتمام طلبك الأول'}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.ordersList}
          >
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>تصفية الطلبات</Text>
            </View>

            {/* Filter Options */}
            <FlatList
              data={STATUS_FILTERS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.filterOption}
                  onPress={() => {
                    setStatusFilter(item.id);
                    setFilterModalVisible(false);
                  }}
                >
                  <View style={styles.filterOptionContent}>
                    <Text style={styles.filterOptionText}>{item.label}</Text>
                  </View>
                  {statusFilter === item.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <TabBar activeTab="orders" onTabPress={() => {}} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundGray,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  filterButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  filterButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  ordersList: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '60%',
    paddingBottom: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  filterOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundGray,
  },
  filterOptionContent: {
    flex: 1,
  },
  filterOptionText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    textAlign: 'right',
  },
});
