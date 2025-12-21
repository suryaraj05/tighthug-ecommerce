import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/helpers';
import { Product } from '@/services/productService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface CompactProductCardProps {
  product: Product;
}

const CompactProductCard = ({ product }: CompactProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultSize = product.sizes.includes('M') ? 'M' : product.sizes[0];
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: defaultSize,
      quantity: 1,
      image: product.images[0],
      category: product.category,
    });

    toast.success(`${product.name} added to cart`, {
      description: `Size: ${defaultSize}`,
    });
  };

  const isInStock = Object.values(product.stock).some((qty) => qty > 0);

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative overflow-hidden bg-secondary aspect-[3/4]">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Quick Add Button */}
        <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            onClick={handleQuickAdd}
            disabled={!isInStock}
            size="sm"
            className="w-full text-xs"
          >
            {isInStock ? 'Quick Add' : 'Out of Stock'}
          </Button>
        </div>

        {/* Discount Badge */}
        {product.originalPrice && product.originalPrice > product.price && product.discountPercentage && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
              {product.discountPercentage}% OFF
            </Badge>
          </div>
        )}

        {/* Popular Badge */}
        {(product.isHighlighted || (product.salesCount && product.salesCount > 50)) && (
          <div className="absolute top-2 left-2">
            <Badge className="text-xs px-1.5 py-0.5 bg-yellow-500 hover:bg-yellow-600">
              🔥
            </Badge>
          </div>
        )}
      </div>

      <div className="mt-2 space-y-1">
        <h3 className="font-medium text-xs group-hover:text-muted-foreground transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{product.category}</p>
        <div className="flex items-center gap-2">
          {product.originalPrice && product.originalPrice > product.price ? (
            <>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-sm font-semibold">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CompactProductCard;

