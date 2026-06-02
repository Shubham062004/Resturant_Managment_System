import React from 'react';

export interface CenteredLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const CenteredLayout: React.FC<CenteredLayoutProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300 p-4 relative overflow-hidden
        ${className}
      `}
    >
      {/* Background radial decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-md z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default CenteredLayout;
