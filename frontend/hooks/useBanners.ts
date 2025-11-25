import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  icon?: string;
  color?: string;
  active?: boolean;
  order?: number;
}

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, 'banners'),
        where('active', '==', true),
        orderBy('order', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const bannersData: Banner[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bannersData.push({
          id: doc.id,
          title: data.title || '',
          subtitle: data.subtitle || '',
          imageUrl: data.imageUrl,
          icon: data.icon,
          color: data.color || '#6B4CE6',
          active: data.active,
          order: data.order || 0,
        });
      });

      setBanners(bannersData);
    } catch (err: any) {
      console.error('Error fetching banners:', err);
      setError(err.message || 'حدث خطأ في جلب البنرات');
    } finally {
      setLoading(false);
    }
  };

  return { banners, loading, error };
};
