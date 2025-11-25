import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface City {
  companyCityId: string;
  companyCityName: string;
  deliveryFee: number;
  displayName: string;
}

export const useCities = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      console.log('🏙️ Fetching cities from Firebase...');
      
      // Check auth state
      const { auth } = await import('../config/firebase');
      console.log('👤 Current user:', auth.currentUser?.uid);
      console.log('👤 Is authenticated:', !!auth.currentUser);
      
      // Fetch from deliveryMappings document
      const docRef = doc(db, 'deliveryMappings', 'CpsSlBVTcMu4ivxsbvvt');
      const docSnap = await getDoc(docRef);

      console.log('📄 Document exists:', docSnap.exists());
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('📦 Document data keys:', Object.keys(data));
        console.log('🏙️ Cities array exists:', !!data.cities);
        console.log('🏙️ Cities is array:', Array.isArray(data.cities));
        
        if (data.cities && Array.isArray(data.cities)) {
          console.log('✅ Cities count:', data.cities.length);
          console.log('✅ First city:', data.cities[0]);
          setCities(data.cities);
        } else {
          console.log('❌ No cities array found in document');
        }
      } else {
        console.log('❌ Document does not exist');
      }
    } catch (err: any) {
      console.error('❌ Error fetching cities:', err);
      console.error('❌ Error code:', err.code);
      console.error('❌ Error message:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCityByCompanyId = (companyCityId: string): City | undefined => {
    return cities.find((city) => city.companyCityId === companyCityId);
  };

  const getCityByName = (name: string): City | undefined => {
    return cities.find(
      (city) => city.companyCityName === name || city.displayName === name
    );
  };

  return { cities, loading, error, getCityByCompanyId, getCityByName, refetch: fetchCities };
};
