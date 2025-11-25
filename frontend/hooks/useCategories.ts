import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  order?: number;
  imageUrl?: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, 'categories'),
        orderBy('order', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const categoriesData: Category[] = [
        { id: 'all', name: 'الكل', icon: 'grid', color: '#6B4CE6' },
      ];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle multi-language name
        let categoryName = '';
        if (typeof data.name === 'string') {
          categoryName = data.name;
        } else if (data.name && typeof data.name === 'object') {
          // Try to get Arabic name first, then English, then Kurdish
          categoryName = data.name.ar || data.name.en || data.name.ku || '';
        }
        
        // Get icon URL or use default icon name
        const iconData = data.icon || 'cube';
        const imageUrl = data.imageUrl || data.image || '';
        
        categoriesData.push({
          id: doc.id,
          name: categoryName,
          icon: iconData,
          color: data.color || '#6B4CE6',
          order: data.order || 0,
          imageUrl: imageUrl,
        });
      });

      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'حدث خطأ في جلب الأقسام');
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error };
};
