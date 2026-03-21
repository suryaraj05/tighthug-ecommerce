# Admin Panel Testing Guide

This guide will help you test the admin panel functionality of TightHug Store.

## 🔐 Setting Up an Admin User

### Method 1: Using Firebase Console (Recommended)

1. **Create a regular user account:**
   - Go to your app and sign up with an email (e.g., `admin@tighthug.in`)
   - Complete the signup process

2. **Make the user an admin in Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project: **Tighthug**
   - Navigate to **Firestore Database**
   - Go to the `users` collection
   - Find the document with your email
   - Edit the document and add/modify the `role` field:
     - Field: `role`
     - Value: `admin`
   - Save the document

3. **Logout and login again:**
   - Logout from your app
   - Login with the same email
   - You should now see "Admin Panel" in the user dropdown menu

### Method 2: Using Seed Data Page

1. **Create a user account first** (if you haven't already)
2. **Note the user's email**
3. **Manually update in Firebase Console** (same as Method 1, step 2)

## 🧪 Testing Admin Features

### 1. Access Admin Dashboard

- **URL:** `http://localhost:8081/admin`
- **What to test:**
  - ✅ Should see KPI cards (Total Orders, Revenue, Coins, Customers)
  - ✅ Should see recent orders table
  - ✅ Should see quick action buttons

### 2. Product Management (`/admin/products`)

**Features to test:**
- ✅ View all products in a table
- ✅ Add new product:
  - Click "Add Product"
  - Fill in: Name, Description, Price, Category, Season
  - Select sizes and add stock for each
  - Upload product images
  - Save product
- ✅ Edit existing product:
  - Click "Edit" on any product
  - Modify details
  - Save changes
- ✅ Delete product:
  - Click "Delete" on any product
  - Confirm deletion
- ✅ Search/Filter products

**Test Data:**
```
Name: Test Product
Description: This is a test product
Price: 1999
Category: T-Shirts
Season: All Season
Sizes: S, M, L
Stock: S: 10, M: 15, L: 12
```

### 3. Order Management (`/admin/orders`)

**Features to test:**
- ✅ View all orders in a table
- ✅ Filter orders by status (Pending, Paid, Processing, Shipped, Delivered, Cancelled)
- ✅ Search orders by order ID or customer name
- ✅ View order details:
  - Click on any order to see full details
  - Check customer info, items, address, payment details
- ✅ Update order status:
  - Use the status dropdown
  - Change status (e.g., Processing → Shipped)
  - Verify status updates in the table

**Test Flow:**
1. Place an order as a regular user
2. Login as admin
3. Go to `/admin/orders`
4. Find your order
5. Update its status
6. Check order history as user to see updated status

### 4. Coupon Management (`/admin/coupons`)

**Features to test:**
- ✅ View all coupons
- ✅ Add new coupon:
  - Click "Add Coupon"
  - Fill in:
    - Code: `TEST20`
    - Description: Test coupon
    - Discount Type: Percentage
    - Discount Value: 20
    - Min Amount: 1000
    - Max Discount: 500
    - Valid From: Today
    - Valid Till: 30 days from now
    - Usage Limit: 100
  - Save coupon
- ✅ Edit coupon
- ✅ Delete coupon
- ✅ Activate/Deactivate coupon toggle
- ✅ View usage statistics

**Test Flow:**
1. Create a coupon as admin
2. Logout and login as regular user
3. Add items to cart
4. Go to checkout
5. Apply the coupon code
6. Verify discount is applied

### 5. Analytics (`/admin/analytics`)

**Features to test:**
- ✅ View revenue trend chart
- ✅ View category-wise sales pie chart
- ✅ View top products bar chart
- ✅ View payment method breakdown
- ✅ Change date range filters
- ✅ Export data (if implemented)

### 6. Finance Control (`/admin/finance`)

**Features to test:**
- ✅ View total revenue
- ✅ View payment method breakdown
- ✅ View refunds section
- ✅ View COD pending amounts
- ✅ Generate financial reports

## 🔍 Common Issues & Solutions

### Issue: "Admin Panel" link not showing

**Solution:**
1. Check if user has `role: "admin"` in Firestore `users` collection
2. Logout and login again
3. Check browser console for errors

### Issue: Can't access admin routes

**Solution:**
1. Verify user is logged in
2. Verify `role` field is set to `"admin"` (not `"Admin"` or `"ADMIN"`)
3. Check `authStore.ts` - `isAdmin` should be `true`

### Issue: Products not showing in admin panel

**Solution:**
1. Check if products exist in Firestore `products` collection
2. Use `/seed-data` page to create test products
3. Check browser console for errors

### Issue: Orders not showing

**Solution:**
1. Place a test order as a regular user
2. Check Firestore `orders` collection
3. Verify order has correct structure

## 📝 Testing Checklist

### Admin Authentication
- [ ] Can login as admin
- [ ] Admin Panel link appears in navbar
- [ ] Can access `/admin` route
- [ ] Non-admin users redirected from admin routes

### Product Management
- [ ] Can view all products
- [ ] Can add new product
- [ ] Can edit product
- [ ] Can delete product
- [ ] Images upload correctly
- [ ] Stock management works

### Order Management
- [ ] Can view all orders
- [ ] Can filter orders by status
- [ ] Can search orders
- [ ] Can view order details
- [ ] Can update order status
- [ ] Status updates reflect in user's order history

### Coupon Management
- [ ] Can view all coupons
- [ ] Can create coupon
- [ ] Can edit coupon
- [ ] Can delete coupon
- [ ] Can activate/deactivate coupon
- [ ] Coupons work in checkout

### Analytics & Finance
- [ ] Charts load correctly
- [ ] Data displays accurately
- [ ] Date filters work
- [ ] Financial summaries are correct

## 🚀 Quick Test Script

1. **Setup:**
   ```bash
   # Start the app
   npm run dev
   ```

2. **Create Admin User:**
   - Sign up: `admin@test.com` / `password123`
   - Go to Firebase Console → Firestore → `users` collection
   - Find your user document
   - Add field: `role` = `"admin"`
   - Logout and login again

3. **Test Product Management:**
   - Go to `/admin/products`
   - Add a test product
   - Edit the product
   - Delete the product

4. **Test Order Management:**
   - As regular user: Add to cart → Checkout → Place order
   - As admin: Go to `/admin/orders` → Update order status

5. **Test Coupons:**
   - As admin: Create coupon `TEST20`
   - As user: Apply coupon in checkout
   - Verify discount applied

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check Firebase Console for data
3. Verify user role in Firestore
4. Ensure you're logged in with the correct account

---

**Secret Payment Code for Testing:** `PAY123`

This code is used in the checkout process to simulate payment. Enter this code when testing the checkout flow.


