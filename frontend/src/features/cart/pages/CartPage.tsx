import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import EmptyState from '../../../shared/components/ui/EmptyState';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  useValidateCoupon,
} from '../store/cartQueries';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Info, X } from 'lucide-react';
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
  const validateCoupon = useValidateCoupon();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#08070F] pt-32 pb-20 px-4">
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
      <div className="min-h-screen bg-[#08070F] pt-32 pb-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !cart) {
    return (
      <div className="min-h-screen bg-[#08070F] pt-32 pb-20 px-4">
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

  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

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

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      const res = await validateCoupon.mutateAsync({ code: couponCode, orderAmount: subtotal });
      setAppliedCoupon({ code: res.coupon.code, discountAmount: res.discountAmount });
      toast.success('Coupon applied successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  return (
    <>
      <SEO title="My Cart — ABC Restaurant" description="Review your order before checkout." />
      <div className="min-h-screen bg-[#08070F] text-white pt-24 pb-32">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display flex items-center gap-3">
                <ShoppingBag className="text-primary" size={32} />
                Your Cart
              </h1>
              <p className="text-neutral-400 text-sm mt-2">
                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            {cart.items.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your cart?')) {
                    clearCart.mutate();
                  }
                }}
                className="text-xs text-neutral-500 hover:text-red-400 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={14} /> Clear Cart
              </button>
            )}
          </div>

          {cart.items.length === 0 ? (
            <div className="py-10">
              <EmptyState
                type="orders"
                title="Your cart is empty"
                description="Browse restaurants and add some delicious food to get started."
                actionLabel="Browse Menu"
                onAction={() => navigate('/restaurants')}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Cart Items */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-2 sm:p-4 space-y-2">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="group p-4 rounded-2xl bg-transparent hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row gap-5 items-start sm:items-center relative"
                    >
                      {/* Image */}
                      <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-900">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600">
                            <ShoppingBag size={24} />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 pr-10 sm:pr-0">
                        <Link
                          to={`/products/${item.product.slug}`}
                          className="font-bold text-base text-white hover:text-primary transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <p className="text-xs text-neutral-400 mt-1">{item.variant.name}</p>
                        )}
                        <p className="text-sm text-primary font-bold mt-2">
                          ₹{parseFloat(item.price).toFixed(0)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
                        <div className="flex items-center gap-0 bg-white/[0.04] border border-white/10 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-2 hover:bg-white/10 transition-colors text-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-2 hover:bg-white/10 transition-colors text-white"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-bold text-white hidden sm:block w-16 text-right">
                          ₹{(parseFloat(item.price) * item.quantity).toFixed(0)}
                        </p>
                      </div>

                      {/* Remove Button (Mobile absolute top right, Desktop inline) */}
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="absolute sm:relative top-4 right-4 sm:top-auto sm:right-auto p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-0 sm:ml-4"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <SmartComboSuggestion cartItemIds={cart.items.map((item) => item.product.id)} />
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-4 sticky top-24 space-y-6">
                {/* Coupon Code Box */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Tag size={16} className="text-primary" /> Apply Coupon
                  </h3>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                      <div className="flex flex-col">
                        <span className="text-emerald-400 font-bold text-sm">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-emerald-500/80 text-xs">Coupon Applied</span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-neutral-400 hover:text-white p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter promo code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="bg-black/40 border-white/10 text-sm h-11 uppercase"
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        className="h-11 border-white/10 hover:bg-white/5 font-semibold shrink-0"
                        disabled={validateCoupon.isPending}
                      >
                        {validateCoupon.isPending ? '...' : 'Apply'}
                      </Button>
                    </form>
                  )}
                </div>

                {/* Summary Box */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                  <h3 className="font-bold text-white text-lg">Order Summary</h3>

                  <div className="space-y-3 text-sm pt-2">
                    <div className="flex justify-between text-neutral-400">
                      <span>Subtotal</span>
                      <span className="text-white">₹{subtotal.toFixed(0)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-400">
                      <span className="flex items-center gap-1">
                        Taxes & Fees <Info size={12} />
                      </span>
                      <span className="text-white">Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-4">
                    <div className="flex justify-between items-end mb-6">
                      <span className="font-semibold text-white">Estimated Total</span>
                      <span className="text-2xl font-bold text-primary">₹{total.toFixed(0)}</span>
                    </div>
                    <Button
                      variant="primary"
                      className="w-full h-14 font-bold text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                      onClick={() => navigate('/checkout')}
                    >
                      Proceed to Checkout
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;
