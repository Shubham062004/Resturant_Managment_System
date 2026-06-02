import React from 'react';
import CustomerLayout from './CustomerLayout';

export const GuestLayout: React.FC = () => {
  // Inherits CustomerLayout structure but signifies public anonymous clearance
  return <CustomerLayout />;
};

export default GuestLayout;
