import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Banknote, Info } from 'lucide-react';
import { createOrder } from '@/services/orderService';
import { triggerOrderConfetti } from '@/utils/confetti';
import { updateUserProfile } from '@/services/authService';
import AddressForm, { AddressFormData } from '@/components/forms/AddressForm';
import CartSummary from '@/components/cart/CartSummary';
import CouponInput from '@/components/forms/CouponInput';
import { validateCoupon } from '@/services/couponService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items,
    getSubtotal,
    getTotal,
    discountAmount,
    appliedCoupon,
    removeCoupon,
    clearCart,
  } = useCartStore();

  const [address, setAddress] = useState<AddressFormData | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleAddressSubmit = (data: AddressFormData) => {
    setAddress(data);
  };

  const handleApplyCoupon = async (code: string) => {
    setApplyingCoupon(true);
    try {
      const subtotal = getSubtotal();
      const result = await validateCoupon(code, subtotal);

      if (result.valid && result.coupon && result.discountAmount) {
        const { applyCoupon } = useCartStore.getState();
        applyCoupon(code, result.discountAmount);
        toast.success('Coupon applied successfully!');
      } else {
        throw new Error(result.error || 'Invalid coupon code');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to apply coupon');
      throw error;
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.success('Coupon removed');
  };

  const handlePlaceOrder = async () => {
    if (!address) {
      toast.error('Please fill in the shipping address');
      return;
    }

    if (!agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        size: item.size,
        quantity: item.quantity,
        image: item.image,
        subtotal: item.price * item.quantity,
      }));

      const orderId = await createOrder({
        userId: user!.uid,
        items: orderItems,
        total: getTotal(),
        shippingAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          phone: address.phone,
        },
        couponCode: appliedCoupon || undefined,
        paymentMethod: 'COD',
      });

      try {
        await updateUserProfile({
          phone: address.phone,
        });
      } catch (error) {
        console.error('Failed to update user profile:', error);
      }

      triggerOrderConfetti();

      toast.success('Order placed successfully!', {
        description: `Pay cash on delivery · Order #${orderId.slice(0, 8)}`,
      });

      clearCart();

      setTimeout(() => {
        navigate(`/order-confirmation?orderId=${orderId}`);
      }, 900);
    } catch (error: any) {
      toast.error('Failed to place order', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-8 md:py-12">
          {/* Back Button */}
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </button>

          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="space-y-4">
                <h2 className="text-lg font-display font-semibold">Shipping Address</h2>
                <AddressForm
                  onSubmit={handleAddressSubmit}
                  initialValues={user.phone ? { phone: user.phone } : undefined}
                  loading={isProcessing}
                  onFormChange={(data, isValid) => {
                    if (isValid && data) {
                      setAddress(data);
                    }
                  }}
                />
              </div>

              {/* Coupon */}
              <div className="space-y-4">
                <h2 className="text-lg font-display font-semibold">Coupon Code</h2>
                <CouponInput
                  onApply={handleApplyCoupon}
                  onRemove={handleRemoveCoupon}
                  appliedCoupon={appliedCoupon}
                  loading={applyingCoupon}
                />
              </div>

              {/* Payment — COD only */}
              <div className="space-y-4">
                <h2 className="text-lg font-display font-semibold">Payment</h2>
                <div className="rounded-lg border border-border bg-card p-5 space-y-4">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Banknote className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium">Cash on delivery (COD)</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Pay in cash when your order arrives. No online payment is required to place this
                        order. Please keep the exact amount ready if possible to help our delivery partner.
                      </p>
                    </div>
                  </div>
                  <Alert className="border-primary/20 bg-primary/5">
                    <Info className="h-4 w-4" />
                    <AlertTitle className="text-sm">Online payments coming soon</AlertTitle>
                    <AlertDescription className="text-xs text-muted-foreground">
                      We're only offering COD for now. Card, UPI, and other digital payment options will be
                      available on checkout in a future update. We'll let you know when they go live.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 pt-4 border-t border-border">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms-of-service" className="text-primary underline underline-offset-2 hover:no-underline">
                    terms and conditions
                  </Link>
                  . I understand this order is <strong className="font-medium">cash on delivery</strong>{' '}
                  and no payment will be collected online.
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="button"
                onClick={handlePlaceOrder}
                size="lg"
                className="w-full"
                disabled={isProcessing || !address || !agreeTerms || items.length === 0}
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Placing your order…
                  </>
                ) : (
                  <>
                    <Banknote className="mr-2 h-4 w-4" />
                    Place order — pay on delivery · {formatPrice(getTotal())}
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                You'll get a confirmation with your order details. Pay the rider when you receive the package.
              </p>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6 p-6 bg-secondary rounded-lg">
                <h2 className="text-lg font-display font-semibold">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-3">
                      <div className="w-16 h-20 bg-background flex-shrink-0 overflow-hidden rounded">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Size: {item.size} | Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <CartSummary
                  subtotal={getSubtotal()}
                  discount={discountAmount}
                  total={getTotal()}
                />
                <div className="flex items-start gap-2 rounded-md border border-dashed border-border bg-background/50 px-3 py-2.5 text-xs text-muted-foreground">
                  <Banknote className="h-3.5 w-3.5 shrink-0 mt-0.5 text-foreground/70" aria-hidden />
                  <span>
                    <span className="font-medium text-foreground">COD</span> — Total due on delivery:
                    <span className="text-foreground font-medium"> {formatPrice(getTotal())}</span>
                  </span>
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

export default Checkout;
