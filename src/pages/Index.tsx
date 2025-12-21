import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/products/ProductGrid';
import FilterSidebar from '@/components/products/FilterSidebar';
import { mockProducts, Category, Season } from '@/types/product';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState<string>('newest');

  const filteredProducts = useMemo(() => {
    let products = [...mockProducts];

    // Apply filters
    if (selectedCategory) {
      products = products.filter((p) => p.category === selectedCategory);
    }
    if (selectedSeason) {
      products = products.filter((p) => p.season === selectedSeason);
    }
    products = products.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    return products;
  }, [selectedCategory, selectedSeason, priceRange, sortBy]);

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSeason(null);
    setPriceRange([0, 5000]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[70vh] md:h-[85vh] overflow-hidden bg-secondary">
          <img
            src={heroImage}
            alt="TightHug Collection"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="container pb-16 md:pb-24">
              <div className="max-w-2xl space-y-6 animate-slide-up">
                <span className="inline-block text-sm font-medium tracking-widest uppercase text-foreground/70">
                  New Collection
                </span>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[0.9] tracking-tight">
                  Embrace
                  <br />
                  Your Style
                </h1>
                <p className="text-lg text-foreground/70 max-w-md">
                  Premium streetwear designed for comfort and self-expression. 
                  Quality fabrics, timeless designs.
                </p>
                <div className="flex gap-4 pt-2">
                  <Link to="/?category=T-Shirt">
                    <Button size="lg" className="px-8">
                      Shop Now
                    </Button>
                  </Link>
                  <Link to="/?category=Hoodie">
                    <Button size="lg" variant="outline" className="px-8 bg-background/80 backdrop-blur-sm">
                      View Hoodies
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold">Shop All</h2>
                <p className="text-muted-foreground mt-2">
                  {filteredProducts.length} products
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
                    <FilterSidebar
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      selectedSeason={selectedSeason}
                      setSelectedSeason={setSelectedSeason}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                      onClearAll={clearAllFilters}
                    />
                  </SheetContent>
                </Sheet>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 px-3 text-sm border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Layout */}
            <div className="flex gap-12">
              {/* Desktop Sidebar */}
              <div className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <FilterSidebar
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedSeason={selectedSeason}
                    setSelectedSeason={setSelectedSeason}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    onClearAll={clearAllFilters}
                  />
                </div>
              </div>

              {/* Product Grid */}
              <div className="flex-1">
                <ProductGrid products={filteredProducts} />
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
