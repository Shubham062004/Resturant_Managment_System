import React from 'react';
import { useParams } from 'react-router-dom';

import SEO from '../../../shared/components/SEO';
import EmptyState from '../../../shared/components/ui/EmptyState';

export const ProductPlaceholderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <SEO
        title={`Product Customizer - ${id}`}
        description="Select size modifiers, meat crust toppings, and fresh veggie portions for your custom recipe."
      />

      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <EmptyState
          type="products"
          title="Product Customization Panel"
          description={`Interactive detail views and ingredient list triggers for Product ID: ${id} will plug in here.`}
        />
      </div>
    </>
  );
};

export default ProductPlaceholderPage;
