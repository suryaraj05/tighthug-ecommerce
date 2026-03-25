import { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { initAuth } from '@/services/authService';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Index from './pages/Index';
import Shop from './pages/Shop';
import CategoryPage from './pages/CategoryPage';
import NewArrivals from './pages/NewArrivals';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProductManager from './pages/Admin/ProductManager';
import OrderManager from './pages/Admin/OrderManager';
import CouponManager from './pages/Admin/CouponManager';
import ReviewManager from './pages/Admin/ReviewManager';
import Analytics from './pages/Admin/Analytics';
import FinanceControl from './pages/Admin/FinanceControl';
import UserManagement from './pages/Admin/UserManagement';
import ContactResponses from './pages/Admin/ContactResponses';
import WhatsAppFab from './components/WhatsAppFab';
import SeedData from './pages/SeedData';
import TrackOrder from './pages/TrackOrder';
import ReturnsExchanges from './pages/ReturnsExchanges';
import ShippingInfo from './pages/ShippingInfo';
import SizeGuide from './pages/SizeGuide';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import IndexHelper from './pages/IndexHelper';
import Wishlist from './pages/Wishlist';
import ForgotPassword from './pages/ForgotPassword';
import DownloadCombinedLabs from './pages/DownloadCombinedLabs';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize Firebase auth state listener
    const unsubscribe = initAuth();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/seed-data" element={<SeedData />} />
            
            {/* Footer Pages */}
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/returns-exchanges" element={<ReturnsExchanges />} />
            <Route path="/shipping-info" element={<ShippingInfo />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/index-helper" element={<IndexHelper />} />
            <Route path="/python" element={<DownloadCombinedLabs />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute requireAdmin>
                  <ProductManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute requireAdmin>
                  <OrderManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <ProtectedRoute requireAdmin>
                  <CouponManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute requireAdmin>
                  <ReviewManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute requireAdmin>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/finance"
              element={
                <ProtectedRoute requireAdmin>
                  <FinanceControl />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/contact-messages"
              element={
                <ProtectedRoute requireAdmin>
                  <ContactResponses />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WhatsAppFab />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
