import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import QuantitySelector from '@/components/products/QuantitySelector';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { validateCoupon } from '@/services/couponService';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, appliedCoupon, discountAmount, getSubtotal, getTotal, applyCoupon, removeCoupon } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const subtotal = getSubtotal();
      const result = await validateCoupon(code, subtotal);
      if (!result.valid || result.discountAmount == null) {
        toast.error(result.error || 'Invalid coupon code');
        return;
      }
      const appliedCode = code.trim().toUpperCase();
      applyCoupon(appliedCode, result.discountAmount);
      toast.success('Coupon applied successfully!', {
        description: `You saved ${formatPrice(result.discountAmount)}`,
      });
      setCouponCode('');
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Could not apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center space-y-6 max-w-md">
            <div className="inline-flex items-center justify-center h-20 w-20 bg-secondary rounded-full">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground">
              Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
            </p>
            <Link to="/">
              <Button size="lg" className="px-8">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header - Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border text-sm font-medium text-muted-foreground">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Items */}
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="grid grid-cols-12 gap-4 py-6 border-b border-border items-center animate-fade-in"
                >
                  {/* Product */}
                  <div className="col-span-12 md:col-span-6 flex gap-4">
                    <Link to={`/product/${item.id}`} className="w-24 h-32 bg-secondary flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="space-y-1 min-w-0">
                      <Link to={`/product/${item.id}`} className="font-medium hover:text-muted-foreground transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      <p className="text-sm">Size: {item.size}</p>
                      <p className="md:hidden font-medium">{formatPrice(item.price)}</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-6 md:col-span-2 flex justify-start md:justify-center">
                    <QuantitySelector
                      quantity={item.quantity}
                      onIncrease={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      onDecrease={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                    />
                  </div>

                  {/* Price */}
                  <div className="hidden md:block col-span-2 text-right">
                    {formatPrice(item.price)}
                  </div>

                  {/* Total */}
                  <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-4">
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    <button
                      onClick={() => removeItem(item.id, item.size)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Continue Shopping */}
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6 p-6 bg-secondary">
                <h2 className="text-lg font-display font-semibold">Order Summary</h2>

                {/* Coupon */}
                <div className="space-y-3">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-background">
                      <div>
                        <p className="text-sm font-medium">{appliedCoupon}</p>
                        <p className="text-xs text-success">-{formatPrice(discountAmount)}</p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="bg-background"
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Try: SAVE10 or FLAT200</p>
                </div>

                {/* Totals */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(getSubtotal())}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-success">Free</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-3 border-t border-border">
                    <span>Total</span>
                    <span>{formatPrice(getTotal())}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/checkout')}
                >
                  Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {/* Trust Badges */}
                <div className="text-center space-y-2 pt-4">
                  <p className="text-xs text-muted-foreground">Secure checkout powered by</p>
                  <p className="text-sm font-medium">Razorpay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
