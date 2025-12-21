# Test Data Seeding Scripts

## Overview

These scripts help you populate Firebase Firestore with test data for development and testing.

## Files

- `seedTestData.js` - Node.js version (recommended for quick setup)
- `seedTestData.ts` - TypeScript version (for TypeScript projects)

## Prerequisites

1. Firebase project configured
2. `.env` file with Firebase credentials
3. Node.js installed

## Quick Start (Node.js)

```bash
# Install dotenv if not already installed
npm install dotenv

# Run the seeding script
node scripts/seedTestData.js
```

## What Gets Seeded

### Products (8 items)
- Essential Black Tee - ₹1,299
- Minimal White Hoodie - ₹2,499
- Urban Bomber Jacket - ₹3,999
- Classic Oxford Shirt - ₹1,899
- Relaxed Fit Chinos - ₹2,199
- Summer Cotton Shorts - ₹1,499
- Oversized Graphic Tee - ₹1,599
- Zip-Up Track Jacket - ₹2,799

Each product includes:
- Name, description, price
- Category and season
- Available sizes with stock quantities
- Product images (using Unsplash URLs)

### Coupons (3 codes)
- **WELCOME10** - 10% off (max ₹500) on orders above ₹1000
- **SAVE500** - Flat ₹500 off on orders above ₹3000
- **SUMMER20** - 20% off (max ₹1000) on orders above ₹2000

## Image Upload to Cloudinary

The scripts use Unsplash image URLs by default. To upload images to Cloudinary:

1. **Option 1: Use Admin Panel**
   - Go to `/admin/products`
   - Add/Edit products
   - Upload images directly (they'll be uploaded to Cloudinary)

2. **Option 2: Manual Upload**
   - Use Cloudinary Dashboard
   - Upload images to `stock` folder
   - Update product images in Firebase

3. **Option 3: Browser-based Script**
   - Create a simple HTML page that uses the Cloudinary service
   - Upload images and update Firebase

## Testing the Application

After seeding:

1. **Browse Products**
   - Visit `/` to see all products
   - Filter by category, season, price
   - Click on products to see details

2. **Add to Cart**
   - Select size and quantity
   - Add products to cart
   - View cart at `/cart`

3. **Place Order**
   - Go to checkout
   - Fill shipping address
   - Apply coupon codes (WELCOME10, SAVE500, SUMMER20)
   - Place order

4. **View Orders**
   - Check `/orders` for user orders
   - Check `/admin/orders` for all orders

5. **Admin Functions**
   - Manage products at `/admin/products`
   - Manage coupons at `/admin/coupons`
   - View analytics at `/admin/analytics`

## Customizing Test Data

Edit the `testProducts` and `testCoupons` arrays in the script files to add/modify test data.

## Notes

- Images use Unsplash URLs for quick setup
- All products are active and in stock
- Coupons are valid for 30-90 days from seeding date
- Orders will be created in real-time when users checkout

