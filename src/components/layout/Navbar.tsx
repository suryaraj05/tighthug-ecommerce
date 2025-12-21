import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User, LogOut, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchSuggestions from '@/components/search/SearchSuggestions';
import { getAllProducts, Product } from '@/services/productService';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchProducts, setSearchProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemCount = useCartStore((state) => state.getItemCount());
  const { user, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  // Load products for search suggestions (only once, cached)
  useEffect(() => {
    if (isSearchOpen && searchProducts.length === 0 && !loadingProducts) {
      loadProductsForSearch();
    }
  }, [isSearchOpen]);

  const loadProductsForSearch = async () => {
    if (searchProducts.length > 0) return; // Already loaded (cached by getAllProducts)
    
    setLoadingProducts(true);
    try {
      const result = await getAllProducts();
      setSearchProducts(result);
    } catch (error) {
      console.error('Failed to load products for search:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Shop All', href: '/shop' },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'T-Shirts', href: '/category/t-shirts' },
    { name: 'Hoodies', href: '/category/hoodies' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border">
                <Link to="/" className="font-display text-xl font-bold tracking-tighter">
                  TIGHTHUG
                </Link>
              </div>
              <nav className="flex-1 p-6">
                <ul className="space-y-4">
                  {navLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-lg font-medium hover:text-muted-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-6 border-t border-border space-y-3">
                {user ? (
                  <>
                    <Link to="/orders">
                      <Button variant="outline" className="w-full">
                        My Orders
                      </Button>
                    </Link>
                    <Link to="/wishlist">
                      <Button variant="outline" className="w-full">
                        <Heart className="h-4 w-4 mr-2" />
                        Wishlist
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin">
                        <Button variant="outline" className="w-full">
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="w-full">
                        Create Account
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="font-display text-xl md:text-2xl font-bold tracking-tighter">
          TIGHTHUG
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-medium hover:text-muted-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-1 md:space-x-2">
          {/* Search */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 animate-fade-in z-50">
                <form onSubmit={handleSearch} className="relative flex items-center">
                  <div className="relative w-48 md:w-64">
                    <Input
                      ref={searchInputRef}
                      type="search"
                      placeholder="Search products... (e.g., hoodie, t-shirt)"
                      className="w-full pr-16"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="absolute right-8 h-8 w-8"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 h-8 w-8"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
                {!loadingProducts && (
                  <SearchSuggestions
                    query={searchQuery}
                    products={searchProducts}
                    isOpen={isSearchOpen && searchQuery.trim().length >= 2}
                    onClose={() => setIsSearchOpen(false)}
                  />
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            )}
          </div>

          {/* Account */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/orders">My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wishlist">
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                  {itemCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
