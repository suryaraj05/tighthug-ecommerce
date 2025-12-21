import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SizeSelector from '@/components/products/SizeSelector';
import QuantitySelector from '@/components/products/QuantitySelector';
import ProductGrid from '@/components/products/ProductGrid';
import { mockProducts, formatPrice } from '@/types/product';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Share2, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const product = mockProducts.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

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

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity,
      image: product.images[0],
      category: product.category,
    });

    toast.success(`${product.name} added to cart`, {
      description: `Size: ${selectedSize} | Qty: ${quantity}`,
      action: {
        label: 'View Cart',
        onClick: () => navigate('/cart'),
      },
    });
  };

  const relatedProducts = mockProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
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
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-secondary overflow-hidden">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 bg-secondary overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-foreground' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
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
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  {product.name}
                </h1>
                <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Size Selector */}
              <SizeSelector
                sizes={product.sizes}
                selectedSize={selectedSize}
                onSelect={setSelectedSize}
                stock={product.stock}
              />

              {/* Quantity */}
              <div className="space-y-3">
                <span className="text-sm font-medium">Quantity</span>
                <QuantitySelector
                  quantity={quantity}
                  onIncrease={() => setQuantity((q) => Math.min(q + 1, 10))}
                  onDecrease={() => setQuantity((q) => Math.max(q - 1, 1))}
                  max={selectedSize ? product.stock[selectedSize] : 10}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                >
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
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

              {/* Reward Coins */}
              <div className="p-4 bg-secondary">
                <p className="text-sm">
                  Earn <span className="font-semibold">{product.rewardCoins} coins</span> on this purchase
                </p>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-24">
              <h2 className="text-2xl font-display font-bold mb-8">You May Also Like</h2>
              <ProductGrid products={relatedProducts} />
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
