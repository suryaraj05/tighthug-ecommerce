/**
 * Firestore Index Helper
 * 
 * This utility helps generate Firebase Console links for creating composite indexes.
 * When Firestore throws an index error, it will include a link to create the required index.
 */

export const getFirebaseProjectId = (): string => {
  // Get project ID from Firebase config
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.warn('VITE_FIREBASE_PROJECT_ID not found in environment variables');
    return 'YOUR_PROJECT_ID';
  }
  return projectId;
};

export const getFirestoreIndexesUrl = (): string => {
  const projectId = getFirebaseProjectId();
  return `https://console.firebase.google.com/project/${projectId}/firestore/indexes`;
};

/**
 * Generate index creation links for common queries
 */
export const getIndexLinks = () => {
  const projectId = getFirebaseProjectId();
  const baseUrl = `https://console.firebase.google.com/project/${projectId}/firestore/indexes?create_composite=`;

  return {
    // Products indexes
    productsCategoryCreatedAt: `${baseUrl}Clxwcm9kdWN0cxoOCghjYXRlZ29yeRABGg4KCWNyZWF0ZWRBdBAB`,
    productsSeasonCreatedAt: `${baseUrl}Clxwcm9kdWN0cxoOCgZzZWFzb24QARoOCgljcmVhdGVkQXQQAQ`,
    productsCategoryPriceAsc: `${baseUrl}Clxwcm9kdWN0cxoOCghjYXRlZ29yeRABGgwKBnByaWNlEAE`,
    productsCategoryPriceDesc: `${baseUrl}Clxwcm9kdWN0cxoOCghjYXRlZ29yeRABGgwKBnByaWNlEAE`,
    
    // Orders indexes
    ordersUserIdCreatedAt: `${baseUrl}ClxvcmRlcnMaDgoGdXNlcklkEAEaDgoJY3JlYXRlZEF0EAE`,
    ordersStatusCreatedAt: `${baseUrl}ClxvcmRlcnMaDgoGc3RhdHVzEAEaDgoJY3JlYXRlZEF0EAE`,
    
    // Reviews indexes
    reviewsProductIdCreatedAt: `${baseUrl}ClxyZXZpZXdzGhAKCnByb2R1Y3RJZBABGg4KCWNyZWF0ZWRBdBAB`,
  };
};

/**
 * Display index creation links in console
 */
export const logIndexLinks = () => {
  const links = getIndexLinks();
  const projectId = getFirebaseProjectId();
  
  console.group('🔥 Firestore Index Creation Links');
  console.log(`Project ID: ${projectId}`);
  console.log('\n📦 Products Collection:');
  console.log('1. Category + CreatedAt:', links.productsCategoryCreatedAt);
  console.log('2. Season + CreatedAt:', links.productsSeasonCreatedAt);
  console.log('3. Category + Price (Asc):', links.productsCategoryPriceAsc);
  console.log('\n📋 Orders Collection:');
  console.log('4. UserId + CreatedAt:', links.ordersUserIdCreatedAt);
  console.log('5. Status + CreatedAt:', links.ordersStatusCreatedAt);
  console.log('\n⭐ Reviews Collection:');
  console.log('6. ProductId + CreatedAt:', links.reviewsProductIdCreatedAt);
  console.log('\n📊 All Indexes:', getFirestoreIndexesUrl());
  console.groupEnd();
};

