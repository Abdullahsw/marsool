import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface DeliveryCompany {
  apiUrl: string;
  credentials: {
    username: string;
    password: string;
  };
  isActive: boolean;
  isDefault: boolean;
  name: string;
}

export const useDeliveryCompany = () => {
  const [company, setCompany] = useState<DeliveryCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeliveryCompany();
  }, []);

  const fetchDeliveryCompany = async () => {
    try {
      setLoading(true);
      console.log('📦 Fetching delivery company from Firebase...');
      
      // Fetch default/active delivery company
      const docRef = doc(db, 'deliveryCompanies', 'CpsSlBVTcMu4ivxsbvvt');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as DeliveryCompany;
        console.log('✅ Delivery company loaded:', data.name);
        setCompany(data);
      } else {
        console.log('❌ Delivery company not found');
        setError('Delivery company not found');
      }
    } catch (err: any) {
      console.error('❌ Error fetching delivery company:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { company, loading, error, refetch: fetchDeliveryCompany };
};
