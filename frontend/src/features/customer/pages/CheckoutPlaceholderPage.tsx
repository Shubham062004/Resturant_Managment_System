import React from 'react';

import SEO from '../../../shared/components/SEO';
import EmptyState from '../../../shared/components/ui/EmptyState';

export const CheckoutPlaceholderPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Secure Checkout Gateway"
        description="Proceed to pay for your customized ABC order using safe banking credit, debit, or cash gateways."
      />

      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <EmptyState
          type="orders"
          title="Checkout Gateway Coming Soon"
          description="Secure payment integrations, tipping modifiers, and contactless courier options will render here in a future release."
        />
      </div>
    </>
  );
};

export default CheckoutPlaceholderPage;
