import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  increment,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCouponByCode } from './couponService';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from './emailService';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
  subtotal: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  shippingAddress: ShippingAddress;
  couponCode?: string;
  status: 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod?: string;
  paymentId?: string;
  trackingId?: string;
  createdAt: any;
  updatedAt: any;
}

export interface CreateOrderData {
  userId: string;
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  couponCode?: string;
  paymentMethod?: string;
  paymentId?: string;
}

export const createOrder = async (data: CreateOrderData): Promise<string> => {
  try {
    const subtotal = data.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Calculate discount from coupon if provided
    let discountAmount = 0;
    if (data.couponCode) {
      try {
        const coupon = await getCouponByCode(data.couponCode);
        if (coupon && coupon.isActive) {
          if (coupon.discountType === 'percentage') {
            discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }
          // Don't exceed subtotal
          discountAmount = Math.min(discountAmount, subtotal);
        }
      } catch {
        /* coupon optional */
      }
    }

    const total = subtotal - discountAmount;

    const orderData = {
      userId: data.userId,
      items: data.items,
      subtotal,
      discountAmount,
      total,
      shippingAddress: data.shippingAddress,
      couponCode: data.couponCode || null,
      status: data.paymentMethod === 'COD' ? 'Pending' : 'Paid',
      paymentMethod: data.paymentMethod || 'COD',
      paymentId: data.paymentId ?? null,
      trackingId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);

    // Update user profile with order count and total spent
    try {
      const userRef = doc(db, 'users', data.userId);
      await updateDoc(userRef, {
        totalOrders: increment(1),
        totalSpent: increment(total),
        lastOrderDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update coupon usage count if coupon was used
      if (data.couponCode) {
        try {
          const coupon = await getCouponByCode(data.couponCode);
          if (coupon) {
            const couponRef = doc(db, 'coupons', coupon.id);
            await updateDoc(couponRef, {
              usedCount: increment(1),
              updatedAt: serverTimestamp(),
            });
          }
        } catch {
          /* non-fatal */
        }
      }
    } catch {
      // Don't fail the order if profile update fails
    }

    // Send order confirmation email (non-blocking)
    try {
      const userDoc = await getDoc(doc(db, 'users', data.userId));
      const userData = userDoc.data();
      const userEmail = userData?.email || '';
      const userName = userData?.name || 'Customer';

      if (userEmail) {
        sendOrderConfirmationEmail(userEmail, userName, docRef.id, {
          id: docRef.id,
          total,
          items: data.items,
          shippingAddress: data.shippingAddress,
        }).catch(() => {});
      }
    } catch {
      // Don't fail the order if email fails
    }

    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create order');
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as Order);
    });

    return orders;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch user orders');
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Order;
    }

    return null;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch order');
  }
};

export const getOrderByIdForShipping = async (orderId: string): Promise<Order | null> => {
  // Same as getOrderById, but can be extended for shipping-specific data
  return getOrderById(orderId);
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order['status']
): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    // Send status update email (non-blocking)
    try {
      const orderDoc = await getDoc(orderRef);
      if (orderDoc.exists()) {
        const orderData = orderDoc.data() as Order;
        const userDoc = await getDoc(doc(db, 'users', orderData.userId));
        const userData = userDoc.data();
        const userEmail = userData?.email || '';
        const userName = userData?.name || 'Customer';

        if (userEmail) {
          sendOrderStatusEmail(
            userEmail,
            userName,
            orderId,
            status,
            orderData.trackingId || undefined
          ).catch(() => {});
        }
      }
    } catch {
      // Don't fail the status update if email fails
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update order status');
  }
};

export const updateOrderTracking = async (
  orderId: string,
  trackingId: string
): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      trackingId,
      status: 'Shipped',
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update tracking');
  }
};

