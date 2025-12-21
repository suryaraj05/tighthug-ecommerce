import { Link } from 'react-router-dom';
import { Product, formatPrice } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Add with default size M if available, otherwise first available size
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
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            onClick={handleQuickAdd}
            disabled={!isInStock}
            className="w-full"
          >
            {isInStock ? 'Quick Add' : 'Out of Stock'}
          </Button>
        </div>

        {/* Season Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-background/90 text-foreground">
            {product.season}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm group-hover:text-muted-foreground transition-colors line-clamp-1">
            {product.name}
          </h3>
          <span className="text-sm font-semibold whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{product.category}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
