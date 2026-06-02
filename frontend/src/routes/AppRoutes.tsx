import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ThemeProvider from '../shared/theme/theme-provider';
import { ToastProvider } from '../shared/components/ui/Toast';
import DesignSystemShowcase from '../shared/components/ui/DesignSystemShowcase';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchProfile } from '../features/auth/store/authSlice';

// Import Auth Pages
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage';
import GoogleCallbackPage from '../features/auth/pages/GoogleCallbackPage';
import ProfilePage from '../features/profile/pages/ProfilePage';

// Import Route Guards
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
import PublicRoute from '../features/auth/components/PublicRoute';

// Mock component boundaries for initial foundation
const DashboardView = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold font-display tracking-tight text-white">
      Dashboard Overview
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {['Total Sales', 'Active Tables', 'Pending Tickets', 'Staff On-Shift'].map(
        (cardName, idx) => (
          <div key={idx} className="glass-card p-6 rounded-lg">
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
    <h1 className="text-3xl font-bold font-display tracking-tight text-white">Floor Plan Grid</h1>
    <div className="glass-panel p-8 rounded-lg min-h-[400px] flex items-center justify-center">
      <p className="text-muted-foreground font-sans">
        Active interactive layout blueprint will render here.
      </p>
    </div>
  </div>
);

const AppRouter = () => {
  const dispatch = useAppDispatch();
  const { accessToken, authStatus } = useAppSelector((state) => state.auth);

  // Initialize session profile on boot if a token exists
  useEffect(() => {
    if (accessToken && authStatus === 'idle') {
      dispatch(fetchProfile());
    }
  }, [accessToken, authStatus, dispatch]);

  if (accessToken && authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public authentication pipelines */}
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

        {/* Core Authorized Shell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardView />} />
          <Route path="tables" element={<TablesView />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="design-system" element={<DesignSystemShowcase />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export const AppRoutes = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default AppRoutes;
