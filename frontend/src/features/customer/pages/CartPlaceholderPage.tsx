import React from 'react';
import SEO from '../../../shared/components/SEO';
import EmptyState from '../../../shared/components/ui/EmptyState';

export const CartPlaceholderPage: React.FC = () => {
  return (
    <>
      <SEO
        title="My Shopping Cart"
        description="Review your customized cheeseburger toppings and firebrick baked pizza selections before checkout."
      />

      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <EmptyState
          type="orders"
          title="Shopping Cart is Empty"
          description="You haven't added any delicious fire-baked pizzas or burgers to your cart yet. Explore our menus to start building your order."
        />
      </div>
    </>
  );
};

export default CartPlaceholderPage;
