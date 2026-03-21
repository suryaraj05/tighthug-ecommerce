import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'sonner';

export interface ProductVariant {
  color: string;
  colorCode: string; // Hex color code
  images: string[];
  price?: number; // Optional: variant-specific pricing
  stock?: Record<string, number>; // Optional: variant-specific stock
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // Original price before discount
  discountPercentage?: number; // Discount percentage (0-100)
  isHighlighted?: boolean; // Admin-controlled highlighting
  salesCount?: number; // Number of sales for popularity-based highlighting
  category: string;
  season: string;
  sizes: string[];
  stock: Record<string, number>;
  images: string[];
  variants?: ProductVariant[]; // Color variants
  fabric?: string; // Fabric variant (e.g., "Cotton", "Polyester", "Blend")
  /** Optional overrides for search snippets (otherwise auto-generated from name/description). */
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ProductFilters {
  category?: string[];
  season?: string[];
  priceMin?: number;
  priceMax?: number;
  search?: string;
}

export interface ProductQueryParams {
  filters?: ProductFilters;
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}

export const getProducts = async (
  params: ProductQueryParams = {}
): Promise<{ products: Product[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean }> => {
  const {
    filters = {},
    sort = 'newest',
    limit: limitCount = 12,
    lastDoc,
  } = params;

  // Helper function to sort products in memory
  const sortProducts = (products: Product[]): Product[] => {
    const sorted = [...products];
    if (sort === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      sorted.sort((a, b) => {
        // Handle different timestamp formats
        let aTime = 0;
        let bTime = 0;
        
        if (a.createdAt) {
          if (typeof a.createdAt.toMillis === 'function') {
            aTime = a.createdAt.toMillis();
          } else if (a.createdAt.seconds) {
            aTime = a.createdAt.seconds * 1000;
          } else if (typeof a.createdAt === 'number') {
            aTime = a.createdAt;
          } else if (a.createdAt instanceof Date) {
            aTime = a.createdAt.getTime();
          }
        }
        
        if (b.createdAt) {
          if (typeof b.createdAt.toMillis === 'function') {
            bTime = b.createdAt.toMillis();
          } else if (b.createdAt.seconds) {
            bTime = b.createdAt.seconds * 1000;
          } else if (typeof b.createdAt === 'number') {
            bTime = b.createdAt;
          } else if (b.createdAt instanceof Date) {
            bTime = b.createdAt.getTime();
          }
        }
        
        return bTime - aTime;
      });
    }
    return sorted;
  };

  // Helper function to filter products in memory
  const filterProducts = async (products: Product[]): Promise<Product[]> => {
    let filtered = [...products];

    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(p => filters.category!.includes(p.category));
    }

    if (filters.season && filters.season.length > 0) {
      filtered = filtered.filter(p => filters.season!.includes(p.season));
    }

    if (filters.priceMin !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.priceMin!);
    }

    if (filters.priceMax !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.priceMax!);
    }

    if (filters.search) {
      // Use fuzzy search utility for better matching (handles typos like "hodie" -> "hoodie")
      const { fuzzyMatch } = await import('@/utils/fuzzySearch');
      const searchQuery = filters.search.trim();
      
      filtered = filtered.filter(p => {
        // Check name, description, and category with fuzzy matching
        return (
          fuzzyMatch(searchQuery, p.name) ||
          fuzzyMatch(searchQuery, p.description) ||
          fuzzyMatch(searchQuery, p.category)
        );
      });
    }

