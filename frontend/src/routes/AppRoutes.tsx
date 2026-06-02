import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ThemeProvider from '../shared/theme/theme-provider';
import { ToastProvider } from '../shared/components/ui/Toast';
import { HelmetProvider } from 'react-helmet-async';
import { useAppDispatch, useAppSelector } from '../app/store';
import { refreshSession, fetchProfile } from '../features/auth/store/authSlice';

// Lazy-load layouts for route code splitting
const CustomerLayout = React.lazy(() => import('../layouts/CustomerLayout'));
const ProfileLayout = React.lazy(() => import('../layouts/ProfileLayout'));
const ErrorLayout = React.lazy(() => import('../layouts/ErrorLayout'));
const MainLayout = React.lazy(() => import('../layouts/MainLayout'));

// Import Route Guards
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
import PublicRoute from '../features/auth/components/PublicRoute';
import ErrorBoundary from '../shared/components/ErrorBoundary';

// Lazy Load Pages for Bundle Optimization
const LandingPage = React.lazy(() => import('../features/customer/pages/LandingPage'));
const AboutPage = React.lazy(() => import('../features/customer/pages/AboutPage'));
const ContactPage = React.lazy(() => import('../features/customer/pages/ContactPage'));
const BranchesPage = React.lazy(() => import('../features/customer/pages/BranchesPage'));
const SearchPage = React.lazy(() => import('../features/customer/pages/SearchPage'));
const OffersPage = React.lazy(() => import('../features/customer/pages/OffersPage'));
const FavoritesPage = React.lazy(() => import('../features/customer/pages/FavoritesPage'));
const OrderListPage = React.lazy(() => import('../features/orders/pages/OrderListPage'));
const OrderTrackingPage = React.lazy(() => import('../features/orders/pages/OrderTrackingPage'));
const DeliveryDashboardPage = React.lazy(() => import('../features/delivery/pages/DeliveryDashboardPage'));
const EarningsDashboardPage = React.lazy(() => import('../features/delivery/pages/EarningsDashboardPage'));

// Menu Catalog Pages
const RestaurantsPage = React.lazy(() => import('../features/customer/pages/RestaurantsPage'));
const RestaurantDetailPage = React.lazy(
  () => import('../features/customer/pages/RestaurantDetailPage'),
);
const ProductDetailPage = React.lazy(() => import('../features/customer/pages/ProductDetailPage'));
const CategoryDetailPage = React.lazy(
  () => import('../features/customer/pages/CategoryDetailPage'),
);
const AdminPlaceholderPage = React.lazy(
  () => import('../features/customer/pages/AdminPlaceholderPage'),
);

// Cart & Checkout
const CartPage = React.lazy(() => import('../features/cart/pages/CartPage'));
const CheckoutPage = React.lazy(() => import('../features/cart/pages/CheckoutPage'));
const AddressesPage = React.lazy(() => import('../features/cart/pages/AddressesPage'));

// Auth Pages (Lazy)
const LoginPage = React.lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../features/auth/pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('../features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('../features/auth/pages/ResetPasswordPage'));
const VerifyEmailPage = React.lazy(() => import('../features/auth/pages/VerifyEmailPage'));
const GoogleCallbackPage = React.lazy(() => import('../features/auth/pages/GoogleCallbackPage'));
const ProfilePage = React.lazy(() => import('../features/profile/pages/ProfilePage'));

// Error/Fallback Pages (Lazy)
const NotFoundPage = React.lazy(() => import('../features/customer/pages/NotFoundPage'));
const ServerErrorPage = React.lazy(() => import('../features/customer/pages/ServerErrorPage'));
const OfflinePage = React.lazy(() => import('../features/customer/pages/OfflinePage'));

// Staff dashboard views (inline templates from previous foundation)
const DesignSystemShowcase = React.lazy(
  () => import('../shared/components/ui/DesignSystemShowcase'),
);

// Kitchen Views (Lazy)
const KitchenDashboardPage = React.lazy(() => import('../features/kitchen/pages/KitchenDashboardPage'));
const KitchenAnalyticsPage = React.lazy(() => import('../features/kitchen/pages/KitchenAnalyticsPage'));

const DashboardView = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold font-display tracking-tight text-white animate-fade-in">
      Dashboard Overview
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {['Total Sales', 'Active Tables', 'Pending Tickets', 'Staff On-Shift'].map(
        (cardName, idx) => (
          <div key={idx} className="glass-card p-6 rounded-lg border border-border/40">
            <p className="text-sm text-muted-foreground font-sans">{cardName}</p>
            <p className="text-4xl font-semibold font-display text-primary mt-2">--</p>
          </div>
        ),
      )}
    </div>
  </div>
);

