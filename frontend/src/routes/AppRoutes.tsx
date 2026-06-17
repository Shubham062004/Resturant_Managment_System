import React, { useEffect, Suspense } from 'react';

import ThemeProvider from '../shared/theme/theme-provider';

import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../app/store';

// Lazy-load layouts for route code splitting
const CustomerLayout = React.lazy(() => import('../layouts/CustomerLayout'));
const ProfileLayout = React.lazy(() => import('../layouts/ProfileLayout'));
const ErrorLayout = React.lazy(() => import('../layouts/ErrorLayout'));
const MainLayout = React.lazy(() => import('../layouts/MainLayout'));

// Import Route Guards
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
import PublicRoute from '../features/auth/components/PublicRoute';
import { refreshSession, fetchProfile } from '../features/auth/store/authSlice';
import ErrorBoundary from '../shared/components/ErrorBoundary';
import { ToastProvider } from '../shared/components/ui/Toast';

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
const DeliveryDashboardPage = React.lazy(
  () => import('../features/delivery/pages/DeliveryDashboardPage'),
);
const EarningsDashboardPage = React.lazy(
  () => import('../features/delivery/pages/EarningsDashboardPage'),
);
const InventoryDashboardPage = React.lazy(
  () => import('../features/inventory/pages/InventoryDashboardPage'),
);
const POSDashboardPage = React.lazy(() => import('../features/pos/pages/POSDashboardPage'));
const OwnerDashboardPage = React.lazy(() => import('../features/admin/pages/OwnerDashboardPage'));
// Branch Manager Module (Rebuilt)
const BranchManagerLayout = React.lazy(
  () => import('../features/manager/components/BranchManagerLayout'),
);
const ManagerDashboardPage = React.lazy(
  () => import('../features/manager/pages/ManagerDashboardPage'),
);
const ManagerOrdersPage = React.lazy(() => import('../features/manager/pages/ManagerOrdersPage'));
const ManagerPOSPage = React.lazy(() => import('../features/manager/pages/ManagerPOSPage'));
const ManagerTablesPage = React.lazy(() => import('../features/manager/pages/ManagerTablesPage'));
const ManagerReservationsPage = React.lazy(
  () => import('../features/manager/pages/ManagerReservationsPage'),
);
const ManagerStaffPage = React.lazy(() => import('../features/manager/pages/ManagerStaffPage'));
const ManagerKitchenPage = React.lazy(() => import('../features/manager/pages/ManagerKitchenPage'));
const ManagerInventoryPage = React.lazy(
  () => import('../features/manager/pages/ManagerInventoryPage'),
);
const ManagerCustomersPage = React.lazy(
  () => import('../features/manager/pages/ManagerCustomersPage'),
);
const ManagerAnalyticsPage = React.lazy(
  () => import('../features/manager/pages/ManagerAnalyticsPage'),
);
// Staff Portal
const StaffLayout = React.lazy(() => import('../features/staff/components/StaffLayout'));
const StaffDashboardPage = React.lazy(() => import('../features/staff/pages/StaffDashboardPage'));
const StaffProfilePage = React.lazy(() => import('../features/staff/pages/StaffProfilePage'));
const StaffWorkQueuePage = React.lazy(() => import('../features/staff/pages/StaffWorkQueuePage'));
const StaffAttendancePage = React.lazy(() => import('../features/staff/pages/StaffAttendancePage'));
const StaffPerformancePage = React.lazy(
  () => import('../features/staff/pages/StaffPerformancePage'),
);
const ReservationsPage = React.lazy(
  () => import('../features/reservations/pages/ReservationsPage'),
);
const FloorPlanPage = React.lazy(() => import('../features/floor-plan/pages/FloorPlanPage'));
const TakeawayQueuePage = React.lazy(() => import('../features/takeaway/pages/TakeawayQueuePage'));
const AdminLayout = React.lazy(() => import('../features/admin/components/AdminLayout'));
const StaffManagementPage = React.lazy(() => import('../features/admin/pages/StaffManagementPage'));
const BranchManagementPage = React.lazy(
  () => import('../features/admin/pages/BranchManagementPage'),
);
const IngredientManagementPage = React.lazy(
  () => import('../features/admin/pages/IngredientManagementPage'),
);
const SupplierManagementPage = React.lazy(
  () => import('../features/admin/pages/SupplierManagementPage'),
);
const MenuManagementPage = React.lazy(() => import('../features/admin/pages/MenuManagementPage'));
const InventoryRequestsPage = React.lazy(
  () => import('../features/admin/pages/InventoryRequestsPage'),
);
const FinancePage = React.lazy(() => import('../features/admin/pages/FinancePage'));
const AuditLogPage = React.lazy(() => import('../features/admin/pages/AuditLogPage'));
const AdminOrdersPage = React.lazy(() => import('../features/admin/pages/AdminOrdersPage'));
const AnalyticsDashboardPage = React.lazy(
  () => import('../features/analytics/pages/AnalyticsDashboardPage'),
);
const AdminAIInsightsPage = React.lazy(() => import('../features/ai/pages/AdminAIInsightsPage'));
const SystemHealthPage = React.lazy(() => import('../features/qa/pages/SystemHealthPage'));