    return filtered;
  };

  try {
    // SIMPLEST APPROACH: Fetch ALL products without any orderBy or complex queries
    // This avoids all index issues
    console.log('Fetching all products from Firestore...');
    const q = query(collection(db, 'products'), limit(100));
    const querySnapshot = await getDocs(q);
    
    const allProducts: Product[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      allProducts.push({
        id: docSnapshot.id,
        ...data,
      } as Product);
    });

    console.log(`✅ Fetched ${allProducts.length} products from Firestore`);

    // Apply filters in memory
    const filtered = await filterProducts(allProducts);
    console.log(`✅ After filtering: ${filtered.length} products`);

    // Sort in memory
    const sorted = sortProducts(filtered);
    console.log(`✅ After sorting: ${sorted.length} products`);

    // Apply limit
    const limited = sorted.slice(0, limitCount);
    const hasMore = sorted.length > limitCount;

    console.log(`✅ Returning ${limited.length} products`);

    return {
      products: limited,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      hasMore,
    };
  } catch (error: any) {
    console.error('❌ Error fetching products:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // If there's an index error, show the link
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      const errorMessage = error.message || '';
      const indexMatch = errorMessage.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
      
      if (indexMatch) {
        const indexUrl = indexMatch[0];
        console.error('🔗 Create index at:', indexUrl);
        console.error('📖 See FIRESTORE_INDEXES_GUIDE.md for all required indexes');
        
        const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
        toast.error('Firestore Index Required', {
          description: 'A composite index is needed. Click the action button to create it.',
          duration: 15000,
          action: {
            label: 'Create Index Now',
            onClick: () => {
              window.open(indexUrl, '_blank');
            },
          },
        });
        
        // Also log to console with all index info
        console.group('🔗 Firestore Index Creation');
        console.log('Click this link to create the required index:');
        console.log(indexUrl);
        if (projectId) {
          console.log('\n📊 View all indexes:', `https://console.firebase.google.com/project/${projectId}/firestore/indexes`);
        }
        console.log('\n📖 See FIRESTORE_INDEXES_GUIDE.md for complete guide');
        console.groupEnd();
      } else {
        // Log all index links if no specific link found
        import('@/utils/firestoreIndexHelper').then(({ logIndexLinks }) => {
          logIndexLinks();
        });
      }
    }
    
    throw new Error(error.message || 'Failed to fetch products');
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Product;
    }

    return null;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch product');
  }
};

/**
 * Get all products (for search suggestions)
 * Cached for better performance
 */
let allProductsCache: Product[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getAllProducts = async (): Promise<Product[]> => {
  // Return cached products if available and fresh
  const now = Date.now();
  if (allProductsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return allProductsCache;
  }

  try {
    const q = query(collection(db, 'products'), limit(500));
    const querySnapshot = await getDocs(q);
    
    const products: Product[] = [];
    querySnapshot.forEach((docSnapshot) => {
      products.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Product);
    });

    // Update cache
    allProductsCache = products;
    cacheTimestamp = now;

    return products;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch products');
  }
};

/**
 * Clear products cache (useful when products are updated)
 */
export const clearProductsCache = () => {
  allProductsCache = null;
  cacheTimestamp = 0;
};

export const searchProducts = async (queryText: string): Promise<Product[]> => {
  try {
    // Use fuzzy search with all products
    const allProducts = await getAllProducts();
    const { getSearchSuggestions } = await import('@/utils/fuzzySearch');
    
    const results = getSearchSuggestions(queryText, allProducts, 100);
    return results.map((item) => item.product);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to search products');
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'products'),
      where('category', '==', category),
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });

    return products;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch products by category');
  }
};

export const getProductsBySeason = async (season: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'products'),
      where('season', '==', season),
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });

    return products;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch products by season');
  }
};

export const getProductsByPriceRange = async (
  min: number,
  max: number
): Promise<Product[]> => {
  try {
    // Fetch all and filter in memory to avoid index issues
    const q = query(collection(db, 'products'), limit(100));
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.price >= min && data.price <= max) {
        products.push({
          id: doc.id,
          ...data,
        } as Product);
      }
    });

    return products;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch products by price range');
  }
};

// Admin functions
export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Remove undefined values (Firestore doesn't accept undefined)
    const cleanData: any = {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    Object.keys(productData).forEach((key) => {
      const value = productData[key as keyof typeof productData];
      // Only include defined values (not undefined)
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });
    
    const docRef = await addDoc(collection(db, 'products'), cleanData);
    // Clear cache when product is created
    clearProductsCache();
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create product');
  }
};

export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<void> => {
  try {
    // Remove undefined values from updates (Firestore doesn't accept undefined)
    const cleanUpdates: any = {
      updatedAt: serverTimestamp(),
    };
    
    Object.keys(updates).forEach((key) => {
      const value = updates[key as keyof Product];
      // Only include defined values (not undefined)
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });
    
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, cleanUpdates);
    // Clear cache when product is updated
    clearProductsCache();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update product');
  }
};

export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    // Clear cache when product is deleted
    clearProductsCache();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete product');
  }
};