const TablesView = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold font-display tracking-tight text-white animate-fade-in">
      Floor Plan Grid
    </h1>
    <div className="glass-panel p-8 rounded-lg min-h-[400px] flex items-center justify-center border border-border/40">
      <p className="text-muted-foreground font-sans">
        Active interactive layout blueprint will render here.
      </p>
    </div>
  </div>
);

// Loader component for Suspense Fallbacks
const RouteLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-transparent">
    <div className="animate-spin rounded-full h-9 w-9 border-2 border-primary border-t-transparent" />
  </div>
);

const AppRouter = () => {
  const dispatch = useAppDispatch();
  const { authStatus } = useAppSelector((state) => state.auth);

  // Restore session from HttpOnly cookies on boot (non-blocking)
  useEffect(() => {
    if (authStatus !== 'idle') return;

    dispatch(refreshSession())
      .unwrap()
      .then(() => dispatch(fetchProfile()))
      .catch(() => {
        /* no active session — public routes remain available */
      });
  }, [authStatus, dispatch]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            {/* Public Authentication Pipelines */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/verify-email"
              element={
                <PublicRoute>
                  <VerifyEmailPage />
                </PublicRoute>
              }
            />
            <Route
              path="/auth/callback/google"
              element={
                <PublicRoute>
                  <GoogleCallbackPage />
                </PublicRoute>
              }
            />

            {/* Customer Facing Application Shell (Public & User Account pages) */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/branches" element={<BranchesPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/offers" element={<OffersPage />} />

              {/* Menu Catalog Routes */}
              <Route path="/menu" element={<RestaurantsPage />} />
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/restaurants/:slug" element={<RestaurantDetailPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/categories/:slug" element={<CategoryDetailPage />} />

              {/* Guarded Admin Console Shells */}
              <Route
                path="/admin/restaurants"
                element={
                  <ProtectedRoute>
                    <AdminPlaceholderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute>
                    <AdminPlaceholderPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/address" element={<Navigate to="/checkout" replace />} />
              <Route path="/checkout/payment" element={<Navigate to="/checkout" replace />} />

              {/* Protected Customer Account Pages (nested inside ProfileLayout sidebar) */}
              <Route
                element={
                  <ProtectedRoute>
                    <ProfileLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/orders" element={<OrderListPage />} />
                <Route path="/addresses" element={<AddressesPage />} />
              </Route>

              {/* Order Tracking - Full page view */}
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderTrackingPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="/admin" element={<Navigate to="/admin/restaurants" replace />} />
            <Route path="/design-system" element={<Navigate to="/staff/design-system" replace />} />
            <Route path="/500" element={<Navigate to="/server-error" replace />} />

            {/* Core Authorized Staff Dashboard Shell */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardView />} />
              <Route path="tables" element={<TablesView />} />
              <Route path="design-system" element={<DesignSystemShowcase />} />
            </Route>

            {/* Kitchen Dashboard System */}
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute>
                  <KitchenDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kitchen/analytics"
              element={
                <ProtectedRoute>
                  <KitchenAnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Delivery Dashboard System */}
            <Route
              path="/delivery"
              element={
                <ProtectedRoute>
                  <DeliveryDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery/earnings"
              element={
                <ProtectedRoute>
                  <EarningsDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Error Pages Shell */}
            <Route element={<ErrorLayout />}>
              <Route path="/offline" element={<OfflinePage />} />
              <Route path="/server-error" element={<ServerErrorPage />} />
              <Route path="/not-found" element={<NotFoundPage />} />
            </Route>

            {/* Catch-all redirect to 404 */}
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export const AppRoutes = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default AppRoutes;
