import axios from 'axios';
import { API_ENDPOINTS, RAZORPAY_KEY_ID } from '../utils/constants';

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export interface RazorpayOrderData {
  orderId: string;
  amount: number;
  currency?: string;
}

export interface RazorpayPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const createRazorpayOrder = async (
  orderId: string,
  amount: number
): Promise<any> => {
  try {
    // Since we're using Firebase backend, this would typically call a Cloud Function
    // For now, we'll create the order client-side (not recommended for production)
    // In production, this should call your backend API
    
    const response = await axios.post(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PAYMENTS}/create`,
      {
        orderId,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
      }
    );

    return response.data;
  } catch (error: any) {
    // Fallback: Create order directly with Razorpay (requires backend)
    throw new Error(error.message || 'Failed to create payment order');
  }
};

export const verifyPaymentSignature = async (
  razorpayData: RazorpayPaymentData
): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PAYMENTS}/verify`,
      razorpayData
    );

    return response.data.success === true;
  } catch (error: any) {
    throw new Error(error.message || 'Payment verification failed');
  }
};

export const openRazorpayCheckout = async (
  orderData: any,
  options: {
    name: string;
    description: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    onSuccess: (paymentId: string, orderId: string, signature: string) => void;
    onError: (error: string) => void;
  }
): Promise<void> => {
  try {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      throw new Error('Failed to load Razorpay script');
    }

    const razorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: options.name,
      description: options.description,
      order_id: orderData.id,
      prefill: options.prefill || {},
      handler: (response: any) => {
        options.onSuccess(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );
      },
      modal: {
        ondismiss: () => {
          options.onError('Payment cancelled');
        },
      },
      theme: {
        color: '#000000',
      },
    };

    const razorpay = new (window as any).Razorpay(razorpayOptions);
    razorpay.open();
  } catch (error: any) {
    options.onError(error.message || 'Failed to open payment gateway');
  }
};

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

