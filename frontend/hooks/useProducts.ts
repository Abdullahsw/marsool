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
        productsData.push({
          id: doc.id,
          name: data.name || '',
          imageUrl: data.imageUrl || data.images?.[0] || '',
          wholesalePrice: data.wholesalePrice || 0,
          tags: data.tags || [],
          status: data.stock > 0 ? 'متوفر' : 'غير متوفر',
          category: data.category,
          stock: data.stock || 0,
          minOrder: data.minOrder || 1,
          description: data.description || '',
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
