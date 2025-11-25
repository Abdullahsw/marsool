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
      // Fetch from companyProfile document
      const docRef = doc(db, 'companyProfile', 'marsool');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.cities && Array.isArray(data.cities)) {
          setCities(data.cities);
        }
      }
    } catch (err: any) {
      console.error('Error fetching cities:', err);
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
