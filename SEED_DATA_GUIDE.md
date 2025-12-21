# Test Data Seeding Guide

## Quick Start

### Option 1: Browser-Based Seeding (Easiest)

1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:8080/seed-data`
3. Click "Seed Products" to create 8 test products
4. Click "Seed Coupons" to create 3 test coupon codes
5. Done! Your database is populated.

### Option 2: Node.js Script

```bash
# Install dotenv if needed
npm install dotenv

# Run the script
node scripts/seedTestData.js
```

## What Gets Created

### Products (8 items)
All products include:
- ✅ Name, description, price
- ✅ Category (T-Shirts, Hoodies, Jackets, Pants, Shorts, Track Jackets)
- ✅ Season (All Season, Summer, Winter)
- ✅ Multiple sizes with stock quantities
- ✅ Product images (Unsplash URLs)

**Product List:**
1. Essential Black Tee - ₹1,299
2. Minimal White Hoodie - ₹2,499
3. Urban Bomber Jacket - ₹3,999
4. Classic Oxford Shirt - ₹1,899
5. Relaxed Fit Chinos - ₹2,199
6. Summer Cotton Shorts - ₹1,499
7. Oversized Graphic Tee - ₹1,599
8. Zip-Up Track Jacket - ₹2,799

### Coupons (3 codes)

1. **WELCOME10**
   - 10% off (max ₹500)
   - Min order: ₹1,000
   - Valid for 90 days
   - Usage limit: 100

2. **SAVE500**
   - Flat ₹500 off
   - Min order: ₹3,000
   - Valid for 60 days
   - Usage limit: 50

3. **SUMMER20**
   - 20% off (max ₹1,000)
   - Min order: ₹2,000
   - Valid for 30 days
   - Unlimited usage

## Testing the Complete Flow

### 1. Browse Products
- Visit `/` to see all products
- Use filters (category, season, price)
- Click on any product to see details

### 2. Add to Cart
- Select size and quantity
- Click "Add to Cart"
- View cart at `/cart`

### 3. Apply Coupon
- Go to cart or checkout
- Enter coupon code (e.g., WELCOME10)
- See discount applied

### 4. Place Order
- Go to `/checkout`
- Fill shipping address
- Agree to terms
- Click "Place Order"
- Order is saved to Firebase
- User profile is updated with order count

### 5. View Orders
- User: Visit `/orders` to see your orders
- Admin: Visit `/admin/orders` to see all orders

### 6. Admin Functions
- `/admin/products` - Manage products
- `/admin/coupons` - Manage coupons
- `/admin/analytics` - View analytics
- `/admin/finance` - View financial data

## Image Upload to Cloudinary

### Method 1: Via Browser Seeding Page
1. Go to `/seed-data`
2. Click "Seed Products (Cloudinary)"
3. Images will be uploaded automatically

### Method 2: Via Admin Panel
1. Go to `/admin/products`
2. Click "Add Product"
3. Upload images (they'll go to Cloudinary)
4. Save product

### Method 3: Manual Upload
1. Go to Cloudinary Dashboard
2. Upload images to `stock` folder
3. Copy image URLs
4. Update products in Firebase

## Order Flow Details

When a user places an order:

1. **Order Created** in Firestore `orders` collection
2. **User Profile Updated**:
   - `totalOrders` incremented
   - `totalSpent` updated
   - `lastOrderDate` set
3. **Coupon Usage** updated (if coupon was used)
4. **Cart Cleared** automatically
5. **Order Visible** in:
   - User's order history (`/orders`)
   - Admin order manager (`/admin/orders`)

## Firestore Collections Structure

### `products`
```javascript
{
  name: string,
  description: string,
  price: number,
  category: string,
  season: string,
  sizes: string[],
  stock: { [size: string]: number },
  images: string[],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `orders`
```javascript
{
  userId: string,
  items: OrderItem[],
  subtotal: number,
  discountAmount: number,
  total: number,
  shippingAddress: ShippingAddress,
  couponCode: string | null,
  status: 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled',
  paymentMethod: string,
  paymentId: string | null,
  trackingId: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `coupons`
```javascript
{
  code: string,
  description: string,
  discountType: 'percentage' | 'fixed',
  discountValue: number,
  minAmount: number,
  maxDiscount: number | null,
  validFrom: Date,
  validTill: Date,
  usageLimit: number | null,
  usedCount: number,
  isActive: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `users`
```javascript
{
  uid: string,
  email: string,
  name: string,
  phone: string,
  role: 'admin' | 'customer',
  totalOrders: number, // Updated when order is placed
  totalSpent: number, // Updated when order is placed
  lastOrderDate: Timestamp, // Updated when order is placed
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Troubleshooting

### Products not showing?
- Check Firebase Firestore `products` collection
- Verify products were created successfully
- Check browser console for errors

### Orders not saving?
- Make sure user is logged in
- Check Firebase permissions
- Verify Firestore rules allow writes

### Images not loading?
- Check image URLs are valid
- For Cloudinary: verify upload preset is configured
- Check browser console for CORS errors

## Next Steps

1. ✅ Seed test data
2. ✅ Test product browsing
3. ✅ Test adding to cart
4. ✅ Test checkout flow
5. ✅ Test order placement
6. ✅ Test admin functions
7. ✅ Upload real product images to Cloudinary
8. ✅ Add more products via admin panel

