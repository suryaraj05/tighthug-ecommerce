import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/utils/helpers';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getAllReviews, toggleReviewApproval, Review } from '@/services/reviewService';
import { getProductById, Product } from '@/services/productService';
import { Search, Eye, EyeOff, Star } from 'lucide-react';
import StarRating from '@/components/reviews/StarRating';

const ReviewManager = () => {
  const [reviews, setReviews] = useState<(Review & { product?: Product })[]>([]);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingReview, setUpdatingReview] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [productFilter, approvalFilter]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const allReviewsData = await getAllReviews();
      
      // Fetch product details for each review
      const reviewsWithProducts = await Promise.all(
        allReviewsData.map(async (review) => {
          try {
            const product = await getProductById(review.productId);
            return { ...review, product: product || undefined };
          } catch {
            return { ...review, product: undefined };
          }
        })
      );
      
      setReviews(reviewsWithProducts);
    } catch (error: any) {
      toast.error('Failed to load reviews', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (reviewId: string, currentStatus: boolean) => {
    setUpdatingReview(reviewId);
    try {
      await toggleReviewApproval(reviewId, !currentStatus);
      toast.success(`Review ${!currentStatus ? 'approved' : 'hidden'}`);
      loadReviews();
    } catch (error: any) {
      toast.error('Failed to update review', {
        description: error.message,
      });
    } finally {
      setUpdatingReview(null);
    }
  };

  const getApprovalBadge = (isApproved: boolean | undefined) => {
    if (isApproved === false) {
      return <Badge variant="destructive">Hidden</Badge>;
    }
    return <Badge variant="default">Visible</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Review Manager</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Moderate Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search reviews by user, product, or comment..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reviews</SelectItem>
                        <SelectItem value="approved">Visible Only</SelectItem>
                        <SelectItem value="hidden">Hidden Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Review</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No reviews found. Reviews will appear here once customers submit them.
                          </TableCell>
                        </TableRow>
                      ) : (
                        reviews
                          .filter((review) => {
                            if (approvalFilter === 'approved') {
                              return review.isApproved !== false;
                            }
                            if (approvalFilter === 'hidden') {
                              return review.isApproved === false;
                            }
                            return true;
                          })
                          .filter((review) => {
                            if (!searchQuery) return true;
                            const query = searchQuery.toLowerCase();
                            return (
                              review.userName.toLowerCase().includes(query) ||
                              review.comment.toLowerCase().includes(query) ||
                              review.title.toLowerCase().includes(query) ||
                              review.product?.name.toLowerCase().includes(query)
                            );
                          })
                          .map((review) => (
                            <TableRow key={review.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {review.product?.images[0] && (
                                    <img
                                      src={review.product.images[0]}
                                      alt={review.product.name}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium text-sm">
                                      {review.product?.name || 'Product not found'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {review.product?.category || ''}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{review.userName}</p>
                                  <p className="text-xs text-muted-foreground">{review.userEmail}</p>
                                  {review.verifiedPurchase && (
                                    <Badge variant="secondary" className="text-xs mt-1">
                                      Verified Purchase
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <StarRating rating={review.rating} size="sm" />
                              </TableCell>
                              <TableCell>
                                <div className="max-w-md">
                                  <p className="font-medium text-sm mb-1">{review.title}</p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {review.comment}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(review.createdAt?.toDate?.() || new Date())}
                                </span>
                              </TableCell>
                              <TableCell>{getApprovalBadge(review.isApproved)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleToggleApproval(review.id, review.isApproved !== false)
                                  }
                                  disabled={updatingReview === review.id}
                                >
                                  {updatingReview === review.id ? (
                                    <LoadingSpinner size="sm" />
                                  ) : review.isApproved === false ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default ReviewManager;

