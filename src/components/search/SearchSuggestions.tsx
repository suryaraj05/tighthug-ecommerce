import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/services/productService';
import { getSearchSuggestions } from '@/utils/fuzzySearch';
import { formatPrice } from '@/utils/helpers';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchSuggestionsProps {
  query: string;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (product: Product) => void;
}

const SearchSuggestions = ({
  query,
  products,
  isOpen,
  onClose,
  onSelect,
}: SearchSuggestionsProps) => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Array<{ product: Product; score: number }>>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length >= 2 && isOpen) {
      const results = getSearchSuggestions(query, products, 8);
      setSuggestions(results);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  }, [query, products, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleSelect = (product: Product) => {
    if (onSelect) {
      onSelect(product);
    } else {
      navigate(`/product/${product.id}`);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex].product);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  if (!isOpen || query.trim().length < 2 || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      <div className="p-2">
        <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
          Suggestions ({suggestions.length})
        </div>
        <div className="space-y-1">
          {suggestions.map((item, index) => (
            <button
              key={item.product.id}
              type="button"
              onClick={() => handleSelect(item.product)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors',
                'hover:bg-secondary focus:bg-secondary focus:outline-none',
                selectedIndex === index && 'bg-secondary'
              )}
            >
              <div className="w-12 h-12 flex-shrink-0 bg-secondary rounded overflow-hidden">
                {item.product.images[0] ? (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{item.product.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {item.product.category}
                </div>
                <div className="text-sm font-semibold mt-1">
                  {formatPrice(item.product.price)}
                </div>
              </div>
              {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                <div className="flex-shrink-0">
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(item.product.originalPrice)}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
        {query.trim().length >= 2 && (
          <button
            type="button"
            onClick={() => {
              navigate(`/shop?search=${encodeURIComponent(query)}`);
              onClose();
            }}
            className="w-full mt-2 p-3 text-sm font-medium text-primary hover:bg-secondary rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            View all results for "{query}"
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchSuggestions;

