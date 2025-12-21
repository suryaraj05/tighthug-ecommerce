import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Lock, Key } from 'lucide-react';
import { createOrder } from '@/services/orderService';
import { triggerOrderConfetti } from '@/utils/confetti';
import { updateUserProfile } from '@/services/authService';
import AddressForm, { AddressFormData } from '@/components/forms/AddressForm';
import CartSummary from '@/components/cart/CartSummary';
import CouponInput from '@/components/forms/CouponInput';
import { validateCoupon, calculateCouponDiscount } from '@/services/couponService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCode, setPaymentCode] = useState('');
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  
  // Secret payment code - in production, this would be handled server-side
  const SECRET_PAYMENT_CODE = 'PAY123';

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

  const handlePlaceOrder = () => {
    if (!address) {
      toast.error('Please fill in the shipping address');
      return;
    }

    if (!agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    // Open payment modal
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentCode.trim()) {
      toast.error('Please enter the payment code');
      return;
    }

    if (paymentCode.trim() !== SECRET_PAYMENT_CODE) {
      toast.error('Invalid payment code. Please try again.');
      setPaymentCode('');
      return;
    }

    setVerifyingPayment(true);

    try {
      // Convert cart items to order items
      const orderItems = items.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        size: item.size,
        quantity: item.quantity,
        image: item.image,
        subtotal: item.price * item.quantity,
      }));

      // Create order in Firebase
      const orderId = await createOrder({
        userId: user!.uid,
        items: orderItems,
        total: getTotal(),
        shippingAddress: {
          street: address!.street,
          city: address!.city,
          state: address!.state,
          zip: address!.zip,
          phone: address!.phone,
        },
        couponCode: appliedCoupon || undefined,
        paymentMethod: 'Card',
        paymentId: `PAY_${Date.now()}`,
      });

      // Update user profile with order count (optional)
      try {
        await updateUserProfile({
          phone: address!.phone,
        });
      } catch (error) {
        console.error('Failed to update user profile:', error);
        // Don't fail the order if profile update fails
      }

      // Trigger celebration confetti
      triggerOrderConfetti();

      toast.success('Payment verified! Order placed successfully!', {
        description: `Order ID: ${orderId.slice(0, 8)}`,
      });

      clearCart();
      setShowPaymentModal(false);
      
      // Small delay to let confetti play
      setTimeout(() => {
        navigate(`/order-confirmation?orderId=${orderId}`);
      }, 1500);
    } catch (error: any) {
      toast.error('Failed to place order', {
        description: error.message || 'Please try again',
      });
    } finally {
      setVerifyingPayment(false);
      setPaymentCode('');
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

              {/* Terms */}
              <div className="flex items-start gap-2 pt-4 border-t border-border">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                  I agree to the terms and conditions and authorize the debit of my account.
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
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Payment - {formatPrice(getTotal())}
                  </>
                )}
              </Button>

              {/* Security Note */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secured by Firebase</span>
              </div>
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
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Payment Verification
            </DialogTitle>
            <DialogDescription>
              Enter the secret payment code to complete your order.
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                For testing: Use code <strong>{SECRET_PAYMENT_CODE}</strong>
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentCode">Payment Code</Label>
              <Input
                id="paymentCode"
                type="text"
                placeholder="Enter payment code"
                value={paymentCode}
                onChange={(e) => setPaymentCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePaymentSubmit();
                  }
                }}
                disabled={verifyingPayment}
                autoFocus
              />
            </div>

            <div className="bg-secondary p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Order Summary</p>
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatPrice(getSubtotal())}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total:</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPaymentModal(false);
                setPaymentCode('');
              }}
              disabled={verifyingPayment}
            >
              Cancel
            </Button>
            <Button onClick={handlePaymentSubmit} disabled={verifyingPayment || !paymentCode.trim()}>
              {verifyingPayment ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Verify & Place Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
