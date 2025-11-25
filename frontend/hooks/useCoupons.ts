import { useState } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Coupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: boolean;
  usageLimit?: {
    total?: number;
    perUser?: number;
  };
  stats?: {
    totalUses: number;
  };
}

export const useCoupons = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCoupon = async (code: string, orderTotal: number): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discount?: number;
    message: string;
  }> => {
    try {
      setLoading(true);
      setError(null);

      // Fetch coupon from Firebase
      const couponsRef = collection(db, 'coupons');
      const q = query(couponsRef, where('code', '==', code.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          valid: false,
          message: 'الكود غير صحيح',
        };
      }

      const couponDoc = querySnapshot.docs[0];
      const coupon = couponDoc.data() as Coupon;

      // Check if active
      if (!coupon.isActive) {
        return {
          valid: false,
          message: 'هذا الكود غير نشط',
        };
      }

      // Check dates
      const now = new Date();
      const startDate = coupon.startDate.toDate();
      const endDate = coupon.endDate.toDate();

      if (now < startDate) {
        return {
          valid: false,
          message: 'هذا الكود لم يبدأ بعد',
        };
      }

      if (now > endDate) {
        return {
          valid: false,
          message: 'هذا الكود منتهي الصلاحية',
        };
      }

      // Check minimum order value
      if (orderTotal < coupon.minOrderValue) {
        return {
          valid: false,
          message: `الحد الأدنى للطلب ${coupon.minOrderValue.toLocaleString('ar-IQ')} د.ع`,
        };
      }

      // Check usage limit
      if (coupon.usageLimit?.total && coupon.stats?.totalUses) {
        if (coupon.stats.totalUses >= coupon.usageLimit.total) {
          return {
            valid: false,
            message: 'تم استخدام هذا الكود بالكامل',
          };
        }
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = (orderTotal * coupon.value) / 100;
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      } else {
        discount = coupon.value;
      }

      return {
        valid: true,
        coupon,
        discount: Math.round(discount),
        message: `تم تطبيق خصم ${Math.round(discount).toLocaleString('ar-IQ')} د.ع`,
      };
    } catch (err: any) {
      console.error('Error validating coupon:', err);
      setError(err.message);
      return {
        valid: false,
        message: 'حدث خطأ أثناء التحقق من الكود',
      };
    } finally {
      setLoading(false);
    }
  };

  return { validateCoupon, loading, error };
};
