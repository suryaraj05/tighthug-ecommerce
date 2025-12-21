import { formatPrice } from '@/utils/helpers';
import { cn } from '@/lib/utils';

interface CartSummaryProps {
  subtotal: number;
  discount?: number;
  total: number;
  className?: string;
}

const CartSummary = ({ subtotal, discount = 0, total, className }: CartSummaryProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600">Discount</span>
            <span className="text-green-600">-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;

