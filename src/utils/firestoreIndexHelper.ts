/**
 * Firestore Index Helper
 *
 * Generates Firebase Console links for composite indexes.
 */

export const getFirebaseProjectId = (): string => {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) {
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
    productsCategoryCreatedAt: `${baseUrl}Clxwcm9kdWN0cxoOCghjYXRlZ29yeRABGg4KCWNyZWF0ZWRBdBAB`,
    productsSeasonCreatedAt: `${baseUrl}Clxwcm9kdWN0cxoOCgZzZWFzb24QARoOCgljcmVhdGVkQXQQAQ`,
    productsCategoryPriceAsc: `${baseUrl}Clxwcm9kdWN0cxoOCghjYXRlZ29yeRABGgwKBnByaWNlEAE`,
    productsCategoryPriceDesc: `${baseUrl}Clxwcm9kdWN0cxoOCghjYXRlZ29yeRABGgwKBnByaWNlEAE`,
    ordersUserIdCreatedAt: `${baseUrl}ClxvcmRlcnMaDgoGdXNlcklkEAEaDgoJY3JlYXRlZEF0EAE`,
    ordersStatusCreatedAt: `${baseUrl}ClxvcmRlcnMaDgoGc3RhdHVzEAEaDgoJY3JlYXRlZEF0EAE`,
    reviewsProductIdCreatedAt: `${baseUrl}ClxyZXZpZXdzGhAKCnByb2R1Y3RJZBABGg4KCWNyZWF0ZWRBdBAB`,
  };
};

/** @deprecated Use UI helpers (e.g. /index-helper) or toasts; does not print to console. */
export const logIndexLinks = (): void => {};
