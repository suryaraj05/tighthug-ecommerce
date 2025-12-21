import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useWishlistStore } from '@/stores/wishlistStore';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { getProductById, Product } from '@/services/productService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Heart, ShoppingBag } from 'lucide-react';

const Wishlist = () => {
  const { items, removeItem } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [items]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const productPromises = items.map((item) => getProductById(item.productId));
      const productResults = await Promise.all(productPromises);
      setProducts(productResults.filter((p): p is Product => p !== null));
    } catch (error) {
      console.error('Failed to load wishlist products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeItem(productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold">My Wishlist</h1>
              <p className="text-muted-foreground mt-2">
                {items.length} {items.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                <Heart className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start adding items you love to your wishlist
              </p>
              <Link to="/shop">
                <Button>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromWishlist(product.id);
                    }}
                  >
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;

