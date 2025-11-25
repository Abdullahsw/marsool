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
      
      // Fetch from companyProfile document
      const docRef = doc(db, 'companyProfile', 'CpsSlBVTcMu4ivxsbvvt');
      const docSnap = await getDoc(docRef);

      console.log('📄 Document exists:', docSnap.exists());
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('📦 Document data:', data);
        console.log('🏙️ Cities array:', data.cities);
        
        if (data.cities && Array.isArray(data.cities)) {
          console.log('✅ Cities count:', data.cities.length);
          setCities(data.cities);
        } else {
          console.log('❌ No cities array found in document');
        }
      } else {
        console.log('❌ Document does not exist');
      }
    } catch (err: any) {
      console.error('❌ Error fetching cities:', err);
      console.error('Error details:', err.message);
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
