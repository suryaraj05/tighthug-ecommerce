import { useState, useEffect } from 'react';
import { SeoHead } from '@/components/seo/SeoHead';
import { SHOP_DESCRIPTION, SHOP_TITLE } from '@/config/seo';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/products/ProductGrid';
import Sidebar from '@/components/filters/Sidebar';
import { getProducts, Product } from '@/services/productService';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [categories, setCategories] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const season = searchParams.get('season');
    const search = searchParams.get('search');
    if (category) setCategories([category]);
    if (season) setSeasons([season]);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [categories, seasons, priceRange, sortBy, searchQuery]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: any = {};
      if (categories.length > 0) {
        filters.category = categories;
      }
      if (seasons.length > 0) {
        filters.season = seasons;
      }
      if (priceRange.min > 0) {
        filters.priceMin = priceRange.min;
      }
      if (priceRange.max < 10000) {
        filters.priceMax = priceRange.max;
      }
      if (searchQuery && searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const result = await getProducts({
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sort: sortBy,
        limit: 100,
      });

      setProducts(result.products);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
      toast.error('Failed to load products', {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters: {
    categories: string[];
    seasons: string[];
    priceRange: { min: number; max: number };
  }) => {
    setCategories(filters.categories);
    setSeasons(filters.seasons);
    setPriceRange(filters.priceRange);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead title={SHOP_TITLE} description={SHOP_DESCRIPTION} canonicalPath="/shop" />
      <Navbar />

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold">Shop All</h2>
                <p className="text-muted-foreground mt-2">
                  {loading ? 'Loading...' : `${products.length} products`}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Sheet>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] p-6">
                    <Sidebar
                      categories={categories}
                      seasons={seasons}
                      priceRange={priceRange}
                      onFiltersChange={handleFiltersChange}
                    />
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-12">
              <div className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <Sidebar
                    categories={categories}
                    seasons={seasons}
                    priceRange={priceRange}
                    onFiltersChange={handleFiltersChange}
                  />
                </div>
              </div>

              <div className="flex-1">
                {loading ? (
                  <ProductGrid products={[]} loading={true} />
                ) : error ? (
                  <div className="text-center py-16">
                    <p className="text-red-500">{error}</p>
                    <Button onClick={loadProducts} className="mt-4">
                      Retry
                    </Button>
                  </div>
                ) : (
                  <ProductGrid products={products} loading={false} />
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;

