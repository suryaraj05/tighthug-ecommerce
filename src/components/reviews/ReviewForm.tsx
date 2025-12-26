import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StarRating from './StarRating';
import { createReview, hasUserPurchasedProduct, hasUserReviewedProduct } from '@/services/reviewService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CheckCircle, XCircle } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
  const { user } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkReviewEligibility();
  }, [productId, user]);

  const checkReviewEligibility = async () => {
    if (!user) {
      setCanReview(false);
      setChecking(false);
      return;
    }

    try {
      const purchased = await hasUserPurchasedProduct(user.uid, productId);
      const reviewed = await hasUserReviewedProduct(user.uid, productId);
      
      setCanReview(purchased && !reviewed);
      setHasReviewed(reviewed);
      setChecking(false);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      setCanReview(false);
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

      toast.success('Review submitted successfully!');
      setRating(0);
      setTitle('');
      setComment('');
      setCanReview(false);
      setHasReviewed(true);
      onReviewSubmitted();
    } catch (error: any) {
      toast.error('Failed to submit review', {
        description: error.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="border border-border rounded-lg p-6 text-center">
        <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Login Required</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please login to write a review
        </p>
      </div>
    );
  }

  if (hasReviewed) {
    return (
      <div className="border border-border rounded-lg p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Review Submitted</h3>
        <p className="text-sm text-muted-foreground">
          You have already reviewed this product. Thank you for your feedback!
        </p>
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="border border-border rounded-lg p-8 text-center bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB]">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-lg mb-2">Share Your Experience</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          We'd love to hear from you! After you receive your order, come back and let others know what you think about this product.
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Reviews help other customers make better decisions
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-lg p-6">
      <div>
        <Label>Rating *</Label>
        <div className="mt-2">
          <StarRating
            rating={rating}
            interactive
            onRatingChange={setRating}
            size="lg"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="review-title">Review Title *</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
          required
          disabled={loading}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="review-comment">Your Review *</Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={5}
          maxLength={1000}
          required
          disabled={loading}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {comment.length}/1000 characters
        </p>
      </div>

      <Button type="submit" disabled={loading || rating === 0} className="w-full">
        {loading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </Button>
    </form>
  );
};

export default ReviewForm;

