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

      // Simplified query to avoid index requirement
      const q = query(
        collection(db, 'banners'),
        orderBy('order', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const bannersData: Banner[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle multi-language title
        let bannerTitle = '';
        if (typeof data.title === 'string') {
          bannerTitle = data.title;
        } else if (data.title && typeof data.title === 'object') {
          bannerTitle = data.title.ar || data.title.en || data.title.ku || '';
        }
        
        // Handle multi-language subtitle
        let bannerSubtitle = '';
        if (typeof data.subtitle === 'string') {
          bannerSubtitle = data.subtitle;
        } else if (data.subtitle && typeof data.subtitle === 'object') {
          bannerSubtitle = data.subtitle.ar || data.subtitle.en || data.subtitle.ku || '';
        }
        
        bannersData.push({
          id: doc.id,
          title: bannerTitle,
          subtitle: bannerSubtitle,
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
