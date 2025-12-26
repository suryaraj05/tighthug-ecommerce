import { CartItem as CartItemType } from '@/stores/cartStore';
import { formatPrice } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { X, Minus, Plus } from 'lucide-react';
import QuantitySelector from '@/components/products/QuantitySelector';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const subtotal = item.price * item.quantity;

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200">
      {/* Product Image */}
      <div className="w-20 h-20 flex-shrink-0 bg-[#BBDEFB] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm">{item.name}</h3>
            <p className="text-xs text-gray-600 mt-1">Size: {item.size}</p>
            <p className="text-sm font-semibold mt-2">{formatPrice(item.price)}</p>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 flex-shrink-0"
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between mt-4">
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => onUpdateQuantity(item.quantity + 1)}
            onDecrease={() => onUpdateQuantity(item.quantity - 1)}
            max={10}
          />
          <p className="text-sm font-semibold ml-4">
            {formatPrice(subtotal)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;

