# TightHug Store — API & Services Documentation

This document describes all APIs, services, and data operations used by the TightHug frontend.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [REST API Endpoints (Optional Backend)](#rest-api-endpoints-optional-backend)
4. [Firestore Collections & Operations](#firestore-collections--operations)
5. [External Services](#external-services)
6. [Data Types & Interfaces](#data-types--interfaces)

---

## Overview

- **Base URL (REST):** `VITE_API_BASE_URL` or `http://localhost:5000/api`
- **Auth for REST:** `Authorization: Bearer <Firebase_ID_Token>` (from `firebaseUser.getIdToken()`)
- **Headers:** `Content-Type: application/json` for JSON bodies

Most app data is handled via **Firebase (Firestore + Auth)** from the client. A separate REST backend is optional and is used for **Payments** and **Shipping** when configured.

---

## Authentication

### Firebase Authentication (Client SDK)

| Operation        | Method / SDK                     | Description |
|-----------------|-----------------------------------|-------------|
| Sign up (email) | `createUserWithEmailAndPassword` | Register with email, password, name, phone. Creates Firestore `users` doc. |
| Login (email)   | `signInWithEmailAndPassword`     | Login with email + password. |
| Login (phone)   | Lookup user by `phone` in Firestore, then `signInWithEmailAndPassword` with stored email. |
| Login (Google)  | `signInWithPopup(GoogleAuthProvider)` | Google OAuth. Creates `users` doc if new. |
| Logout          | `signOut(auth)`                  | Sign out. |
| Forgot password | `sendPasswordResetEmail(auth, email)` | Sends reset email. |
| Forgot by phone | Lookup email by `phone` in `users`, then `sendPasswordResetEmail`. |
| Update profile  | `updateProfile` + Firestore `users` merge | Update name, phone. |
| Get ID token   | `firebaseUser.getIdToken()`      | Used as Bearer token for REST API. |

### Firestore: `users` document (per uid)

- `uid`, `email`, `name`, `phone`, `role` (`'customer'` \| `'admin'`), `createdAt`, `updatedAt`
- Optional: `totalOrders`, `totalSpent`, `lastOrderDate` (updated on order creation)

---

## REST API Endpoints (Optional Backend)

When `VITE_API_BASE_URL` is set, the app expects these endpoints. If no backend exists, only **Payments** and **Shipping** need to be implemented (or stubbed) for full checkout/tracking flow.

### Products

| Method | Endpoint        | Description        | Auth |
|--------|-----------------|--------------------|------|
| GET    | `/products`     | List products      | No   |
| GET    | `/products/:id` | Get product by ID  | No   |
| POST   | `/products`     | Create product     | Admin |
| PUT    | `/products/:id` | Update product     | Admin |
| DELETE | `/products/:id`| Delete product     | Admin |

**Note:** The app currently uses **Firestore** for products (see [Firestore – products](#products-1)); these REST routes are defined in constants for an optional future backend.

---

### Orders

| Method | Endpoint       | Description       | Auth   |
|--------|----------------|-------------------|--------|
| GET    | `/orders`      | List user orders  | User   |
| GET    | `/orders/:id`  | Get order by ID   | User   |
| POST   | `/orders`      | Create order      | User   |

**Note:** Orders are implemented via **Firestore** (see [Firestore – orders](#orders-1)).

---

### Coupons

| Method | Endpoint        | Description        | Auth |
|--------|-----------------|--------------------|------|
| GET    | `/coupons`      | List coupons       | No   |
| GET    | `/coupons/validate?code=...&cartTotal=...` | Validate coupon | No |
| POST   | `/coupons`      | Create coupon      | Admin |
| PUT    | `/coupons/:id`  | Update coupon      | Admin |
| DELETE | `/coupons/:id`  | Delete coupon      | Admin |

**Note:** Coupons are implemented via **Firestore** (see [Firestore – coupons](#coupons-1)).

---

### Payments (REST — used by app)

| Method | Endpoint            | Description              | Request body | Response |
|--------|---------------------|--------------------------|--------------|----------|
| POST   | `/payments/create`  | Create Razorpay order    | `{ orderId: string, amount: number (paise), currency?: string }` | Razorpay order object (e.g. `id`, `amount`, `currency`) |
| POST   | `/payments/verify`  | Verify payment signature | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` | `{ success: boolean }` |

- **Auth:** Sent as `Authorization: Bearer <Firebase_ID_Token>` when user is logged in (see `useApi` / `paymentService`).
- **Usage:** `paymentService.createRazorpayOrder(orderId, amount)`, `paymentService.verifyPaymentSignature(razorpayData)`.

---

### Shipping (REST — used by app)

| Method | Endpoint                    | Description              | Response |
|--------|-----------------------------|--------------------------|----------|
| GET    | `/shipping/track/:trackingId` | Get tracking by ID     | `TrackingInfo` or 404 |
| GET    | `/shipping/order/:orderId`   | Get tracking by order ID | `TrackingInfo` or 404 |

**TrackingInfo:**

```ts
{
  trackingId: string;
  orderId: string;
  status: 'Processing' | 'Picked' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  currentLocation?: string;
  estimatedDelivery?: string;
  courierPartner?: string;
  timeline?: Array<{ status: string; location?: string; timestamp: string; description: string }>;
}
```

- **Usage:** `shippingService.getTrackingInfo(trackingId)`, `shippingService.getShippingByOrderId(orderId)`.

---

### Admin (REST — optional)

Defined in constants; can be backed by Firestore or your backend:

| Method | Endpoint              | Description        |
|--------|------------------------|--------------------|
| GET    | `/admin/dashboard`     | Dashboard stats    |
| GET    | `/admin/orders`        | All orders         |
| GET    | `/admin/analytics`     | Analytics data     |
| GET    | `/admin/finance`       | Finance data       |

**Note:** The app currently uses **Firestore** for admin (see [Firestore – Admin](#admin-operations)).

---

## Firestore Collections & Operations

All of these are used from the **client** with the Firebase JS SDK (`firebase/firestore`). Ensure Firestore rules and indexes match these operations.

### Products

- **Collection:** `products`
- **Operations:** `getDocs`, `getDoc`, `addDoc`, `updateDoc`, `deleteDoc`
- **Key functions:** `getProducts`, `getProductById`, `getAllProducts`, `searchProducts`, `getProductsByCategory`, `getProductsBySeason`, `getProductsByPriceRange`, `createProduct`, `updateProduct`, `deleteProduct`

**Document shape:** See [Data Types – Product](#product).

---

### Orders

- **Collection:** `orders`
- **Operations:** `addDoc`, `getDocs`, `getDoc`, `updateDoc`
- **Key functions:** `createOrder`, `getUserOrders`, `getOrderById`, `updateOrderStatus`, `updateOrderTracking`

**Document shape:** See [Data Types – Order](#order).

**Indexes:** Composite index on `userId` + `createdAt` (desc) for `getUserOrders`. Optional index on `status` + `createdAt` for admin order list.

---

### Coupons

- **Collection:** `coupons`
- **Operations:** `getDocs`, `addDoc`, `updateDoc`, `deleteDoc`
- **Key functions:** `getAllCoupons`, `getCouponByCode`, `validateCoupon`, `applyCoupon`, `createCoupon`, `updateCoupon`, `deleteCoupon`, `toggleCouponStatus`

**Document shape:** See [Data Types – Coupon](#coupon).

---

### Users

- **Collection:** `users`
- **Document ID:** Firebase Auth `uid`
- **Operations:** `setDoc`, `getDoc`, `updateDoc`
- **Key functions:** Used by `authService` (signup, login, profile update) and order creation (increment `totalOrders`, `totalSpent`, `lastOrderDate`).

---

### Reviews

- **Collection:** `reviews`
- **Operations:** `addDoc`, `getDocs`, `getDoc`, `updateDoc`
- **Key functions:** `createReview`, `getProductReviews`, `getProductAverageRating`, `markReviewHelpful`, `toggleReviewApproval`, `getAllProductReviews`, `getAllReviews`, `hasUserPurchasedProduct`, `hasUserReviewedProduct`

**Document shape:** See [Data Types – Review](#review).

---

### Mail (Trigger Email extension)

- **Collection:** `mail`
- **Operation:** `addDoc`
- **Usage:** Documents added here are consumed by the Firebase “Trigger Email” extension to send transactional emails (welcome, order confirmation, order status).

---

## Admin Operations (Firestore)

Implemented in `adminService.ts` (no REST calls in current code):

- **getDashboardStats:** Aggregates from `orders` and `users` (totalOrders, totalRevenue, coinsIssued, totalCustomers, recentOrders).
- **getAllOrders:** Query `orders` with optional filters (status, search).
- **getAnalyticsData:** Query `orders` by date range; returns revenueByDate, categorySales, topProducts, paymentMethods.
- **getFinanceData:** From `orders`; returns totalRevenue, paymentMethods, refunds, codPending.

---

## External Services

### Cloudinary (Image upload)

- **URL:** `POST https://api.cloudinary.com/v1_1/{VITE_CLOUDINARY_CLOUD_NAME}/image/upload`
- **Body:** `FormData` with `file`, `upload_preset` (e.g. `VITE_CLOUDINARY_UPLOAD_PRESET`), optional `folder`
- **Response:** `CloudinaryUploadResponse` (e.g. `public_id`, `secure_url`, `url`, dimensions, etc.)
- **Usage:** `cloudinaryService.uploadImageToCloudinary(file, folder)`, `uploadMultipleImages`.

### Razorpay (Payments)

- **Script:** `https://checkout.razorpay.com/v1/checkout.js`
- **Client:** `paymentService.loadRazorpayScript()`, `openRazorpayCheckout(orderData, options)`.
- **Backend:** App expects REST `/payments/create` and `/payments/verify` as above; key ID from `VITE_RAZORPAY_KEY_ID` (or `RAZORPAY_KEY_ID` in constants).

### Firebase Auth

- Used for all auth flows; see [Authentication](#authentication).

---

## Data Types & Interfaces

### Product

```ts
{
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  isHighlighted?: boolean;
  salesCount?: number;
  category: string;
  season: string;
  sizes: string[];
  stock: Record<string, number>;
  images: string[];
  variants?: Array<{ color: string; colorCode: string; images: string[]; price?: number; stock?: Record<string, number> }>;
  fabric?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

### Order

```ts
{
  id: string;
  userId: string;
  items: Array<{ productId: string; name: string; price: number; size: string; quantity: number; image: string; subtotal: number }>;
  subtotal: number;
  discountAmount: number;
  total: number;
  shippingAddress: { street: string; city: string; state: string; zip: string; phone: string };
  couponCode?: string | null;
  status: 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod?: string;
  paymentId?: string | null;
  trackingId?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Coupon

```ts
{
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount: number;
  maxDiscount?: number;
  validFrom: Timestamp;
  validTill: Timestamp;
  usageLimit?: number;
  usedCount?: number;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

### Review

```ts
{
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;       // 1–5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  isApproved?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### CreateOrderData (input for createOrder)

```ts
{
  userId: string;
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  couponCode?: string;
  paymentMethod?: string;
  paymentId?: string;
}
```

### ValidateCouponResponse

```ts
{
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  error?: string;
}
```

---

## Constants Reference

From `src/utils/constants.ts`:

```ts
API_ENDPOINTS = {
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
}
```

---

## Summary

| Area           | Implemented via   | REST used?              |
|----------------|-------------------|--------------------------|
| Auth           | Firebase Auth     | No                       |
| Products       | Firestore         | Optional (constants only)|
| Orders         | Firestore         | Optional (constants only)|
| Coupons        | Firestore         | Optional (constants only)|
| Reviews        | Firestore         | No                       |
| Admin          | Firestore         | Optional (constants only)|
| Payments       | Razorpay + backend| Yes – `/payments/*`      |
| Shipping       | Backend           | Yes – `/shipping/*`      |
| Images         | Cloudinary        | Direct to Cloudinary     |
| Email          | Firestore `mail`  | No (Trigger Email)       |

For a minimal REST backend, implement **Payments** and **Shipping** as above; the rest of the app works with Firestore and external services only.

