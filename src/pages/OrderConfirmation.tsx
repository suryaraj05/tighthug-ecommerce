import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Truck, Copy } from 'lucide-react';
import { toast } from 'sonner';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'TH1234567890';

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    toast.success('Order ID copied to clipboard');
  };

  // Calculate estimated delivery (5-7 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 6);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container max-w-2xl text-center space-y-8">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center h-20 w-20 bg-success/10 rounded-full animate-scale-in">
            <CheckCircle className="h-10 w-10 text-success" />
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
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-secondary animate-slide-up">
            <div className="text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Order ID</p>
              <p className="text-lg font-display font-bold">{orderId}</p>
            </div>
            <button
              onClick={handleCopyOrderId}
              className="p-2 hover:bg-background/50 transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          {/* Order Timeline */}
          <div className="space-y-6 pt-8">
            <div className="flex items-center justify-center gap-8 md:gap-16">
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-success flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success-foreground" />
                </div>
                <p className="text-sm font-medium">Order Placed</p>
              </div>
              <div className="h-px w-12 md:w-24 bg-muted-foreground/30" />
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Processing</p>
              </div>
              <div className="h-px w-12 md:w-24 bg-muted-foreground/30" />
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Truck className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Delivered</p>
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
                Track Order
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
