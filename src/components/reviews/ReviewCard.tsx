import { formatDate } from '@/utils/helpers';
import StarRating from './StarRating';
import { Review } from '@/services/reviewService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { markReviewHelpful } from '@/services/reviewService';
import { toast } from 'sonner';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);

  const handleMarkHelpful = async () => {
    if (hasMarkedHelpful) return;

    try {
      await markReviewHelpful(review.id);
      setHelpfulCount((prev) => prev + 1);
      setHasMarkedHelpful(true);
      toast.success('Thank you for your feedback!');
    } catch (error: any) {
      toast.error('Failed to mark review as helpful', {
        description: error.message,
      });
    }
  };

  const reviewDate = review.createdAt?.toDate
    ? review.createdAt.toDate()
    : review.createdAt instanceof Date
    ? review.createdAt
    : new Date();

  return (
    <div className="border-b border-border pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold">{review.userName}</h4>
            {review.verifiedPurchase && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Purchase
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mb-2">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-xs text-muted-foreground">
              {formatDate(reviewDate)}
            </span>
          </div>
          {review.title && (
            <h5 className="font-medium text-sm mb-1">{review.title}</h5>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkHelpful}
          disabled={hasMarkedHelpful}
          className="text-xs h-7"
        >
          <ThumbsUp className="h-3 w-3 mr-1" />
          Helpful ({helpfulCount})
        </Button>
      </div>
    </div>
  );
};

export default ReviewCard;

