import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  wholesalePrice: number;
  tags?: string[];
  status?: string;
  statusBgColor?: string;
  statusTextColor?: string;
  category?: string;
  stock?: number;
  minOrder?: number;
  description?: string;
}

export const useProducts = (categoryId?: string, limitCount: number = 20) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [categoryId, limitCount]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simplified query without compound index requirement
      const q = query(
        collection(db, 'products'),
        limit(100) // Get more products and filter in code
      );

      const querySnapshot = await getDocs(q);
      const productsData: Product[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Filter by category in code (if categoryId is provided and not 'all')
        if (categoryId && categoryId !== 'all') {
          // Check if product belongs to selected category
          const productCategories = data.categories || [];
          const productCategoryId = data.categoryId || '';
          
          // Skip if doesn't match category
          if (!productCategories.includes(categoryId) && productCategoryId !== categoryId) {
            return;
          }
        }
        
        // Handle multi-language name
        let productName = '';
        if (typeof data.name === 'string') {
          productName = data.name;
        } else if (data.name && typeof data.name === 'object') {
          productName = data.name.ar || data.name.en || data.name.ku || '';
        }
        
        // Handle multi-language description
        let productDescription = '';
        if (typeof data.description === 'string') {
          productDescription = data.description;
        } else if (data.description && typeof data.description === 'object') {
          productDescription = data.description.ar || data.description.en || data.description.ku || '';
        }
        
        // Get image URL - handle multiple formats
        let imageUrl = '';
        
        // Priority 1: Check media array (new Firebase structure)
        if (data.media && Array.isArray(data.media) && data.media.length > 0) {
          // Find primary image first
          const primaryMedia = data.media.find((m: any) => m.isPrimary && m.type === 'image');
          if (primaryMedia && primaryMedia.url) {
            imageUrl = primaryMedia.url;
          } else {
            // Fallback to first image in media array
            const firstImage = data.media.find((m: any) => m.type === 'image');
            if (firstImage && firstImage.url) {
              imageUrl = firstImage.url;
            }
          }
        }
        // Priority 2: Check direct imageUrl field
        else if (data.imageUrl) {
          imageUrl = data.imageUrl;
        }
        // Priority 3: Check images array (old structure)
        else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          imageUrl = data.images[0];
        }
        
        // Get status badge with colors - use custom label/badge from Firebase or default based on stock
        let statusText = '';
        let statusBgColor = '';
        let statusTextColor = '';
        
        // Priority 1: Check label field (new Firebase structure)
        if (data.label && typeof data.label === 'object') {
          statusText = data.label.ar || data.label.en || data.label.ku || '';
          statusBgColor = data.backgroundColor || '';
          statusTextColor = data.textColor || '';
        }
        // Priority 2: Check badge field
        else if (data.badge && typeof data.badge === 'object') {
          statusText = data.badge.ar || data.badge.en || data.badge.ku || '';
          statusBgColor = data.badgeBackgroundColor || '';
          statusTextColor = data.badgeTextColor || '';
        } else if (typeof data.badge === 'string') {
          statusText = data.badge;
        }
        // Priority 3: Default status based on stock (quantity)
        else {
          const stock = data.quantity || data.stock || 0;
          if (stock > 20) {
            statusText = 'متوفر';
            statusBgColor = '#10B981';
            statusTextColor = '#FFFFFF';
          } else if (stock > 0 && stock <= 20) {
            statusText = 'كمية محدودة';
            statusBgColor = '#F59E0B';
            statusTextColor = '#FFFFFF';
          } else {
            statusText = 'غير متوفر';
            statusBgColor = '#EF4444';
            statusTextColor = '#FFFFFF';
          }
        }
        
        productsData.push({
          id: doc.id,
          name: productName,
          imageUrl: imageUrl,
          wholesalePrice: data.wholesalePrice || 0,
          tags: data.tags || [],
          status: statusText,
          statusBgColor: statusBgColor,
          statusTextColor: statusTextColor,
          category: data.category,
          stock: data.quantity || data.stock || 0, // Support both quantity and stock fields
          minOrder: data.minOrder || data.minOrderQuantity || 1,
          description: productDescription,
        });
      });

      // Sort by creation date and limit results
      productsData.sort((a, b) => {
        // Since we can't sort by createdAt in query, we'll show all for now
        return 0;
      });
      
      // Apply limit
      const limitedProducts = productsData.slice(0, limitCount);

      setProducts(limitedProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'حدث خطأ في جلب المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchProducts();
  };

  return { products, loading, error, refetch };
};
