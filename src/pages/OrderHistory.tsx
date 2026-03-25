import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/stores/authStore';
import { getUserOrders, Order } from '@/services/orderService';
import { formatPrice, formatDate } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ORDER_STATUS } from '@/utils/constants';
import TrackingWidget from '@/components/shipping/TrackingWidget';
import { getShippingByOrderId } from '@/services/shippingService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ReviewModal from '@/components/modals/ReviewModal';
import { hasUserReviewedProduct } from '@/services/reviewService';
import { MessageSquare, CheckCircle } from 'lucide-react';

const OrderHistory = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<Record<string, any>>({});
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
    productImage?: string;
  } | null>(null);
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadOrders();
      loadReviewedProducts();
    }
  }, [user, statusFilter]);

  const loadReviewedProducts = async () => {
    if (!user) return;
    
    try {
      const reviewed = new Set<string>();
      const userOrders = await getUserOrders(user.uid);
      
      // Check each product in each order
      for (const order of userOrders) {
        for (const item of order.items) {
          const hasReviewed = await hasUserReviewedProduct(user.uid, item.productId);
          if (hasReviewed) {
            reviewed.add(item.productId);
          }
        }
      }
      
      setReviewedProducts(reviewed);
    } catch {
      /* optional */
    }
  };

  const loadOrders = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const userOrders = await getUserOrders(user.uid);
      let filtered = userOrders;

      if (statusFilter !== 'all') {
        filtered = userOrders.filter((order) => order.status === statusFilter);
      }

      setOrders(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleExpandOrder = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setExpandedOrder(orderId);
    const order = orders.find((o) => o.id === orderId);

    // Load tracking if order is shipped
    if (order?.trackingId && !trackingData[orderId]) {
      try {
        const tracking = await getShippingByOrderId(orderId);
        setTrackingData((prev) => ({ ...prev, [orderId]: tracking }));
      } catch {
        /* optional */
      }
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'default';
      case 'Shipped':
      case 'Paid':
        return 'secondary';
      case 'Processing':
        return 'outline';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Orders</h1>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                {Object.values(ORDER_STATUS).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg font-medium text-gray-600">No orders found</p>
              <Link to="/">
                <Button className="mt-4">Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(order.createdAt?.toDate?.() || new Date())}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                        <p className="text-lg font-bold mt-2">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {order.items.slice(0, 4).map((item, index) => (
                        <div key={index} className="aspect-square bg-[#BBDEFB] rounded overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => handleExpandOrder(order.id)}
                      >
                        {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                      </Button>
                    </div>

                    {expandedOrder === order.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                        <div>
                          <h4 className="font-semibold mb-3">Order Items</h4>
                          <div className="space-y-3">
                            {order.items.map((item, index) => {
                              const canReview = 
                                (order.status === 'Delivered' || order.status === 'Shipped') &&
                                !reviewedProducts.has(item.productId);
                              const hasReviewed = reviewedProducts.has(item.productId);

                              return (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-[#E3F2FD] transition-colors"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    {item.image && (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">
                                        {item.name} - {item.size} x {item.quantity}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {formatPrice(item.subtotal)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    {hasReviewed ? (
                                      <div className="flex items-center gap-2 text-green-600 text-sm">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Reviewed</span>
                                      </div>
                                    ) : canReview ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          setReviewModal({
                                            isOpen: true,
                                            productId: item.productId,
                                            productName: item.name,
                                            productImage: item.image,
                                          })
                                        }
                                        className="flex items-center gap-2"
                                      >
                                        <MessageSquare className="h-4 w-4" />
                                        Leave Review
                                      </Button>
                                    ) : (
                                      <p className="text-xs text-gray-500">
                                        {order.status === 'Delivered' || order.status === 'Shipped'
                                          ? 'Review after delivery'
                                          : 'Review after receiving'}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {order.trackingId && trackingData[order.id] && (
                          <TrackingWidget tracking={trackingData[order.id]} />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Shipping Address</h4>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress.street}
                              <br />
                              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                              {order.shippingAddress.zip}
                              <br />
                              Phone: {order.shippingAddress.phone}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Payment Details</h4>
                            <p className="text-sm text-gray-600">
                              Method: {order.paymentMethod || 'N/A'}
                              <br />
                              Subtotal: {formatPrice(order.subtotal)}
                              {order.discountAmount > 0 && (
                                <>
                                  <br />
                                  Discount: -{formatPrice(order.discountAmount)}
                                </>
                              )}
                              <br />
                              Total: {formatPrice(order.total)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={() => setReviewModal(null)}
          productId={reviewModal.productId}
          productName={reviewModal.productName}
          productImage={reviewModal.productImage}
          onReviewSubmitted={() => {
            // Reload reviewed products after submission
            loadReviewedProducts();
          }}
        />
      )}
    </div>
  );
};

export default OrderHistory;

