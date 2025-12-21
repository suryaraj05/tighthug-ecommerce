import productTshirtBlack from '@/assets/product-tshirt-black.jpg';
import productHoodieWhite from '@/assets/product-hoodie-white.jpg';
import productJacketBlack from '@/assets/product-jacket-black.jpg';
import productShirtWhite from '@/assets/product-shirt-white.jpg';
import productPantsKhaki from '@/assets/product-pants-khaki.jpg';
import productShortsBlack from '@/assets/product-shorts-black.jpg';
import productTshirtGray from '@/assets/product-tshirt-gray.jpg';
import productTrackjacketBlack from '@/assets/product-trackjacket-black.jpg';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'T-Shirt' | 'Hoodie' | 'Jacket' | 'Shirt' | 'Pants' | 'Shorts';
  season: 'Summer' | 'Winter' | 'All-Season';
  sizes: string[];
  stock: Record<string, number>;
  images: string[];
  rewardCoins: number;
  createdAt: Date;
}

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export type Size = typeof SIZES[number];

export const CATEGORIES = ['T-Shirt', 'Hoodie', 'Jacket', 'Shirt', 'Pants', 'Shorts'] as const;
export type Category = typeof CATEGORIES[number];

export const SEASONS = ['Summer', 'Winter', 'All-Season'] as const;
export type Season = typeof SEASONS[number];

// Mock products with real images
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Essential Black Tee',
    description: 'Premium cotton t-shirt with a relaxed fit. Perfect for everyday wear. Made from 100% organic cotton for ultimate comfort.',
    price: 1299,
    category: 'T-Shirt',
    season: 'All-Season',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    stock: { XS: 10, S: 15, M: 20, L: 18, XL: 12, XXL: 8 },
    images: [productTshirtBlack],
    rewardCoins: 13,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Minimal White Hoodie',
    description: 'Soft fleece hoodie with kangaroo pocket. Clean minimalist design that pairs with everything.',
    price: 2499,
    category: 'Hoodie',
    season: 'Winter',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 8, M: 12, L: 10, XL: 6 },
    images: [productHoodieWhite],
    rewardCoins: 25,
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Urban Bomber Jacket',
    description: 'Lightweight bomber jacket with ribbed cuffs. A street style essential for any wardrobe.',
    price: 3999,
    category: 'Jacket',
    season: 'Winter',
    sizes: ['M', 'L', 'XL'],
    stock: { M: 5, L: 7, XL: 4 },
    images: [productJacketBlack],
    rewardCoins: 40,
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Classic Oxford Shirt',
    description: 'Timeless oxford shirt in crisp cotton. Perfect for smart-casual looks and office wear.',
    price: 1899,
    category: 'Shirt',
    season: 'All-Season',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { S: 12, M: 18, L: 15, XL: 10, XXL: 6 },
    images: [productShirtWhite],
    rewardCoins: 19,
    createdAt: new Date(),
  },
  {
    id: '5',
    name: 'Relaxed Fit Chinos',
    description: 'Comfortable chino pants with a modern relaxed fit. Versatile enough for any occasion.',
    price: 2199,
    category: 'Pants',
    season: 'All-Season',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 10, M: 14, L: 12, XL: 8 },
    images: [productPantsKhaki],
    rewardCoins: 22,
    createdAt: new Date(),
  },
  {
    id: '6',
    name: 'Summer Cotton Shorts',
    description: 'Breathable cotton shorts for warm days. Comfortable elastic waist with drawstring.',
    price: 1499,
    category: 'Shorts',
    season: 'Summer',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 15, M: 20, L: 18, XL: 10 },
    images: [productShortsBlack],
    rewardCoins: 15,
    createdAt: new Date(),
  },
  {
    id: '7',
    name: 'Oversized Graphic Tee',
    description: 'Streetwear-inspired oversized tee with subtle branding. Dropped shoulders for a relaxed silhouette.',
    price: 1599,
    category: 'T-Shirt',
    season: 'Summer',
    sizes: ['M', 'L', 'XL', 'XXL'],
    stock: { M: 12, L: 15, XL: 10, XXL: 8 },
    images: [productTshirtGray],
    rewardCoins: 16,
    createdAt: new Date(),
  },
  {
    id: '8',
    name: 'Zip-Up Track Jacket',
    description: 'Athletic-inspired track jacket with full zip. Perfect for layering or casual outings.',
    price: 2799,
    category: 'Jacket',
    season: 'All-Season',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 6, M: 10, L: 8, XL: 5 },
    images: [productTrackjacketBlack],
    rewardCoins: 28,
    createdAt: new Date(),
  },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};
