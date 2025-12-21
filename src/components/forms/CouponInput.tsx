import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { triggerCouponConfetti } from '@/utils/confetti';

interface CouponInputProps {
  onApply: (code: string) => Promise<void>;
  onRemove: () => void;
  appliedCoupon?: string | null;
  loading?: boolean;
}

const CouponInput = ({ onApply, onRemove, appliedCoupon, loading = false }: CouponInputProps) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setError(null);
    setIsApplying(true);

    try {
      await onApply(code.trim());
      setCode('');
      // Trigger confetti celebration after successful application
      // Use setTimeout to ensure it triggers after the UI updates
      setTimeout(() => {
        triggerCouponConfetti();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Invalid coupon code');
    } finally {
      setIsApplying(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
          <div>
            <p className="text-sm font-medium text-green-800">Coupon Applied</p>
            <p className="text-xs text-green-600">{appliedCoupon}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8"
            aria-label="Remove coupon"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleApply();
            }
          }}
          disabled={isApplying || loading}
          className={error ? 'border-red-500' : ''}
        />
        <Button
          type="button"
          onClick={handleApply}
          disabled={isApplying || loading || !code.trim()}
        >
          {isApplying ? 'Applying...' : 'Apply'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default CouponInput;

