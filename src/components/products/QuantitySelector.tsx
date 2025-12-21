import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  max?: number;
}

const QuantitySelector = ({ quantity, onIncrease, onDecrease, max = 10 }: QuantitySelectorProps) => {
  return (
    <div className="flex items-center border border-border">
      <Button
        variant="ghost"
        size="icon"
        onClick={onDecrease}
        disabled={quantity <= 1}
        className="h-10 w-10 rounded-none"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-12 text-center font-medium">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onIncrease}
        disabled={quantity >= max}
        className="h-10 w-10 rounded-none"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default QuantitySelector;
