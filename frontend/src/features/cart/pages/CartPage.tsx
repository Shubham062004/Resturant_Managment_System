import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import { useToast } from '../../../shared/components/ui/Toast';
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '../store/cartQueries';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useAppSelector } from '../../../app/store';
import SmartComboSuggestion from '../../ai/components/SmartComboSuggestion';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: cart, isLoading, isError } = useCart(isAuthenticated);
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <EmptyState
          type="orders"
          title="Sign in to view your cart"
          description="Log in to add items and proceed to checkout."
          actionLabel="Go to Login"
          onAction={() => navigate('/login', { state: { from: { pathname: '/cart' } } })}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !cart) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <EmptyState
          type="orders"
          title="Unable to load cart"
          description="Please check your connection and try again."
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  );

  const handleQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateItem.mutateAsync({ id: itemId, quantity });
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem.mutateAsync(itemId);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  return (
    <>
      <SEO title="My Cart" description="Review your order before checkout." />
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <ShoppingBag className="text-primary" size={24} />
            Your Cart
          </h1>
          {cart.items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearCart.mutate()}
              className="text-danger"
            >
              Clear cart
            </Button>
          )}
        </div>

        {cart.items.length > 0 && (
          <SmartComboSuggestion cartItemIds={cart.items.map((item) => item.product.id)} />
        )}

        {cart.items.length === 0 ? (
          <EmptyState
            type="orders"
            title="Your cart is empty"
            description="Browse restaurants and add dishes to get started."
            actionLabel="Browse Menu"
            onAction={() => navigate('/restaurants')}
          />
        ) : (
          <>
            <ul className="space-y-4">
              {cart.items.map((item) => (
                <li
                  key={item.id}
                  className="glass-card p-4 rounded-xl border border-white/5 flex gap-4 items-center"
                >
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product.slug}`}
                      className="font-semibold text-white hover:text-primary transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground">{item.variant.name}</p>
                    )}
                    <p className="text-sm text-primary font-bold mt-1">
                      ${parseFloat(item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 rounded-lg border border-border/60 hover:bg-secondary/50"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 rounded-lg border border-border/60 hover:bg-secondary/50"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-2 text-danger hover:bg-danger/10 rounded-lg"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="glass-card p-6 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-3xl font-bold text-primary">${subtotal.toFixed(2)}</p>
              </div>
              <Button variant="primary" size="lg" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartPage;
