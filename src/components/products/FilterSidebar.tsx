import { CATEGORIES, SEASONS, Category, Season } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';

interface FilterSidebarProps {
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
  selectedSeason: Season | null;
  setSelectedSeason: (season: Season | null) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  onClearAll: () => void;
}

const FilterSidebar = ({
  selectedCategory,
  setSelectedCategory,
  selectedSeason,
  setSelectedSeason,
  priceRange,
  setPriceRange,
  onClearAll,
}: FilterSidebarProps) => {
  const hasActiveFilters = selectedCategory || selectedSeason || priceRange[0] > 0 || priceRange[1] < 5000;

  return (
    <aside className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs">
            Clear All
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
          Category
        </h3>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Season */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
          Season
        </h3>
        <div className="flex flex-wrap gap-2">
          {SEASONS.map((season) => (
            <button
              key={season}
              onClick={() => setSelectedSeason(selectedSeason === season ? null : season)}
              className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                selectedSeason === season
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:border-foreground'
              }`}
            >
              {season}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
          Price Range
        </h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            min={0}
            max={5000}
            step={100}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
            Active Filters
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted">
                {selectedCategory}
                <button onClick={() => setSelectedCategory(null)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedSeason && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted">
                {selectedSeason}
                <button onClick={() => setSelectedSeason(null)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
