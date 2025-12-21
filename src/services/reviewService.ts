import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  getDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getUserOrders } from './orderService';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  isApproved?: boolean; // Admin control: show/hide review (default: true)
  createdAt: any;
  updatedAt: any;
}

export interface CreateReviewData {
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
}

// Check if user has purchased the product
export const hasUserPurchasedProduct = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    const orders = await getUserOrders(userId);
    
    // Check if any order contains this product
    for (const order of orders) {
      if (order.status === 'Delivered' || order.status === 'Shipped') {
        const hasProduct = order.items.some((item) => item.productId === productId);
        if (hasProduct) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking purchase:', error);
    return false;
  }
};

// Check if user has already reviewed this product
export const hasUserReviewedProduct = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      where('userId', '==', userId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking review:', error);
    return false;
  }
};

// Create a review
export const createReview = async (data: CreateReviewData): Promise<string> => {
  try {
    // Verify user has purchased the product
    const hasPurchased = await hasUserPurchasedProduct(data.userId, data.productId);
    if (!hasPurchased) {
      throw new Error('You can only review products you have purchased');
    }

    // Check if user already reviewed
    const hasReviewed = await hasUserReviewedProduct(data.userId, data.productId);
    if (hasReviewed) {
      throw new Error('You have already reviewed this product');
    }

    const reviewData = {
      ...data,
      verifiedPurchase: true,
      helpfulCount: 0,
      isApproved: true, // Auto-approve by default, admin can change later
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'reviews'), reviewData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Get reviews for a product (only approved reviews)
export const getProductReviews = async (
  productId: string,
  limitCount: number = 10
): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      where('isApproved', '==', true), // Only show approved reviews
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];
  } catch (error: any) {
    // Handle index errors - try without isApproved filter as fallback
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      try {
        // Fallback: fetch all and filter in memory
        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', productId),
          orderBy('createdAt', 'desc'),
          limit(limitCount * 2) // Get more to account for filtering
        );
        const snapshot = await getDocs(q);
        const allReviews = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Review[];
        
        // Filter approved reviews in memory
        return allReviews
          .filter((review) => review.isApproved !== false) // Show if approved or undefined (legacy)
          .slice(0, limitCount);
      } catch (fallbackError) {
        console.error('Error fetching reviews (fallback):', fallbackError);
        return [];
      }
    }
    console.error('Error fetching reviews:', error);
    return [];
  }
};

// Get average rating for a product (only from approved reviews)
export const getProductAverageRating = async (productId: string): Promise<{
  average: number;
  total: number;
  distribution: { [key: number]: number };
}> => {
  try {
    const q = query(collection(db, 'reviews'), where('productId', '==', productId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    // Filter only approved reviews
    const allReviews = snapshot.docs.map((doc) => doc.data() as Review);
    const reviews = allReviews.filter((review) => review.isApproved !== false); // Include undefined (legacy)
    
    if (reviews.length === 0) {
      return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    return { average, total, distribution };
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }
};

// Mark review as helpful
export const markReviewHelpful = async (reviewId: string): Promise<void> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (reviewDoc.exists()) {
      const currentCount = reviewDoc.data().helpfulCount || 0;
      await updateDoc(reviewRef, {
        helpfulCount: currentCount + 1,
      });
    }
  } catch (error) {
    console.error('Error marking review helpful:', error);
    throw error;
  }
};

// Admin: Toggle review approval (show/hide)
export const toggleReviewApproval = async (reviewId: string, isApproved: boolean): Promise<void> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      isApproved,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error toggling review approval:', error);
    throw error;
  }
};

// Admin: Get all reviews for a product (including unapproved)
export const getAllProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];
  } catch (error: any) {
    console.error('Error fetching all reviews:', error);
    return [];
  }
};

// Admin: Get all reviews across all products
export const getAllReviews = async (): Promise<Review[]> => {
  try {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(500));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];
  } catch (error: any) {
    // Fallback: fetch without orderBy if index doesn't exist
    try {
      const q = query(collection(db, 'reviews'), limit(500));
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];
      // Sort in memory
      return reviews.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(0);
        const bDate = b.createdAt?.toDate?.() || new Date(0);
        return bDate.getTime() - aDate.getTime();
      });
    } catch (fallbackError) {
      console.error('Error fetching all reviews:', fallbackError);
      return [];
    }
  }
};