// History Module Pages
const OrderHistoryPage = React.lazy(() => import('../features/history/pages/OrderHistoryPage'));
const StaffHistoryPage = React.lazy(() => import('../features/history/pages/StaffHistoryPage'));
const InventoryHistoryPage = React.lazy(
  () => import('../features/history/pages/InventoryHistoryPage'),
);
const IngredientHistoryPage = React.lazy(
  () => import('../features/history/pages/IngredientHistoryPage'),
);
const SupplierHistoryPage = React.lazy(
  () => import('../features/history/pages/SupplierHistoryPage'),
);
const BranchHistoryPage = React.lazy(() => import('../features/history/pages/BranchHistoryPage'));
const CustomerActivityHistoryPage = React.lazy(
  () => import('../features/history/pages/CustomerActivityHistoryPage'),
);
const FinanceHistoryPage = React.lazy(() => import('../features/history/pages/FinanceHistoryPage'));
const AttendanceHistoryPage = React.lazy(
  () => import('../features/history/pages/AttendanceHistoryPage'),
);
const SalaryBonusHistoryPage = React.lazy(
  () => import('../features/history/pages/SalaryBonusHistoryPage'),
);
const AuditLogsPage = React.lazy(() => import('../features/history/pages/AuditLogsPage'));
const SystemActivityLogsPage = React.lazy(
  () => import('../features/history/pages/SystemActivityLogsPage'),
);

// Super Admin Pages
const SuperAdminLayout = React.lazy(
  () => import('../features/super-admin/components/SuperAdminLayout'),
);
const GlobalDashboardPage = React.lazy(
  () => import('../features/super-admin/pages/GlobalDashboardPage'),
);
const OrganizationManagementPage = React.lazy(
  () => import('../features/super-admin/pages/OrganizationManagementPage'),
);

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
const VerifyOtpPage = React.lazy(() => import('../features/auth/pages/VerifyOtpPage'));
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

