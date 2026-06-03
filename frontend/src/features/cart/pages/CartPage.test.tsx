import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CartPage } from './CartPage';
import React from 'react';

// Mock dependencies
vi.mock('../../../app/store', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <a>{children}</a>,
}));

vi.mock('../store/cartQueries', () => ({
  useCart: () => ({ data: { items: [], subtotal: 0, total: 0 }, isLoading: false }),
  useUpdateCartItem: () => ({ mutate: vi.fn() }),
  useRemoveCartItem: () => ({ mutate: vi.fn() }),
  useClearCart: () => ({ mutate: vi.fn() }),
}));

describe('CartPage', () => {
  it('renders empty cart state', () => {
    render(<CartPage />);
    // Depends on implementation of EmptyState
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });
});
