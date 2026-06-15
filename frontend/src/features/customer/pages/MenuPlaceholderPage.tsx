import React from 'react';

import SEO from '../../../shared/components/SEO';
import EmptyState from '../../../shared/components/ui/EmptyState';

export const MenuPlaceholderPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Menu Catalog Catalog"
        description="Browse ABC custom fire-baked pizza combinations and customized cheeseburger menus."
      />

      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <EmptyState
          type="products"
          title="Online Menu Coming Soon"
          description="We are currently configuring our digital smart ovens with local catalogs. Check back soon to customize toppings and order!"
        />
      </div>
    </>
  );
};

export default MenuPlaceholderPage;