// Removed Kitchen Views
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
      .then(() =>
        dispatch(fetchProfile()).catch(() => {
          /* Profile fetch failed but session is still valid — user stays authenticated */
        }),
      )
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
              path="/verify-login-otp"
              element={
                <PublicRoute>
                  <VerifyOtpPage />
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

              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/address" element={<Navigate to="/checkout" replace />} />
              <Route path="/checkout/payment" element={<Navigate to="/checkout" replace />} />

              {/* Protected Customer Account Pages */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
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
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <OrderTrackingPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Admin / Owner Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'ADMIN',
                    'SUPER_ADMIN',
                    'PLATFORM_ADMIN',
                    'ORGANIZATION_OWNER',
                    'FRANCHISE_OWNER',
                  ]}
                >
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OwnerDashboardPage />} />
              <Route path="customers" element={<div>Customers Page</div>} />
              <Route path="analytics" element={<AnalyticsDashboardPage />} />
              <Route path="ai-insights" element={<AdminAIInsightsPage />} />
              <Route path="system-health" element={<SystemHealthPage />} />
              <Route path="settings" element={<div>Settings Page</div>} />
              <Route path="staff" element={<StaffManagementPage />} />
              <Route path="branches" element={<BranchManagementPage />} />
              <Route path="ingredients" element={<IngredientManagementPage />} />
              <Route path="inventory" element={<InventoryRequestsPage />} />
              <Route path="suppliers" element={<SupplierManagementPage />} />
              <Route path="menu" element={<MenuManagementPage />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="audit" element={<AuditLogPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />

              {/* History Module */}
              <Route path="history">
                <Route path="orders" element={<OrderHistoryPage />} />
                <Route path="staff" element={<StaffHistoryPage />} />
                <Route path="inventory" element={<InventoryHistoryPage />} />
                <Route path="ingredients" element={<IngredientHistoryPage />} />
                <Route path="suppliers" element={<SupplierHistoryPage />} />
                <Route path="branches" element={<BranchHistoryPage />} />
                <Route path="customers" element={<CustomerActivityHistoryPage />} />
                <Route path="finance" element={<FinanceHistoryPage />} />
                <Route path="attendance" element={<AttendanceHistoryPage />} />
                <Route path="salary" element={<SalaryBonusHistoryPage />} />
                <Route path="audit" element={<AuditLogsPage />} />
                <Route path="system" element={<SystemActivityLogsPage />} />
                <Route index element={<OrderHistoryPage />} />
              </Route>

              <Route path="*" element={<div className="p-6">Page not found in Admin Panel</div>} />
            </Route>

            {/* Branch Manager Operations Console */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={['BRANCH_MANAGER']}>
                  <BranchManagerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ManagerDashboardPage />} />
              <Route path="orders" element={<ManagerOrdersPage />} />
              <Route path="pos" element={<ManagerPOSPage />} />
              <Route path="tables" element={<ManagerTablesPage />} />
              <Route path="reservations" element={<ManagerReservationsPage />} />
              <Route path="staff" element={<ManagerStaffPage />} />
              <Route path="kitchen" element={<ManagerKitchenPage />} />
              <Route path="inventory" element={<ManagerInventoryPage />} />
              <Route path="customers" element={<ManagerCustomersPage />} />
              <Route path="analytics" element={<ManagerAnalyticsPage />} />
            </Route>

            {/* Staff Portal System */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute
                  allowedRoles={['KITCHEN_STAFF', 'HEAD_CHEF', 'CHEF', 'KITCHEN_MANAGER']}
                >
                  <StaffLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StaffDashboardPage />} />
              <Route path="profile" element={<StaffProfilePage />} />
              <Route path="work" element={<StaffWorkQueuePage />} />
              <Route path="attendance" element={<StaffAttendancePage />} />
              <Route path="performance" element={<StaffPerformancePage />} />
            </Route>
            {/* Inventory Dashboard System */}
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={['INVENTORY_MANAGER', 'OPERATIONS_MANAGER']}>
                  <InventoryDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Delivery Dashboard System */}
            <Route
              path="/delivery"
              element={
                <ProtectedRoute allowedRoles={['DELIVERY_PARTNER', 'DELIVERY_MANAGER']}>
                  <DeliveryDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery/earnings"
              element={
                <ProtectedRoute allowedRoles={['DELIVERY_PARTNER', 'DELIVERY_MANAGER']}>
                  <EarningsDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* POS Dashboard System */}
            <Route
              path="/pos"
              element={
                <ProtectedRoute allowedRoles={['CASHIER', 'POS_OPERATOR']}>
                  <POSDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Super Admin Dashboard System */}
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLATFORM_ADMIN']}>
                  <SuperAdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<GlobalDashboardPage />} />
              <Route path="organizations" element={<OrganizationManagementPage />} />
              <Route
                path="*"
                element={
                  <div className="p-6 text-slate-100">Page not found in Super Admin Panel</div>
                }
              />
            </Route>

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
