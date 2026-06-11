import React from 'react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
  brandTitle?: string;
  brandDescription?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  brandTitle = 'ABC',
  brandDescription = 'Production-grade terminal management systems for enterprise restaurant chains, kitchens, and point-of-sale systems.',
}) => {
  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      {/* Visual branding pane (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-hover to-accent flex-col justify-between p-12 text-white relative overflow-hidden select-none">
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />

        {/* Top brand signature */}
        <div className="flex items-center gap-2.5 font-display font-extrabold text-2xl tracking-tight z-10">
          <span className="text-3xl">🔥</span>
          <span>ABC</span>
        </div>

        {/* Center quote/intro info */}
        <div className="flex flex-col gap-6 max-w-md z-10 my-auto">
          <h2 className="text-4xl font-extrabold font-display leading-tight tracking-tight">
            {brandTitle}
          </h2>
          <p className="text-white/80 font-sans text-base leading-relaxed">{brandDescription}</p>
        </div>

        {/* Bottom copyright details */}
        <div className="text-white/60 font-sans text-xs z-10">
          © {new Date().getFullYear()} ABC Inc. All rights reserved.
        </div>
      </div>

      {/* Auth action card panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-background">
        {/* Subtle light warm details for background decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md z-10">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
