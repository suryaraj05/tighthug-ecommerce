# Firestore Composite Indexes Guide

This guide will help you create the necessary composite indexes for TightHug e-commerce platform.

## Quick Setup

Firebase will automatically generate index creation links when you run queries that need indexes. However, you can also create them manually using the links below.

## Required Indexes

### 1. Products Collection

#### Index 1: Category + CreatedAt (for category pages with sorting)
- **Collection:** `products`
- **Fields:**
  - `category` (Ascending)
  - `createdAt` (Descending)
- **Query Scope:** Collection
- **Auto-create link:** Will be generated when you filter by category and sort by newest

#### Index 2: Season + CreatedAt (for season filters with sorting)
- **Collection:** `products`
- **Fields:**
  - `season` (Ascending)
  - `createdAt` (Descending)
- **Query Scope:** Collection
- **Auto-create link:** Will be generated when you filter by season and sort by newest

#### Index 3: Category + Price (for category pages with price sorting)
- **Collection:** `products`
- **Fields:**
  - `category` (Ascending)
  - `price` (Ascending)
- **Query Scope:** Collection
- **Auto-create link:** Will be generated when you filter by category and sort by price

### 2. Orders Collection

#### Index 4: UserId + CreatedAt (for user order history)
- **Collection:** `orders`
- **Fields:**
  - `userId` (Ascending)
  - `createdAt` (Descending)
- **Query Scope:** Collection
- **Auto-create link:** Will be generated when viewing order history

#### Index 5: Status + CreatedAt (for admin order filtering)
- **Collection:** `orders`
- **Fields:**
  - `status` (Ascending)
  - `createdAt` (Descending)
- **Query Scope:** Collection
- **Auto-create link:** Will be generated in admin panel when filtering orders

#### Index 6: CreatedAt Range Query (for analytics)
- **Collection:** `orders`
- **Fields:**
  - `createdAt` (Ascending)
- **Query Scope:** Collection
- **Note:** This is for range queries (>=) with orderBy

### 3. Reviews Collection

#### Index 7: ProductId + CreatedAt (for product reviews)
- **Collection:** `reviews`
- **Fields:**
  - `productId` (Ascending)
  - `createdAt` (Descending)
- **Query Scope:** Collection
- **Auto-create link:** Will be generated when viewing product reviews

## How to Create Indexes

### Method 1: Auto-Generated Links (Recommended)

1. Run your application and perform actions that trigger the queries
2. Check the browser console for error messages
3. Click on the auto-generated Firebase Console link in the error message
4. Click "Create Index" in the Firebase Console
5. Wait for the index to build (usually 1-5 minutes)

### Method 2: Manual Creation via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Fill in the fields as specified above
6. Click **Create**

### Method 3: Using Firebase CLI

Create a `firestore.indexes.json` file in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "category",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "season",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "category",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "price",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "reviews",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "productId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then run:
```bash
firebase deploy --only firestore:indexes
```

## Direct Links to Create Indexes

Replace `YOUR_PROJECT_ID` with your actual Firebase project ID:

### Products Indexes:
1. **Category + CreatedAt:**
   ```
   https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes?create_composite=Clxwcm9kdWN0cxoOCghjYXRlZ29yeRABGg4KCWNyZWF0ZWRBdBAB
   ```

2. **Season + CreatedAt:**
   ```
   https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes?create_composite=Clxwcm9kdWN0cxoOCgZzZWFzb24QARoOCgljcmVhdGVkQXQQAQ
   ```

### Orders Indexes:
3. **UserId + CreatedAt:**
   ```
   https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes?create_composite=ClxvcmRlcnMaDgoGdXNlcklkEAEaDgoJY3JlYXRlZEF0EAE
   ```

4. **Status + CreatedAt:**
   ```
   https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes?create_composite=ClxvcmRlcnMaDgoGc3RhdHVzEAEaDgoJY3JlYXRlZEF0EAE
   ```

### Reviews Indexes:
5. **ProductId + CreatedAt:**
   ```
   https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes?create_composite=ClxyZXZpZXdzGhAKCnByb2R1Y3RJZBABGg4KCWNyZWF0ZWRBdBAB
   ```

## Testing Indexes

After creating indexes:

1. Wait for the index to finish building (check status in Firebase Console)
2. Refresh your application
3. Test the following features:
   - Browse products by category
   - Filter by season
   - View order history
   - View product reviews
   - Admin order filtering

## Troubleshooting

### Index Still Building
- Indexes can take 1-5 minutes to build
- Check the status in Firebase Console → Firestore → Indexes
- The app will work in offline mode until indexes are ready

### Still Getting Index Errors
- Make sure you've created all required indexes
- Check that field names match exactly (case-sensitive)
- Verify the query scope is correct (Collection vs Collection Group)

### Offline Mode Issues
- The error "Could not reach Cloud Firestore backend" indicates network/connectivity issues
- Check your internet connection
- Verify Firebase project is active
- Check Firebase project billing status (some features require Blaze plan)

## Current Implementation

The current code uses in-memory filtering to avoid index requirements. Once indexes are created, you can optimize the queries to use Firestore's native filtering for better performance with large datasets.

