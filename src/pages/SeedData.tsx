/**
 * Browser-based Test Data Seeding Page
 * 
 * Access this page at /seed-data (add route in App.tsx)
 * This allows you to seed test data directly from the browser
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createProduct } from '@/services/productService';
import { createCoupon } from '@/services/couponService';
import { uploadImageToCloudinary } from '@/services/cloudinaryService';
import { serverTimestamp } from 'firebase/firestore';
import { Upload, X } from 'lucide-react';

const testProducts = [
  {
    name: 'Essential Black Tee',
    description: 'Premium cotton t-shirt with a relaxed fit. Perfect for everyday wear. Made from 100% organic cotton for ultimate comfort.',
    price: 1299,
    category: 'T-Shirts',
    season: 'All Season',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    stock: { XS: 10, S: 15, M: 20, L: 18, XL: 12, XXL: 8 },
    imageUrls: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
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
    imageUrls: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80',
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
    imageUrls: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6c986?w=800&q=80',
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
    imageUrls: [
      'https://images.unsplash.com/photo-1594938291221-94f3133a0a82?w=800&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
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
    imageUrls: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
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
    imageUrls: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
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
    imageUrls: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
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
    imageUrls: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6c986?w=800&q=80',
    ],
  },
];

const testCoupons = [
  {
    code: 'WELCOME10',
    description: 'Welcome discount for new customers',
    discountType: 'percentage' as const,
    discountValue: 10,
    minAmount: 1000,
    maxDiscount: 500,
    validFrom: new Date(),
    validTill: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    usageLimit: 100,
    isActive: true,
  },
  {
    code: 'SAVE500',
    description: 'Flat ₹500 off on orders above ₹3000',
    discountType: 'fixed' as const,
    discountValue: 500,
    minAmount: 3000,
    validFrom: new Date(),
    validTill: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    usageLimit: 50,
    isActive: true,
  },
  {
    code: 'SUMMER20',
    description: 'Summer sale - 20% off',
    discountType: 'percentage' as const,
    discountValue: 20,
    minAmount: 2000,
    maxDiscount: 1000,
    validFrom: new Date(),
    validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usageLimit: undefined,
    isActive: true,
  },
];

const SeedData = () => {
  const [seedingProducts, setSeedingProducts] = useState(false);
  const [seedingCoupons, setSeedingCoupons] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [productImages, setProductImages] = useState<Record<number, string[]>>({});
  const [uploadingProductIndex, setUploadingProductIndex] = useState<number | null>(null);

  const handleImageUpload = async (productIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingProductIndex(productIndex);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }

        try {
          const result = await uploadImageToCloudinary(file, 'stock');
          uploadedUrls.push(result.secure_url);
          toast.success(`Uploaded: ${file.name}`);
        } catch (error: any) {
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
        }
      }

      // Update product images
      setProductImages((prev) => ({
        ...prev,
        [productIndex]: [...(prev[productIndex] || []), ...uploadedUrls],
      }));
    } finally {
      setUploadingProductIndex(null);
    }
  };

  const removeImage = (productIndex: number, imageIndex: number) => {
    setProductImages((prev) => {
      const images = [...(prev[productIndex] || [])];
      images.splice(imageIndex, 1);
      return { ...prev, [productIndex]: images };
    });
  };

  const seedProducts = async () => {
    setSeedingProducts(true);
    setProgress({ current: 0, total: testProducts.length });

    try {
      for (let i = 0; i < testProducts.length; i++) {
        const product = testProducts[i];
        setProgress({ current: i + 1, total: testProducts.length });

        // Use uploaded images if available, otherwise use default URLs
        const images = productImages[i] && productImages[i].length > 0 
          ? productImages[i] 
          : product.imageUrls;

        if (images.length === 0) {
          toast.warning(`Skipping ${product.name} - no images provided`);
          continue;
        }

        await createProduct({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          season: product.season,
          sizes: product.sizes,
          stock: product.stock,
          images,
        });

        toast.success(`Created: ${product.name}`);
      }

      toast.success(`✅ Successfully seeded ${testProducts.length} products!`);
      // Clear uploaded images after seeding
      setProductImages({});
    } catch (error: any) {
      toast.error('Failed to seed products', {
        description: error.message,
      });
    } finally {
      setSeedingProducts(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const seedCoupons = async () => {
    setSeedingCoupons(true);

    try {
      for (const coupon of testCoupons) {
        await createCoupon(coupon);
        toast.success(`Created coupon: ${coupon.code}`);
      }

      toast.success(`✅ Successfully seeded ${testCoupons.length} coupons!`);
    } catch (error: any) {
      toast.error('Failed to seed coupons', {
        description: error.message,
      });
    } finally {
      setSeedingCoupons(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Test Data Seeding</h1>
            <p className="text-gray-600">
              Populate Firebase with test products and coupons for development
            </p>
          </div>

          {/* Products Seeding */}
          <Card>
            <CardHeader>
              <CardTitle>Products ({testProducts.length} items)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-gray-600">
                Upload images for each product, then click "Seed All Products" to create them in Firebase.
                Products without uploaded images will use default placeholder URLs.
              </p>

              {/* Product List with Image Upload */}
              <div className="space-y-4">
                {testProducts.map((product, index) => {
                  const uploadedImages = productImages[index] || [];
                  const isUploading = uploadingProductIndex === index;

                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.description}</p>
                          <div className="mt-2 flex gap-4 text-xs text-gray-500">
                            <span>₹{product.price}</span>
                            <span>{product.category}</span>
                            <span>{product.season}</span>
                          </div>
                        </div>
                      </div>

                      {/* Image Upload Section */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Images ({uploadedImages.length} uploaded)
                        </label>
                        
                        {/* Uploaded Images Preview */}
                        {uploadedImages.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {uploadedImages.map((url, imgIndex) => (
                              <div key={imgIndex} className="relative group">
                                <img
                                  src={url}
                                  alt={`${product.name} ${imgIndex + 1}`}
                                  className="w-20 h-20 object-cover rounded border"
                                />
                                <button
                                  onClick={() => removeImage(index, imgIndex)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  type="button"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Upload Button */}
                        <div className="relative">
                          <input
                            type="file"
                            id={`product-${index}-images`}
                            accept="image/*"
                            multiple
                            onChange={(e) => handleImageUpload(index, e.target.files)}
                            className="hidden"
                            disabled={isUploading}
                          />
                          <label
                            htmlFor={`product-${index}-images`}
                            className={`inline-flex items-center gap-2 px-4 py-2 border rounded cursor-pointer transition-colors ${
                              isUploading
                                ? 'bg-gray-100 cursor-not-allowed'
                                : 'bg-white hover:bg-gray-50 border-gray-300'
                            }`}
                          >
                            {isUploading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm">Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                <span className="text-sm">
                                  {uploadedImages.length === 0
                                    ? 'Upload Images'
                                    : 'Add More Images'}
                                </span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              {progress.total > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Seeding Progress</span>
                    <span>
                      {progress.current} / {progress.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-black h-2 rounded-full transition-all"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Seed Button */}
              <Button
                onClick={seedProducts}
                disabled={seedingProducts}
                className="w-full"
                size="lg"
              >
                {seedingProducts
                  ? `Seeding... ${progress.current}/${progress.total}`
                  : 'Seed All Products'}
              </Button>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Upload 1-3 images per product for best results</p>
                <p>• Images will be uploaded to Cloudinary automatically</p>
                <p>• Products without images will use default placeholder URLs</p>
              </div>
            </CardContent>
          </Card>

          {/* Coupons Seeding */}
          <Card>
            <CardHeader>
              <CardTitle>Coupons ({testCoupons.length} codes)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                This will create {testCoupons.length} test coupon codes.
              </p>

              <div className="space-y-2">
                {testCoupons.map((coupon) => (
                  <div key={coupon.code} className="p-3 bg-gray-50 rounded text-sm">
                    <div className="font-mono font-bold">{coupon.code}</div>
                    <div className="text-gray-600">{coupon.description}</div>
                  </div>
                ))}
              </div>

              <Button
                onClick={seedCoupons}
                disabled={seedingCoupons}
                className="w-full"
              >
                {seedingCoupons ? 'Seeding Coupons...' : 'Seed Coupons'}
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold mb-2">How to Seed Products:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>For each product, click "Upload Images" to select image files from your computer</li>
                <li>Wait for images to upload to Cloudinary (you'll see previews)</li>
                <li>You can upload multiple images per product (1-3 recommended)</li>
                <li>Remove images by hovering and clicking the X button</li>
                <li>Click "Seed All Products" to create all products in Firebase</li>
                <li>Products without uploaded images will use default placeholder URLs</li>
              </ol>
              
              <p className="font-semibold mt-4 mb-2">How to Seed Coupons:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Click "Seed Coupons" to create test coupon codes</li>
              </ol>

              <p className="font-semibold mt-4 mb-2">After Seeding:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Visit the home page to see your products</li>
                <li>Test the full flow: Browse → Add to Cart → Checkout → Place Order</li>
                <li>Check admin panel to manage products and orders</li>
              </ol>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="font-semibold text-blue-800 mb-1">ℹ️ Cloudinary Upload Setup:</p>
                <p className="text-blue-700 text-xs">
                  Make sure you have configured the upload preset in Cloudinary:
                </p>
                <ol className="list-decimal list-inside text-blue-700 text-xs mt-2 space-y-1">
                  <li>Go to Cloudinary Dashboard → Settings → Upload</li>
                  <li>Create a new upload preset named: <code className="bg-blue-100 px-1 rounded">tighthug_upload</code></li>
                  <li>Set it to <strong>Unsigned</strong> mode</li>
                  <li>Save the preset</li>
                </ol>
                <p className="text-blue-700 text-xs mt-2">
                  Without this, image uploads will fail. Products will still be created but without images.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SeedData;

