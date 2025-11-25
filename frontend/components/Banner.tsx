import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { useBanners } from '../hooks/useBanners';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 180;

export const Banner: React.FC = () => {
  const { banners, loading } = useBanners();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % banners.length;
        setCurrentIndex(nextIndex);
        scrollViewRef.current?.scrollTo({
          x: nextIndex * (width - theme.spacing.xl),
          animated: true,
        });
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [currentIndex, banners.length]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          const slideIndex = Math.round(
            event.nativeEvent.contentOffset.x / (width - theme.spacing.xl)
          );
          setCurrentIndex(slideIndex);
        }}
        scrollEventThrottle={16}
      >
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            style={[styles.banner, { backgroundColor: (banner.color || theme.colors.primary) + '20' }]}
            activeOpacity={0.9}
          >
            {banner.imageUrl ? (
              <Image
                source={{ uri: banner.imageUrl }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: banner.color || theme.colors.primary }]}>
                  <Ionicons 
                    name={(banner.icon as any) || 'rocket'} 
                    size={40} 
                    color={theme.colors.white} 
                  />
                </View>
                
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{banner.title}</Text>
                  <Text style={styles.subtitle}>{banner.subtitle}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  loadingContainer: {
    height: BANNER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    width: width - (theme.spacing.md * 2),
    height: BANNER_HEIGHT,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
});
