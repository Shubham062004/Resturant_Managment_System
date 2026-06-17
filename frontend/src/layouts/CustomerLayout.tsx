import React from 'react';
import { Outlet } from 'react-router-dom';

import Footer from '../features/customer/components/Footer';
import Navbar from '../features/customer/components/Navbar';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Skip to Main Content link for Screen Readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2.5 rounded-lg font-display font-semibold z-[9999] shadow-lg"
      >
        Skip to main content
      </a>

      {/* Dynamic Header */}
      <Navbar />

      {/* Content pane (pt-20 is for sticky header alignment) */}
      <main id="main-content" className="flex-grow pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CustomerLayout;
