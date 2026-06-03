import React from 'react';
import { Outlet } from 'react-router-dom';

interface ErrorLayoutProps {
  children?: React.ReactNode;
}

export const ErrorLayout: React.FC<ErrorLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300 p-6 relative overflow-hidden">
      {/* Visual background details */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-md z-10">{children || <Outlet />}</div>
    </div>
  );
};

export default ErrorLayout;
