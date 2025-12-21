import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Search, Package } from 'lucide-react';
import { getOrderById } from '@/services/orderService';
import { formatPrice, formatDate } from '@/utils/helpers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const navigate = useNavigate();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    setLoading(true);
    try {
      const orderData = await getOrderById(orderId.trim());
      setOrder(orderData);
      toast.success('Order found!');
    } catch (error: any) {
      toast.error('Order not found', {
        description: error.message || 'Please check your order ID and try again.',
      });
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your order ID to track the status of your shipment
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrack} className="space-y-4">
                <div>
                  <Label htmlFor="orderId">Order ID</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="orderId"
                      placeholder="Enter your order ID"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      disabled={loading}
                    />
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Track
                    </Button>
                  </div>
                </div>
              </form>

              {order && (
                <div className="mt-8 space-y-6">
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">Order Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Order ID:</span>
                        <p className="font-medium">{order.id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <p className="font-medium capitalize">{order.status}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Order Date:</span>
                        <p className="font-medium">
                          {order.createdAt ? formatDate(order.createdAt.toDate?.() || order.createdAt) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <p className="font-medium">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                  </div>

                  {order.trackingNumber && (
                    <div className="border-t pt-6">
                      <h3 className="font-semibold mb-2">Tracking Information</h3>
                      <p className="text-sm text-muted-foreground">
                        Tracking Number: <span className="font-medium">{order.trackingNumber}</span>
                      </p>
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-2 inline-block"
                        >
                          Track on courier website →
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={() => navigate('/orders')}>
                      View All Orders
                    </Button>
                    <Button onClick={() => navigate(`/product/${order.items[0]?.productId}`)}>
                      View Product
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;

