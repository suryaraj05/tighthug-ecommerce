import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CategoryFilter from './CategoryFilter';
import SeasonFilter from './SeasonFilter';
import PriceRangeFilter from './PriceRangeFilter';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';

interface SidebarProps {
  categories: string[];
  seasons: string[];
  priceRange: { min: number; max: number };
  onFiltersChange: (filters: {
    categories: string[];
    seasons: string[];
    priceRange: { min: number; max: number };
  }) => void;
}

const Sidebar = ({ categories, seasons, priceRange, onFiltersChange }: SidebarProps) => {
  const [localCategories, setLocalCategories] = useState(categories);
  const [localSeasons, setLocalSeasons] = useState(seasons);
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);

  const handleApply = () => {
    onFiltersChange({
      categories: localCategories,
      seasons: localSeasons,
      priceRange: localPriceRange,
    });
  };

  const handleReset = () => {
    setLocalCategories([]);
    setLocalSeasons([]);
    setLocalPriceRange({ min: 0, max: 10000 });
    onFiltersChange({
      categories: [],
      seasons: [],
      priceRange: { min: 0, max: 10000 },
    });
  };

  const filterContent = (
    <div className="space-y-6 p-4">
      <CategoryFilter selected={localCategories} onChange={setLocalCategories} />
      <SeasonFilter selected={localSeasons} onChange={setLocalSeasons} />
      <PriceRangeFilter
        min={localPriceRange.min}
        max={localPriceRange.max}
        onChange={(min, max) => setLocalPriceRange({ min, max })}
      />
      <div className="flex gap-2 pt-4">
        <Button onClick={handleApply} className="flex-1">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        {filterContent}
      </aside>

      {/* Mobile Drawer */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          {filterContent}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;

