/**
 * Seeding Script for 100+ Streetwear Products
 * 
 * Usage:
 * 1. Install dotenv if not installed: npm install dotenv
 * 2. Run: node scripts/seed100Products.js
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

// Curated Unsplash images categorized for realism
const imagesByCategory = {
  'T-Shirts': [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1622445262465-2481c8575326?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=1000&fit=crop'
  ],
  'Hoodies': [
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop'
  ],
  'Jackets': [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6c986?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1508445822-222222222222?w=800&h=1000&fit=crop'
  ],
  'Pants': [
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=1000&fit=crop'
  ],
  'Shorts': [
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1506629905607-1c0c0a0c0a0a?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1506629905607-1c0c0a0c0a0b?w=800&h=1000&fit=crop'
  ],
  'Track Jackets': [
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&h=1000&fit=crop'
  ]
};

// Fallback images in case category not found
const fallbackImages = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop'
];

// Streetwear name generators
const prefixes = ['Oversized', 'Heavyweight', 'Retro', 'Vintage', 'Urban', 'Minimal', 'Classic', 'Essential', 'Cyberpunk', 'Acid Wash', 'Street', 'Distressed', 'Graphic', 'Cozy', 'Cargo', 'Techwear', 'Washed', 'Raw', 'Distorted', 'Cyber', 'Neo', 'Mod'];
const colors = ['Midnight Black', 'Off-White', 'Slate Gray', 'Olive Green', 'Sand Beige', 'Burgundy', 'Navy Blue', 'Mustard Yellow', 'Forest Green', 'Charcoal', 'Cream', 'Dusty Rose', 'Rust Orange', 'Sage Green', 'Cobalt Blue'];
const types = {
  'T-Shirts': ['Graphic Tee', 'Boxy Fit Tee', 'Pocket Tee', 'Heavyweight Tee', 'Logo Tee', 'Streetwear Tee'],
  'Hoodies': ['Pull-Over Hoodie', 'Zip-Up Hoodie', 'Fleece Hoodie', 'Oversized Hoodie', 'Boxy Hoodie'],
  'Jackets': ['Bomber Jacket', 'Windbreaker', 'Denim Jacket', 'Puffer Jacket', 'Coach Jacket', 'Utility Jacket'],
  'Pants': ['Cargo Pants', 'Relaxed Chinos', 'Jogger Pants', 'Tech Joggers', 'Wide Leg Pants'],
  'Shorts': ['Mesh Shorts', 'Fleece Shorts', 'Cargo Shorts', 'Nylon Shorts', 'Sweat Shorts'],
  'Track Jackets': ['Track Jacket', 'Retro Windbreaker', 'Athletic Zip-Up']
};

const categories = Object.keys(types);
const seasons = ['Summer', 'Winter', 'All Season', 'Autumn', 'Spring'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Helper to get random item from array
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate products
function generateProductList(count = 105) {
  const products = [];
  const generatedNames = new Set();

  for (let i = 0; i < count; i++) {
    const category = getRandom(categories);
    const season = getRandom(seasons);
    
    // Generate unique name
    let name;
    let attempts = 0;
    do {
      const prefix = getRandom(prefixes);
      const color = getRandom(colors);
      const type = getRandom(types[category]);
      name = `${prefix} ${color} ${type}`;
      attempts++;
    } while (generatedNames.has(name) && attempts < 100);

    generatedNames.add(name);

    // Determine price based on category
    let minPrice = 999;
    let maxPrice = 1999;
    if (category === 'Hoodies') { minPrice = 1999; maxPrice = 3499; }
    if (category === 'Jackets') { minPrice = 2999; maxPrice = 5999; }
    if (category === 'Pants') { minPrice = 1799; maxPrice = 2999; }
    if (category === 'Shorts') { minPrice = 1199; maxPrice = 1999; }
    
    const price = Math.floor((Math.random() * (maxPrice - minPrice) + minPrice) / 100) * 100 + 99; // e.g. 1299, 1499

    // Random original price for discount
    const hasDiscount = Math.random() > 0.6;
    const discountPercentage = hasDiscount ? getRandom([10, 15, 20, 25, 30, 50]) : null;
    const originalPrice = hasDiscount ? Math.floor((price / (1 - discountPercentage / 100)) / 100) * 100 + 99 : null;

    // Stock for each size
    const stock = {};
    sizes.forEach(size => {
      stock[size] = Math.random() > 0.15 ? Math.floor(Math.random() * 25) + 5 : 0; // 5 to 30 stock, or 0 sometimes
    });

    // Random image selection for category
    const catImages = imagesByCategory[category] || fallbackImages;
    // Shuffle images and pick 2
    const shuffled = [...catImages].sort(() => 0.5 - Math.random());
    const images = [shuffled[0], shuffled[1]];

    products.push({
      name,
      description: `Premium quality ${category.toLowerCase().slice(0, -1)} crafted for the ultimate comfort and street aesthetic. Made from premium materials featuring reinforced stitching, a comfortable modern fit, and custom graphic details. Fabric: 100% Cotton / Heavyweight Fleece blend.`,
      price,
      ...(hasDiscount && { originalPrice, discountPercentage }),
      category,
      season,
      sizes: sizes.filter(size => stock[size] > 0 || Math.random() > 0.5), // Include sizes that have stock or randomly
      stock,
      images,
      isHighlighted: Math.random() > 0.85, // 15% items highlighted
      salesCount: Math.floor(Math.random() * 150)
    });
  }

  return products;
}

async function main() {
  console.log('🚀 Generating 105 product objects...');
  const products = generateProductList(105);
  console.log(`✅ Generated ${products.length} unique products.`);
  
  console.log('\n🌱 Initializing seeding in batches...');
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    try {
      const productData = {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      successCount++;
      console.log(`[${successCount}/105] ✅ Seeded product: "${product.name}" (ID: ${docRef.id})`);
    } catch (error) {
      failCount++;
      console.error(`❌ Failed to seed product "${product.name}":`, error.message);
    }
  }

  console.log(`\n✨ Seeding Complete!`);
  console.log(`📊 Stats: ${successCount} succeeded, ${failCount} failed.`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('❌ Global failure:', err);
  process.exit(1);
});
