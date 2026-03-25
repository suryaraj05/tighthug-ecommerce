import { useState, useEffect } from 'react';
import { SeoHead } from '@/components/seo/SeoHead';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/products/ProductGrid';
import Sidebar from '@/components/filters/Sidebar';
import { getProducts, getDistinctProductCategories, Product } from '@/services/productService';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import heroImage from '@/assets/tighthug-hero-image.png';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Index = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [categories, setCategories] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');
  const [catalogCategories, setCatalogCategories] = useState<string[]>([]);

  useEffect(() => {
    getDistinctProductCategories()
      .then(setCatalogCategories)
      .catch(() => setCatalogCategories([]));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [categories, seasons, priceRange, sortBy]);

  // Handle URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const season = searchParams.get('season');
    if (category) setCategories([category]);
    if (season) setSeasons([season]);
  }, [searchParams]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build filters object - only include non-empty filters
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

      const result = await getProducts({
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sort: sortBy,
        limit: 50,
      });

      console.log('Products loaded:', result.products.length);
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
      <SeoHead canonicalPath="/" />
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[min(42vh,380px)] sm:h-[min(52vh,520px)] md:h-[70vh] lg:h-[85vh] overflow-hidden bg-secondary">
          <img
            src={heroImage}
            alt="TightHug Collection"
            className="absolute inset-0 w-full h-full object-cover object-[center_20%] md:object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent md:from-background/80 md:via-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="container pb-6 pt-8 md:pb-24 md:pt-0">
              <div className="max-w-2xl space-y-3 md:space-y-6 animate-slide-up">
                <span className="inline-block text-xs md:text-sm font-medium tracking-widest uppercase text-foreground/70">
                  New Collection
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[0.95] md:leading-[0.9] tracking-tight">
                  Embrace
                  <br />
                  Your Style
                </h1>
                <p className="text-sm md:text-lg text-foreground/80 md:text-foreground/70 max-w-md line-clamp-2 md:line-clamp-none">
                  Premium streetwear designed for comfort and self-expression. Quality fabrics,
                  timeless designs.
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-4 pt-1 md:pt-2">
                  <Link to="/shop">
                    <Button size="sm" className="h-9 px-5 md:h-11 md:px-8">
                      Shop Now
                    </Button>
                  </Link>
                  <Link to="/new-arrivals">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 px-5 md:h-11 md:px-8 bg-background/80 backdrop-blur-sm"
                    >
                      New Arrivals
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-8 md:py-24">
          <div className="container">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold">Shop All</h2>
                <p className="text-muted-foreground mt-2">
                  {loading ? 'Loading...' : `${products.length} products`}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
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
                      catalogCategories={catalogCategories}
                      onFiltersChange={handleFiltersChange}
                    />
                  </SheetContent>
                </Sheet>

                {/* Sort Dropdown */}
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

            {/* Products Layout */}
            <div className="flex gap-12">
              {/* Desktop Sidebar */}
              <div className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <Sidebar
                    categories={categories}
                    seasons={seasons}
                    priceRange={priceRange}
                    catalogCategories={catalogCategories}
                    onFiltersChange={handleFiltersChange}
                  />
                </div>
              </div>

              {/* Product Grid */}
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

        {/* Features Section */}
        <section className="py-16 bg-secondary">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center h-12 w-12 bg-primary text-primary-foreground font-display font-bold text-lg">
                  ₹
                </div>
                <h3 className="font-display font-semibold">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">On orders above ₹999</p>
              </div>
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center h-12 w-12 bg-primary text-primary-foreground font-display font-bold text-lg">
                  ↩
                </div>
                <h3 className="font-display font-semibold">Easy Returns</h3>
                <p className="text-sm text-muted-foreground">7-day hassle-free returns</p>
              </div>
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center h-12 w-12 bg-primary text-primary-foreground font-display font-bold text-lg">
                  ✓
                </div>
                <h3 className="font-display font-semibold">Premium Quality</h3>
                <p className="text-sm text-muted-foreground">100% authentic products</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
