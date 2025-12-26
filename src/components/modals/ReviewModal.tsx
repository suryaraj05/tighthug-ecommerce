import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '@/components/reviews/StarRating';
import { createReview, hasUserReviewedProduct } from '@/services/reviewService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { X } from 'lucide-react';
import { triggerSuccessConfetti } from '@/utils/confetti';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage?: string;
  onReviewSubmitted?: () => void;
}

const ReviewModal = ({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
  onReviewSubmitted,
}: ReviewModalProps) => {
  const { user } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [canReview, setCanReview] = useState(true);

  useEffect(() => {
    if (isOpen && user && productId) {
      checkReviewStatus();
    } else {
      setChecking(false);
    }
  }, [isOpen, user, productId]);

  const checkReviewStatus = async () => {
    if (!user) {
      setCanReview(false);
      setChecking(false);
      return;
    }

    setChecking(true);
    try {
      const reviewed = await hasUserReviewedProduct(user.uid, productId);
      setHasReviewed(reviewed);
      setCanReview(!reviewed);
    } catch (error) {
      console.error('Error checking review status:', error);
      setCanReview(true);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to write a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!title.trim() || !comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await createReview({
        productId,
        userId: user.uid,
        userName: user.name || 'Anonymous',
        userEmail: user.email || '',
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      triggerSuccessConfetti();
      toast.success('Review submitted successfully!');
      
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setHasReviewed(true);
      setCanReview(false);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      toast.error('Failed to submit review', {
        description: error.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRating(0);
      setTitle('');
      setComment('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with {productName}
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : hasReviewed ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Review Already Submitted</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You have already reviewed this product. Thank you for your feedback!
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        ) : !canReview ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#BBDEFB] mb-4">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Cannot Review</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You can only review products you have purchased and received.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Info */}
            {productImage && (
              <div className="flex items-center gap-4 p-4 bg-[#E3F2FD] rounded-lg">
                <img
                  src={productImage}
                  alt={productName}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h4 className="font-semibold">{productName}</h4>
                  <p className="text-sm text-muted-foreground">Rate your purchase</p>
                </div>
              </div>
            )}

            {/* Rating */}
            <div>
              <Label className="text-base font-semibold">Overall Rating *</Label>
              <div className="mt-3">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  size="lg"
                  interactive={true}
                />
                {rating > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {rating === 5 && 'Excellent!'}
                    {rating === 4 && 'Very Good!'}
                    {rating === 3 && 'Good'}
                    {rating === 2 && 'Fair'}
                    {rating === 1 && 'Poor'}
                  </p>
                )}
              </div>
            </div>

            {/* Review Title */}
            <div>
              <Label htmlFor="review-title" className="text-base font-semibold">
                Review Title *
              </Label>
              <Input
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience (e.g., 'Great quality, fits perfectly!')"
                maxLength={100}
                required
                disabled={loading}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {title.length}/100 characters
              </p>
            </div>

            {/* Review Comment */}
            <div>
              <Label htmlFor="review-comment" className="text-base font-semibold">
                Your Review *
              </Label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your detailed thoughts about this product. What did you like? What could be improved?"
                rows={6}
                maxLength={1000}
                required
                disabled={loading}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {comment.length}/1000 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || rating === 0 || !title.trim() || !comment.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;

