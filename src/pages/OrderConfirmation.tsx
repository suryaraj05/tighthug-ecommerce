import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Truck, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { getOrderById, Order } from '@/services/orderService';
import { formatPrice, formatDate, getExpectedDeliveryDate, copyToClipboard } from '@/utils/helpers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCartStore } from '@/stores/cartStore';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clearCart = useCartStore((state) => state.clearCart);
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear cart when order is confirmed
    clearCart();

    if (orderId) {
      loadOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const orderData = await getOrderById(orderId);
      if (orderData) {
        setOrder(orderData);
      } else {
        toast.error('Order not found');
        navigate('/');
      }
    } catch (error: any) {
      toast.error('Failed to load order', {
        description: error.message,
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOrderId = async () => {
    if (order?.id) {
      const success = await copyToClipboard(order.id);
      if (success) {
        toast.success('Order ID copied to clipboard');
      }
    }
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

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Order Not Found</h1>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const deliveryDate = getExpectedDeliveryDate(order.createdAt?.toDate?.() || new Date());
  const formattedDeliveryDate = formatDate(deliveryDate);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container max-w-2xl text-center space-y-8">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center h-20 w-20 bg-green-100 rounded-full animate-scale-in">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          {/* Message */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Thank You for Your Order!
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your order has been placed successfully. We've sent a confirmation email to your registered email address.
            </p>
          </div>

          {/* Order ID */}
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-secondary animate-slide-up rounded-lg">
            <div className="text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Order ID</p>
              <p className="text-lg font-display font-bold font-mono">{order.id.slice(0, 12)}</p>
            </div>
            <button
              onClick={handleCopyOrderId}
              className="p-2 hover:bg-background/50 transition-colors rounded"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          {/* Order Details */}
          <div className="text-left space-y-4 p-6 bg-secondary rounded-lg">
            <div>
              <h3 className="font-semibold mb-2">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>
                      {item.name} - {item.size} x {item.quantity}
                    </span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="space-y-6 pt-8">
            <div className="flex items-center justify-center gap-8 md:gap-16">
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium">Order Placed</p>
              </div>
              <div className="h-px w-12 md:w-24 bg-gray-300" />
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-sm text-gray-500">Processing</p>
              </div>
              <div className="h-px w-12 md:w-24 bg-gray-300" />
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-sm text-gray-500">Delivered</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Estimated Delivery: <span className="font-medium text-foreground">{formattedDeliveryDate}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link to="/orders">
              <Button variant="outline" size="lg">
                View My Orders
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Help */}
          <p className="text-sm text-muted-foreground pt-8">
            Need help?{' '}
            <a href="mailto:support@tighthug.com" className="underline hover:text-foreground transition-colors">
              Contact Support
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
