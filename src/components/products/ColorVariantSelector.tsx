import { ProductVariant } from '@/services/productService';
import { cn } from '@/lib/utils';

interface ColorVariantSelectorProps {
  variants: ProductVariant[];
  selectedColor: string | null;
  onSelectColor: (color: string) => void;
  productName: string;
}

const ColorVariantSelector = ({
  variants,
  selectedColor,
  onSelectColor,
  productName,
}: ColorVariantSelectorProps) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Color</span>
        <span className="text-xs text-muted-foreground">
          {selectedColor || 'Select color'}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {variants.map((variant) => {
          const isSelected = selectedColor === variant.color;
          return (
            <button
              key={variant.color}
              type="button"
              onClick={() => onSelectColor(variant.color)}
              className={cn(
                'relative w-10 h-10 rounded-full border-2 transition-all',
                isSelected
                  ? 'border-foreground scale-110 ring-2 ring-offset-2 ring-foreground/20'
                  : 'border-border hover:border-foreground/50 hover:scale-105'
              )}
              style={{ backgroundColor: variant.colorCode }}
              aria-label={`${variant.color} ${productName}`}
              title={variant.color}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white border border-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorVariantSelector;

