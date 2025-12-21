/**
 * Test Data Seeding Script (Node.js version)
 * 
 * This script populates Firebase with test data for development.
 * 
 * Usage:
 * 1. Make sure your .env file has Firebase credentials
 * 2. Install dependencies: npm install firebase-admin dotenv
 * 3. Run: node scripts/seedTestData.js
 * 
 * Note: This version uses direct image URLs. For Cloudinary uploads,
 * use the browser-based version or upload images manually.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
require('dotenv').config();

// Firebase config from environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test Products Data
const testProducts = [
  {
    name: 'Essential Black Tee',
    description: 'Premium cotton t-shirt with a relaxed fit. Perfect for everyday wear. Made from 100% organic cotton for ultimate comfort.',
    price: 1299,
    category: 'T-Shirts',
    season: 'All Season',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    stock: { XS: 10, S: 15, M: 20, L: 18, XL: 12, XXL: 8 },
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop',
    ],
  },
  {
    name: 'Minimal White Hoodie',
    description: 'Soft fleece hoodie with kangaroo pocket. Clean minimalist design that pairs with everything.',
    price: 2499,
    category: 'Hoodies',
    season: 'Winter',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 8, M: 12, L: 10, XL: 6 },
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=1000&fit=crop',
    ],
  },
  {
    name: 'Urban Bomber Jacket',
    description: 'Lightweight bomber jacket with ribbed cuffs. A street style essential for any wardrobe.',
    price: 3999,
    category: 'Jackets',
    season: 'Winter',
    sizes: ['M', 'L', 'XL'],
    stock: { M: 5, L: 7, XL: 4 },
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6c986?w=800&h=1000&fit=crop',
    ],
  },
  {
    name: 'Classic Oxford Shirt',
    description: 'Timeless oxford shirt in crisp cotton. Perfect for smart-casual looks and office wear.',
    price: 1899,
    category: 'T-Shirts',
    season: 'All Season',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { S: 12, M: 18, L: 15, XL: 10, XXL: 6 },
    images: [
      'https://images.unsplash.com/photo-1594938291221-94f3133a0a82?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=1000&fit=crop',
    ],
  },
  {
    name: 'Relaxed Fit Chinos',
    description: 'Comfortable chino pants with a modern relaxed fit. Versatile enough for any occasion.',
    price: 2199,
    category: 'Pants',
    season: 'All Season',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 10, M: 14, L: 12, XL: 8 },
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1000&fit=crop',
    ],
  },
  {
    name: 'Summer Cotton Shorts',
    description: 'Breathable cotton shorts for warm days. Comfortable elastic waist with drawstring.',
    price: 1499,
    category: 'Shorts',
    season: 'Summer',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 15, M: 20, L: 18, XL: 10 },
    images: [
      'https://images.unsplash.com/photo-1506629905607-1c0c0a0c0a0a?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1506629905607-1c0c0a0c0a0b?w=800&h=1000&fit=crop',
    ],
  },
  {
    name: 'Oversized Graphic Tee',
    description: 'Streetwear-inspired oversized tee with subtle branding. Dropped shoulders for a relaxed silhouette.',
    price: 1599,
    category: 'T-Shirts',
    season: 'Summer',
    sizes: ['M', 'L', 'XL', 'XXL'],
    stock: { M: 12, L: 15, XL: 10, XXL: 8 },
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop',
    ],
  },
  {
    name: 'Zip-Up Track Jacket',
    description: 'Athletic-inspired track jacket with full zip. Perfect for layering or casual outings.',
    price: 2799,
    category: 'Track Jackets',
    season: 'All Season',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 6, M: 10, L: 8, XL: 5 },
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6c986?w=800&h=1000&fit=crop',
    ],
  },
];

// Test Coupons Data
const testCoupons = [
  {
    code: 'WELCOME10',
    description: 'Welcome discount for new customers',
    discountType: 'percentage',
    discountValue: 10,
    minAmount: 1000,
    maxDiscount: 500,
    validFrom: new Date(),
    validTill: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    usageLimit: 100,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'SAVE500',
    description: 'Flat ₹500 off on orders above ₹3000',
    discountType: 'fixed',
    discountValue: 500,
    minAmount: 3000,
    validFrom: new Date(),
    validTill: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    usageLimit: 50,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'SUMMER20',
    description: 'Summer sale - 20% off',
    discountType: 'percentage',
    discountValue: 20,
    minAmount: 2000,
    maxDiscount: 1000,
    validFrom: new Date(),
    validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    usageLimit: null, // Unlimited
    usedCount: 0,
    isActive: true,
  },
];

async function seedProducts() {
  console.log('🌱 Seeding products...');
  
  for (const product of testProducts) {
    try {
      const productData = {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      console.log(`✅ Created product: ${product.name} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Failed to create product ${product.name}:`, error.message);
    }
  }
  
  console.log('✅ Products seeding complete!\n');
}

async function seedCoupons() {
  console.log('🎫 Seeding coupons...');
  
  for (const coupon of testCoupons) {
    try {
      const couponData = {
        ...coupon,
        code: coupon.code.toUpperCase(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'coupons'), couponData);
      console.log(`✅ Created coupon: ${coupon.code} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Failed to create coupon ${coupon.code}:`, error.message);
    }
  }
  
  console.log('✅ Coupons seeding complete!\n');
}

// Main execution
async function main() {
  console.log('🚀 Starting test data seeding...\n');
  
  try {
    await seedProducts();
    await seedCoupons();
    
    console.log('✨ Seeding complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Check your Firebase Firestore for the new products and coupons');
    console.log('2. Test the app by browsing products and placing orders');
    console.log('3. Images are using Unsplash URLs. Upload to Cloudinary via admin panel if needed.');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { seedProducts, seedCoupons, testProducts, testCoupons };

