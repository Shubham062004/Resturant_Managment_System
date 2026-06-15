import React from 'react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  brandTitle?: string;
  brandDescription?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      {/* Visual Image Pane (Left Side) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-secondary overflow-hidden">
        {/* High-quality Restaurant/Food Imagery */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
          }}
        />

        {/* Optional overlay gradient to ensure the image looks premium and text (if any) is legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Floating Branding over the image */}
        <div className="absolute bottom-12 left-12 z-10 text-white">
          <div className="flex items-center gap-3 font-display font-black text-3xl tracking-tight mb-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">A</span>
            </div>
            <span>ABC Restaurant</span>
          </div>
          <p className="text-white/80 font-sans text-lg">Fresh Food. Fast Service.</p>
        </div>
      </div>

      {/* Auth action card panel (Right Side) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden bg-background lg:w-1/2">
        {/* Mobile-only branding */}
        <div className="lg:hidden flex flex-col items-center gap-2 mb-10 text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-display font-black text-2xl">A</span>
          </div>
          <h1 className="font-display font-black text-2xl tracking-tight mt-2 text-foreground">
            ABC Restaurant
          </h1>
          <p className="text-muted-foreground font-sans text-sm">Fresh Food. Fast Service.</p>
        </div>

        <div className="w-full max-w-md mx-auto z-10 animate-fade-in-up">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
