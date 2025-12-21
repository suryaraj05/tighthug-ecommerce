export const CATEGORIES = [
  'T-Shirts',
  'Hoodies',
  'Jackets',
  'Pants',
  'Shorts',
  'Track Jackets',
] as const;

export const SEASONS = [
  'Spring',
  'Summer',
  'Fall',
  'Winter',
  'All Season',
] as const;

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export const ORDER_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
} as const;

export const PAYMENT_METHODS = {
  CARD: 'Card',
  UPI: 'UPI',
  NET_BANKING: 'Net Banking',
  COD: 'COD',
} as const;

export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  PRODUCTS: '/products',
  ORDERS: '/orders',
  COUPONS: '/coupons',
  PAYMENTS: '/payments',
  SHIPPING: '/shipping',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    ORDERS: '/admin/orders',
    ANALYTICS: '/admin/analytics',
    FINANCE: '/admin/finance',
  },
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized. Please login.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_IN_USE: 'This email is already registered.',
  WEAK_PASSWORD: 'Password should be at least 6 characters.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_PHONE: 'Please enter a valid 10-digit phone number.',
  INVALID_ZIP: 'Please enter a valid 6-digit zip code.',
} as const;

// Razorpay will be added later
export const RAZORPAY_KEY_ID = '';
