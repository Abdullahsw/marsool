import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { useCart } from '../contexts/CartContext';

interface TabItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
}

const tabs: TabItem[] = [
  { id: 'home', icon: 'home', label: 'الرئيسية', route: '/home' },
  { id: 'products', icon: 'cube', label: 'المنتجات', route: '/home' },
  { id: 'cart', icon: 'cart', label: 'السلة', route: '/cart' },
  { id: 'orders', icon: 'document-text', label: 'الطلبات', route: '/home' },
  { id: 'profile', icon: 'person', label: 'حسابي', route: '/home' },
];

interface TabBarProps {
  activeTab?: string;
  onTabPress?: (tabId: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab = 'home',
  onTabPress,
}) => {
  const router = useRouter();
  const cart = useCart();
  const cartItemsCount = cart.getTotalItems();
  const handleTabPress = (tab: TabItem) => {
    if (tab.route) {
      router.push(tab.route);
    }
    onTabPress?.(tab.id);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const badge = tab.id === 'cart' ? cartItemsCount : 0;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={isActive ? tab.icon : (`${tab.icon}-outline` as any)}
                size={24}
                color={isActive ? theme.colors.primary : theme.colors.textLight}
              />
              {badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.label,
                isActive && styles.activeLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 8,
    paddingTop: 8,
    ...theme.shadows.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
  },
  label: {
    fontSize: 11,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
  },
  activeLabel: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});
