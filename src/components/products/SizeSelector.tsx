import { Size, SIZES } from '@/types/product';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
  stock: Record<string, number>;
}

const SizeSelector = ({ sizes, selectedSize, onSelect, stock }: SizeSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Select Size</span>
        <button className="text-xs text-muted-foreground underline hover:text-foreground transition-colors">
          Size Guide
        </button>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {SIZES.map((size) => {
          const isAvailable = sizes.includes(size);
          const isInStock = stock[size] > 0;
          const isSelected = selectedSize === size;
          const isLowStock = stock[size] > 0 && stock[size] <= 3;

          return (
            <button
              key={size}
              onClick={() => isAvailable && isInStock && onSelect(size)}
              disabled={!isAvailable || !isInStock}
              className={`
                relative py-3 text-sm font-medium border transition-all
                ${isSelected ? 'bg-primary text-primary-foreground border-primary' : ''}
                ${!isSelected && isAvailable && isInStock ? 'border-border hover:border-foreground' : ''}
                ${!isAvailable || !isInStock ? 'border-border text-muted-foreground/40 cursor-not-allowed line-through' : ''}
              `}
            >
              {size}
              {isLowStock && isAvailable && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-warning rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      {selectedSize && stock[selectedSize] <= 3 && stock[selectedSize] > 0 && (
        <p className="text-xs text-warning">Only {stock[selectedSize]} left in stock!</p>
      )}
    </div>
  );
};

export default SizeSelector;
