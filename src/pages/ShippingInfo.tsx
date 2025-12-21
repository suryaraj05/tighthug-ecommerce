import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Clock, Package, MapPin } from 'lucide-react';

const ShippingInfo = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Shipping Information</h1>
            <p className="text-muted-foreground">
              Everything you need to know about shipping and delivery
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Free Shipping</h3>
                  <p className="text-muted-foreground">
                    Free shipping on all orders above ₹999. Standard delivery time is 5-7 business
                    days.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Standard Shipping</h3>
                  <p className="text-muted-foreground">
                    ₹99 for orders below ₹999. Delivery time is 5-7 business days.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Express Shipping</h3>
                  <p className="text-muted-foreground">
                    ₹199 for 2-3 business day delivery. Available for select locations.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Orders are typically processed within 1-2 business days. During sale periods or
                  high demand, processing may take up to 3 business days. You'll receive a
                  confirmation email once your order ships.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We currently ship to all major cities and towns across India. Delivery times may
                  vary based on your location:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Metro cities: 3-5 business days</li>
                  <li>Tier 2 cities: 5-7 business days</li>
                  <li>Other locations: 7-10 business days</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Tracking Your Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Once your order ships, you'll receive a tracking number via email. You can use
                  this number to track your package on our{' '}
                  <a href="/track-order" className="text-primary hover:underline">
                    Track Order
                  </a>{' '}
                  page or on the courier's website.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingInfo;

