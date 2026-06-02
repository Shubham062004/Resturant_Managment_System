import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../app/store';

export interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { accessToken } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  if (accessToken) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
