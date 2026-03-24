import {
  collection,
  query,
  getDocs,
  getDoc,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

function coerceCouponDate(value: unknown): Date | null {
  if (value == null) return null;
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    const d = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'seconds' in value &&
    typeof (value as { seconds: number }).seconds === 'number'
  ) {
    const d = new Date((value as { seconds: number }).seconds * 1000);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount: number;
  maxDiscount?: number;
  validFrom: any;
  validTill: any;
  usageLimit?: number;
  usedCount?: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  error?: string;
}

export const getAllCoupons = async (includeInactive: boolean = false): Promise<Coupon[]> => {
  try {
    let q = query(collection(db, 'coupons'));
    
    // Only filter by active if we don't want inactive ones
    if (!includeInactive) {
      q = query(q, where('isActive', '==', true));
    }
    
    const querySnapshot = await getDocs(q);
    const coupons: Coupon[] = [];

    querySnapshot.forEach((doc) => {
      coupons.push({
        id: doc.id,
        ...doc.data(),
      } as Coupon);
    });

    return coupons;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch coupons');
  }
};

export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
  try {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      return null;
    }
    const q = query(collection(db, 'coupons'), where('code', '==', normalized));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Coupon;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch coupon');
  }
};

export const validateCoupon = async (
  code: string,
  cartTotal: number
): Promise<ValidateCouponResponse> => {
  try {
    const coupon = await getCouponByCode(code);

    if (!coupon) {
      return {
        valid: false,
        error: 'Invalid coupon code',
      };
    }

    if (!coupon.isActive) {
      return {
        valid: false,
        error: 'This coupon is not active',
      };
    }

    const now = new Date();
    const validFrom = coerceCouponDate(coupon.validFrom);
    const validTill = coerceCouponDate(coupon.validTill);

    if (validFrom && now < validFrom) {
      return {
        valid: false,
        error: 'This coupon is not yet valid',
      };
    }

    if (validTill && now > validTill) {
      return {
        valid: false,
        error: 'This coupon has expired',
      };
    }

    const minAmount = Number(coupon.minAmount) || 0;
    if (cartTotal < minAmount) {
      return {
        valid: false,
        error: `Minimum order amount of ${minAmount} required`,
      };
    }

    const usageLimit = coupon.usageLimit ?? 0;
    const usedCount = coupon.usedCount ?? 0;
    if (usageLimit > 0 && usedCount >= usageLimit) {
      return {
        valid: false,
        error: 'This coupon has reached its usage limit',
      };
    }

    let discountAmount = 0;

    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Don't exceed cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    return {
      valid: true,
      coupon,
      discountAmount,
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'Failed to validate coupon',
    };
  }
};

export const applyCoupon = async (
  code: string,
  cartTotal: number
): Promise<ValidateCouponResponse> => {
  return validateCoupon(code, cartTotal);
};

export const createCoupon = async (couponData: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'coupons'), {
      ...couponData,
      code: couponData.code.toUpperCase(),
      usedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create coupon');
  }
};

export const updateCoupon = async (couponId: string, updates: Partial<Coupon>): Promise<void> => {
  try {
    const couponRef = doc(db, 'coupons', couponId);
    await updateDoc(couponRef, {
      ...updates,
      code: updates.code?.toUpperCase(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update coupon');
  }
};

export const deleteCoupon = async (couponId: string): Promise<void> => {
  try {
    const couponRef = doc(db, 'coupons', couponId);
    await deleteDoc(couponRef);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete coupon');
  }
};

export const toggleCouponStatus = async (couponId: string, isActive: boolean): Promise<void> => {
  try {
    await updateCoupon(couponId, { isActive });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to toggle coupon status');
  }
};

export const calculateCouponDiscount = (
  coupon: Coupon,
  cartTotal: number
): number => {
  const minAmount = Number(coupon.minAmount) || 0;
  if (cartTotal < minAmount) {
    return 0;
  }

  let discount = 0;

  if (coupon.discountType === 'percentage') {
    discount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  // Don't exceed cart total
  return Math.min(discount, cartTotal);
};
