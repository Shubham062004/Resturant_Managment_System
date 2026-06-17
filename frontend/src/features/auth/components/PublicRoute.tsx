import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAppSelector } from '../../../app/store';
import { getDashboardRouteByRole } from '../utils/roleRouting';

export interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  if (isAuthenticated) {
    const destination =
      from === '/' ? getDashboardRouteByRole(user?.role) : from;
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
