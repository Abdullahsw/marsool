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

      let q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      // Filter by category if provided
      if (categoryId && categoryId !== 'all') {
        q = query(
          collection(db, 'products'),
          where('categoryId', '==', categoryId),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      const productsData: Product[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
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
        
        productsData.push({
          id: doc.id,
          name: productName,
          imageUrl: data.imageUrl || data.images?.[0] || '',
          wholesalePrice: data.wholesalePrice || 0,
          tags: data.tags || [],
          status: data.stock > 0 ? 'متوفر' : 'غير متوفر',
          category: data.category,
          stock: data.stock || 0,
          minOrder: data.minOrder || 1,
          description: productDescription,
        });
      });

      setProducts(productsData);
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
