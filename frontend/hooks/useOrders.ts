import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc,
  Timestamp,
  getDoc,
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface OrderItem {
  productId: string;
  name: string;
  imageUrl: string;
  wholesalePrice: number;
  sellingPrice: number;
  quantity: number;
  variant?: string;
  size?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  userId: string;
  items: OrderItem[];
  customer: {
    name: string;
    phone1: string;
    phone2?: string;
  };
  shipping: {
    city: string;
    cityId: string;
    area: string;
    landmark: string;
  };
  pricing: {
    wholesaleTotal: number;
    sellingTotal: number;
    profit: number;
    deliveryFee: number;
    discount: number;
    finalTotal: number;
  };
  status: string;
  statusAr: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const useOrders = (statusFilter?: string) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Build query
    const ordersRef = collection(db, 'traders', user.uid, 'orders');
    let q = query(
      ordersRef,
      orderBy('createdAt', 'desc')
    );

    // Add status filter if provided
    if (statusFilter && statusFilter !== 'all') {
      q = query(q, where('status', '==', statusFilter));
    }

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData: Order[] = [];
        snapshot.forEach((doc) => {
          ordersData.push({
            id: doc.id,
            ...doc.data(),
          } as Order);
        });
        
        console.log('📦 Orders loaded:', ordersData.length);
        setOrders(ordersData);
        setLoading(false);
      },
      (err) => {
        console.error('❌ Error fetching orders:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, statusFilter]);

  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Get next order number from counter
      const counterRef = doc(db, 'counters', 'orders');
      const counterSnap = await getDoc(counterRef);
      
      let orderNumber = 1;
      if (counterSnap.exists()) {
        orderNumber = (counterSnap.data().current || 0) + 1;
      }

      // Update counter
      await updateDoc(counterRef, {
        current: orderNumber
      });

      // Create order
      const ordersRef = collection(db, 'traders', user.uid, 'orders');
      const newOrder = {
        ...orderData,
        orderNumber,
        userId: user.uid,
        status: 'pending',
        statusAr: 'قيد المراجعة',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(ordersRef, newOrder);
      
      console.log('✅ Order created:', docRef.id);
      return {
        id: docRef.id,
        ...newOrder,
      };
    } catch (err: any) {
      console.error('❌ Error creating order:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, statusAr: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const orderRef = doc(db, 'traders', user.uid, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        statusAr,
        updatedAt: Timestamp.now(),
      });
      
      console.log('✅ Order status updated:', orderId, status);
    } catch (err: any) {
      console.error('❌ Error updating order status:', err);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
  };
};
