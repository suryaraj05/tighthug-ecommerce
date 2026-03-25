import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SizeSelector from '@/components/products/SizeSelector';
import QuantitySelector from '@/components/products/QuantitySelector';
import ColorVariantSelector from '@/components/products/ColorVariantSelector';
import ProductCard from '@/components/products/ProductCard';
import CompactProductCard from '@/components/products/CompactProductCard';
import ImageGallery from '@/components/products/ImageGallery';
import { formatPrice } from '@/utils/helpers';
import { getProductById, getProductsByCategory, Product } from '@/services/productService';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Heart,
  Share2,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
  Star,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Modal from '@/components/modals/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getProductReviews, getProductAverageRating, Review } from '@/services/reviewService';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewForm from '@/components/reviews/ReviewForm';
import StarRating from '@/components/reviews/StarRating';
import ProductDetailSkeleton from '@/components/products/ProductDetailSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductSeoHead } from '@/components/seo/SeoHead';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const addItem = useCartStore((state) => state.addItem);
  const user = useAuthStore((state) => state.user);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct();
      loadReviews();
    }
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const productData = await getProductById(id);
      if (productData) {
        setProduct(productData);
        setSelectedSize(productData.sizes[0] || null);
        // Set default color variant if available
        if (productData.variants && productData.variants.length > 0) {
          setSelectedColor(productData.variants[0].color);
        }

        // Load related products
        try {
          const related = await getProductsByCategory(productData.category);
          setRelatedProducts(related.filter((p) => p.id !== id).slice(0, 4));
        } catch {
          /* optional */
        }
      }
    } catch (error: any) {
      toast.error('Failed to load product', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!id) return;

    setLoadingReviews(true);
    try {
      const [reviewsData, stats] = await Promise.all([
        getProductReviews(id, 20),
        getProductAverageRating(id),
      ]);
      setReviews(reviewsData);
      setRatingStats(stats);
    } catch {
      /* optional */
    } finally {
      setLoadingReviews(false);
    }
  };

  const buildCartLineItem = () => {
    if (!product || !selectedSize) {
      toast.error('Please select a size');
      return null;
    }

    let stock = product.stock[selectedSize] || 0;
    if (selectedColor && product.variants) {
      const variant = product.variants.find((v) => v.color === selectedColor);
      if (variant?.stock) {
        stock = variant.stock[selectedSize] || stock;
      }
    }

    if (stock < quantity) {
      toast.error(`Only ${stock} items available in size ${selectedSize}`);
      return null;
    }

    let price = product.price;
    if (selectedColor && product.variants) {
      const variant = product.variants.find((v) => v.color === selectedColor);
      if (variant?.price) {
        price = variant.price;
      }
    }

    let images = product.images;
    if (selectedColor && product.variants) {
      const variant = product.variants.find((v) => v.color === selectedColor);
      if (variant?.images && variant.images.length > 0) {
        images = variant.images;
      }
    }

    return {
      id: product.id,
      name: `${product.name}${selectedColor ? ` - ${selectedColor}` : ''}`,
      price,
      size: selectedSize,
      quantity,
      image: images[0] || '',
      category: product.category,
    };
  };

  const handleAddToCart = () => {
    const line = buildCartLineItem();
    if (!line) return;

    addItem(line);

    toast.success(`${product!.name} added to cart`, {
      description: `Size: ${line.size}${selectedColor ? ` | Color: ${selectedColor}` : ''} | Qty: ${line.quantity}`,
      action: {
        label: 'View Cart',
        onClick: () => navigate('/cart'),
      },
    });
  };

  const handleBuyNow = () => {
    const line = buildCartLineItem();
    if (!line) return;

    addItem(line);

    if (!user) {
      toast.info('Sign in to checkout', {
        description: 'Your item is saved in your cart. Log in to continue.',
      });
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    toast.success('Heading to checkout', {
      description: `${product!.name} — ${line.size} × ${line.quantity}`,
    });
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
        category: product.category,
      });
      toast.success('Added to wishlist');
    }
  };

  const handleShare = async () => {
    if (!product) return;

    const url = `${window.location.origin}/product/${product.id}`;
    const text = `Check out ${product.name} on TightHug!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: text,
          url: url,
        });
        toast.success('Shared successfully!');
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="container py-8">
            <div className="mb-8">
              <Skeleton className="h-6 w-32 rounded" />
            </div>
            <ProductDetailSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-display font-bold">Product Not Found</h1>
            <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
            <Link to="/">
              <Button>Back to Shop</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get max quantity based on selected size and color variant
  const getMaxQuantity = () => {
    if (!selectedSize) return 0;
    
    if (selectedColor && product.variants) {
      const variant = product.variants.find((v) => v.color === selectedColor);
      if (variant?.stock) {
        return variant.stock[selectedSize] || 0;
      }
    }
    
    return product.stock[selectedSize] || 0;
  };

  const maxQuantity = getMaxQuantity();

  return (
    <div className="min-h-screen flex flex-col">
      <ProductSeoHead product={product} pathname={location.pathname} />
      <Navbar />

      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </button>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Image Gallery */}
            <div>
              <ImageGallery 
                images={
                  selectedColor && product.variants
                    ? product.variants.find((v) => v.color === selectedColor)?.images || product.images
                    : product.images
                } 
                productName={product.name} 
              />
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-1 bg-secondary">
                    {product.category}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 bg-secondary">
                    {product.season}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-display font-bold">{product.name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <>
                          <span className="text-xl text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                          <span className="text-2xl font-semibold">
                            {formatPrice(product.price)}
                          </span>
                          {product.discountPercentage && (
                            <Badge variant="destructive" className="text-sm">
                              {product.discountPercentage}% OFF
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-2xl font-semibold">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    {(product.isHighlighted || (product.salesCount && product.salesCount > 50)) && (
                      <Badge className="mt-2 bg-yellow-500 hover:bg-yellow-600">
                        🔥 Popular Item
                      </Badge>
                    )}
                  </div>
                  {ratingStats.total > 0 && (
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-2xl font-bold">{ratingStats.average.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ratingStats.total} {ratingStats.total === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed mt-4">{product.description}</p>
              </div>

              {/* Color Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <ColorVariantSelector
                  variants={product.variants}
                  selectedColor={selectedColor}
                  onSelectColor={(color) => {
                    setSelectedColor(color);
                    // Update images when color changes
                    const variant = product.variants?.find((v) => v.color === color);
                    if (variant?.images && variant.images.length > 0) {
                      // Update product images temporarily for display
                      setProduct({
                        ...product,
                        images: variant.images,
                      });
                    }
                  }}
                  productName={product.name}
                />
              )}

              {/* Size Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Size</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-xs"
                  >
                    <Ruler className="h-3 w-3 mr-1" />
                    Size Guide
                  </Button>
                </div>
                <SizeSelector
                  sizes={product.sizes}
                  selectedSize={selectedSize}
                  onSelect={setSelectedSize}
                  stock={
                    selectedColor && product.variants
                      ? product.variants.find((v) => v.color === selectedColor)?.stock || product.stock
                      : product.stock
                  }
                />
              </div>

              {/* Quantity */}
              <div className="space-y-3">
                <span className="text-sm font-medium">Quantity</span>
                <QuantitySelector
                  quantity={quantity}
                  onIncrease={() => setQuantity((q) => Math.min(q + 1, maxQuantity))}
                  onDecrease={() => setQuantity((q) => Math.max(q - 1, 1))}
                  max={maxQuantity}
                />
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={!selectedSize || maxQuantity === 0}
                  >
                    {maxQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="flex-1"
                    onClick={handleBuyNow}
                    disabled={!selectedSize || maxQuantity === 0}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className={`flex-1 sm:flex-none ${isInWishlist(product.id) ? 'bg-red-50 border-red-200' : ''}`}
                    onClick={handleWishlistToggle}
                  >
                    <Heart
                      className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </Button>
                  <Button size="lg" variant="outline" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 pt-8 border-t border-border">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <span>Free shipping on orders above ₹999</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="h-5 w-5 text-muted-foreground" />
                  <span>7-day easy returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  <span>100% authentic products</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <section className="mt-24 border-t border-border pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-display font-bold mb-2">Customer Reviews</h2>
                {ratingStats.total > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <StarRating rating={ratingStats.average} size="md" showValue />
                      <span className="text-sm text-muted-foreground">
                        ({ratingStats.total} {ratingStats.total === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>

            {/* Rating Distribution - Compact Card */}
            {ratingStats.total > 0 && (
              <div className="mb-6 inline-flex items-center gap-4 p-3 bg-secondary rounded-lg border border-border">
                <div className="flex flex-col items-center gap-1 min-w-[60px]">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold">{ratingStats.average.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{ratingStats.total} {ratingStats.total === 1 ? 'review' : 'reviews'}</span>
                </div>
                <div className="flex-1 grid grid-cols-5 gap-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingStats.distribution[star as keyof typeof ratingStats.distribution];
                    return (
                      <div key={star} className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-medium">{star}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Review Form */}
            <div className="mb-8">
              <ReviewForm productId={id!} onReviewSubmitted={loadReviews} />
            </div>

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </section>

          {/* Related Products - Compact */}
          {relatedProducts.length > 0 && (
            <section className="mt-24">
              <h2 className="text-2xl font-display font-bold mb-6">You May Also Like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {relatedProducts.map((product) => (
                  <CompactProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      {/* Size Guide Modal */}
      <Modal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        title="Size Guide"
        size="xl"
      >
        <div className="max-h-[70vh] overflow-y-auto space-y-6">
          <div>
            <h3 className="font-semibold mb-2">How to Measure</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape measure horizontal.</p>
              <p><strong>Waist:</strong> Measure around your natural waistline, typically the narrowest part of your torso.</p>
              <p><strong>Length:</strong> For tops, measure from the top of the shoulder down to the desired length.</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Size Chart</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Chest</TableHead>
                    <TableHead>Length</TableHead>
                    <TableHead>Waist</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { size: 'XS', chest: '34-36"', length: '26"', waist: '28-30"' },
                    { size: 'S', chest: '36-38"', length: '27"', waist: '30-32"' },
                    { size: 'M', chest: '38-40"', length: '28"', waist: '32-34"' },
                    { size: 'L', chest: '40-42"', length: '29"', waist: '34-36"' },
                    { size: 'XL', chest: '42-44"', length: '30"', waist: '36-38"' },
                    { size: 'XXL', chest: '44-46"', length: '31"', waist: '38-40"' },
                  ].map((row) => (
                    <TableRow key={row.size}>
                      <TableCell className="font-semibold">{row.size}</TableCell>
                      <TableCell>{row.chest}</TableCell>
                      <TableCell>{row.length}</TableCell>
                      <TableCell>{row.waist}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetail;
