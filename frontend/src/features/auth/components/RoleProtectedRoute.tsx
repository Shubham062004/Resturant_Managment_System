import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAppSelector } from '../../../app/store';

export interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<
    'CUSTOMER' | 'ADMIN' | 'KITCHEN_STAFF' | 'DELIVERY_PARTNER' | 'CASHIER' | 'SUPER_ADMIN'
  >;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-xl text-center space-y-6 border border-danger/30 shadow-2xl">
          <div className="text-5xl animate-bounce">🚫</div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">
            Access Denied
          </h2>
          <p className="text-muted-foreground font-sans text-sm leading-relaxed">
            You do not possess the required privilege level to view this terminal node. Please
            contact your system administrator if you believe this is an error.
          </p>
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold font-display py-2.5 rounded-lg transition-all"
          >
            Return to Terminal
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
