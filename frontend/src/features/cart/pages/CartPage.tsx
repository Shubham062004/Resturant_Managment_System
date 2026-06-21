import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  Info,
  X,
  ChevronRight,
  Percent,
  Cake,
  Store,
  UtensilsCrossed,
  Truck,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../../app/store';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import SmartComboSuggestion from '../../ai/components/SmartComboSuggestion';
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  useValidateCoupon,
  applyGuestCoupon,
  removeGuestCoupon,
  loadGuestCart,
} from '../store/cartQueries';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: cart, isLoading, isError } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const validateCoupon = useValidateCoupon();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [orderType, setOrderType] = useState<'DELIVERY' | 'TAKEAWAY' | 'DINE_IN'>('DELIVERY');
  const [tableNumber, setTableNumber] = useState('');
  const [couponDrawerOpen, setCouponDrawerOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const subtotal = cart?.items?.reduce(
    (sum: number, item: any) => sum + parseFloat(item.price) * item.quantity,
    0
  ) || 0;

  // Load applied coupon from local storage if guest
  useEffect(() => {
    if (cart && !isAuthenticated) {
      const guestCart = cart as any;
      if (guestCart.couponCode && guestCart.cartTotals?.discount > 0) {
        setAppliedCoupon({
          code: guestCart.couponCode,
          discountAmount: guestCart.cartTotals.discount,
        });
      }
    }
  }, [cart, isAuthenticated]);

  // Remove coupon if cart subtotal drops below minimumAmount
  useEffect(() => {
    if (appliedCoupon) {
      const match = couponList.find((c) => c.code === appliedCoupon.code);
      if (match && subtotal < match.minimumAmount) {
        setAppliedCoupon(null);
        toast.error(`Coupon ${appliedCoupon.code} removed as order subtotal is below ₹${match.minimumAmount}`);
        if (!isAuthenticated) {
          removeGuestCoupon();
        }
      }
    }
  }, [subtotal, appliedCoupon, isAuthenticated, toast]);

  const couponList = [
    { code: 'WELCOME50', description: 'Get ₹50 off on orders of ₹499 or more', discountType: 'FIXED_AMOUNT', discountValue: 50, minimumAmount: 499 },
    { code: 'SAVE100', description: 'Get ₹100 off on orders of ₹999 or more', discountType: 'FIXED_AMOUNT', discountValue: 100, minimumAmount: 999 },
    { code: 'PARTY200', description: 'Get ₹200 off on orders of ₹1499 or more', discountType: 'FIXED_AMOUNT', discountValue: 200, minimumAmount: 1499 },
    { code: 'SUPER300', description: 'Get ₹300 off on orders of ₹1999 or more', discountType: 'FIXED_AMOUNT', discountValue: 300, minimumAmount: 1999 },
    { code: 'MEGA500', description: 'Get ₹500 off on orders of ₹2999 or more', discountType: 'FIXED_AMOUNT', discountValue: 500, minimumAmount: 2999 },
  ];

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
        <div className="py-20 text-center max-w-md mx-auto space-y-6">
          <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto text-4xl shadow-inner">
            ⚠️
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-display text-white">Unable to load cart</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Please check your connection and try again.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full h-12 font-bold border-white/10 hover:bg-white/5"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const isBirthdayEligible = user?.email === 'customer1@abcrestaurant.com';
  const isBirthdayApplied = isBirthdayEligible && subtotal >= 3000 && !appliedCoupon;

  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const deliveryFee = orderType === 'DELIVERY' ? (subtotal >= 200 ? 0 : 20) : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const gst = taxableAmount * 0.05; // 5% GST
  const grandTotal = taxableAmount + deliveryFee + gst;

  const handleQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await handleRemove(itemId);
      return;
    }
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
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    // Check custom coupons first
    const match = couponList.find((c) => c.code === code);
    if (match) {
      if (subtotal < match.minimumAmount) {
        toast.error(`Minimum order amount of ₹${match.minimumAmount} required`);
        return;
      }
      setAppliedCoupon({
        code: match.code,
        discountAmount: match.discountValue,
      });
      setCouponCode('');
      toast.success('Coupon applied successfully!');

      if (!isAuthenticated) {
        applyGuestCoupon(match.code, match.discountValue);
      }
      return;
    }

    try {
      const res = await validateCoupon.mutateAsync({
        code,
        orderAmount: subtotal,
      });
      setAppliedCoupon({
        code: res.coupon.code,
        discountAmount: res.discountAmount,
      });
      setCouponCode('');
      toast.success('Coupon applied successfully!');

      if (!isAuthenticated) {
        applyGuestCoupon(res.coupon.code, res.discountAmount);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleSelectCoupon = (coupon: typeof couponList[0]) => {
    if (subtotal < coupon.minimumAmount) {
      toast.error(`Spend ₹${(coupon.minimumAmount - subtotal).toFixed(0)} more to unlock this coupon`);
      return;
    }

    setAppliedCoupon({
      code: coupon.code,
      discountAmount: coupon.discountValue,
    });
    setCouponDrawerOpen(false);
    toast.success(`Coupon ${coupon.code} applied!`);

    if (!isAuthenticated) {
      applyGuestCoupon(coupon.code, coupon.discountValue);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');

    if (!isAuthenticated) {
      removeGuestCoupon();
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const checkoutState = {
      orderType,
      tableNumber: orderType === 'DINE_IN' ? tableNumber : '',
      discount,
      couponCode: appliedCoupon?.code || '',
      isBirthdayApplied,
      deliveryFee,
    };

    navigate('/checkout', {
      state: checkoutState,
    });
  };

  return (
    <>
      <SEO
        title="My Cart — ABC Restaurant"
        description="Review your order before checkout."
      />
      <div className="min-h-screen bg-[#08070F] text-white pt-24 pb-32">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display flex items-center gap-3">
                <ShoppingBag className="text-primary" size={32} />
                Your Cart
                {!isAuthenticated && (
                  <span className="text-xs bg-amber-500/20 text-amber-400 font-extrabold uppercase px-2.5 py-1 rounded-full border border-amber-500/30 tracking-wider">
                    Guest Cart
                  </span>
                )}
              </h1>
              <p className="text-neutral-400 text-sm mt-2">
                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}{' '}
                in your cart
              </p>
            </div>
            {cart.items.length > 0 && (
              <button
                onClick={() => {
                  if (
                    window.confirm('Are you sure you want to clear your cart?')
                  ) {
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
            <div className="py-20 text-center max-w-md mx-auto space-y-6">
              <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto text-4xl shadow-inner">
                🛒
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-display text-white">Your cart is empty</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Looks like you haven&apos;t added anything to your cart yet. Discover our delicious meals and desserts!
                </p>
              </div>
              <Button
                variant="primary"
                className="w-full h-12 font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                onClick={() => navigate('/menu')}
              >
                Browse Menu
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Cart Items & Dining Modes */}
              <div className="lg:col-span-8 space-y-6">
                {!isAuthenticated && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                    <Info size={18} className="shrink-0" />
                    <span>Your cart will be saved after login. Do not lose cart contents.</span>
                  </div>
                )}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-2 sm:p-4 space-y-2">
                  {cart.items.map((item: any) => (
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
                          <p className="text-xs text-neutral-400 mt-1">
                            {item.variant.name}
                          </p>
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
                            onClick={() =>
                              handleQuantity(item.id, item.quantity - 1)
                            }
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
                            onClick={() =>
                              handleQuantity(item.id, item.quantity + 1)
                            }
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

                      {/* Remove Button */}
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

                  {/* Birthday Cake Promotion Item */}
                  {isBirthdayApplied && (
                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row gap-5 items-start sm:items-center relative animate-fade-in">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-900 flex items-center justify-center text-4xl">
                        🎂
                      </div>
                      <div className="flex-1 min-w-0 pr-10 sm:pr-0">
                        <p className="font-bold text-base text-white flex items-center gap-2">
                          <span>Celebration Cake</span>
                          <span className="bg-primary/20 border border-primary/30 text-primary text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">Free Gift</span>
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">Birthday Special Promotion</p>
                        <p className="text-sm text-primary font-bold mt-2">
                          ₹0 <span className="line-through text-neutral-500 text-xs ml-1">₹500</span>
                        </p>
                      </div>
                      <div className="text-sm text-emerald-400 font-bold shrink-0">
                        Added
                      </div>
                    </div>
                  )}
                </div>

                {/* Select Dining Mode Section */}
                <div className="bg-[#110E1C]/40 border border-white/5 rounded-3xl p-6 space-y-4 backdrop-blur-xl">
                  <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
                    <UtensilsCrossed size={16} className="text-primary" /> Select Dining Mode
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: 'DELIVERY', label: 'Delivery', icon: Truck, desc: 'Flat ₹20 (Free above ₹200)' },
                      { type: 'TAKEAWAY', label: 'Takeaway', icon: Store, desc: 'Self-pickup • Free' },
                      { type: 'DINE_IN', label: 'Dine-In', icon: UtensilsCrossed, desc: 'Eat at table • Free' },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = orderType === item.type;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setOrderType(item.type as any)}
                          className={`p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-white shadow-lg'
                              : 'border-white/10 bg-white/[0.01] hover:border-white/20 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <Icon size={20} className={isSelected ? 'text-primary' : 'text-neutral-400'} />
                          <span className="text-xs font-bold">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {orderType === 'DINE_IN' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-2"
                    >
                      <label className="text-xs text-neutral-400 font-semibold block mb-2">Table Number (Optional)</label>
                      <Input
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="Enter Table Number (e.g. 12)"
                        className="bg-black/40 border-white/10 text-sm h-11"
                      />
                    </motion.div>
                  )}
                </div>

                <SmartComboSuggestion
                  cartItemIds={cart.items.map((item: any) => item.product.id)}
                />
              </div>

              {/* Right Column: Order Summary & Coupon System */}
              <div className="lg:col-span-4 sticky top-24 space-y-6">
                {/* Coupon Code / Birthday Special Section */}
                <div className="bg-[#110E1C]/40 border border-white/5 rounded-3xl p-6 space-y-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
                      <Tag size={16} className="text-primary" /> Coupon & Offers
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCouponDrawerOpen(true)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
                    >
                      View All Coupons <ChevronRight size={14} />
                    </button>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                          <Percent size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-emerald-400 font-bold text-sm">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-emerald-500/80 text-xs font-medium">
                            ₹{appliedCoupon.discountAmount} Discount Applied
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-neutral-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : isBirthdayApplied ? (
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-primary/30 bg-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-xl">
                          🎂
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-sm">
                            Birthday Special
                          </span>
                          <span className="text-primary text-xs font-semibold">
                            Free Celebration Cake Added!
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary bg-primary/20 px-2 py-1 rounded">Applied</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
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
                      {isBirthdayEligible && subtotal < 3000 && (
                        <p className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                          <Cake size={12} /> Add ₹{(3000 - subtotal).toFixed(0)} more items for a Free Birthday Cake!
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Summary Box */}
                <div className="bg-[#110E1C]/40 border border-white/5 rounded-3xl p-6 space-y-4 backdrop-blur-xl">
                  <h3 className="font-bold text-white text-lg">
                    Order Summary
                  </h3>

                  <div className="space-y-3 text-sm pt-2">
                    <div className="flex justify-between text-neutral-400">
                      <span>Subtotal</span>
                      <span className="text-white">₹{subtotal.toFixed(0)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-semibold">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-400">
                      <span>Delivery Fee</span>
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-400 font-bold">FREE</span>
                      ) : (
                        <span className="text-white">₹{deliveryFee}</span>
                      )}
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span className="flex items-center gap-1">
                        GST (5%) <Info size={12} />
                      </span>
                      <span className="text-white">₹{gst.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-4">
                    <div className="flex justify-between items-end mb-6">
                      <span className="font-semibold text-white">
                        Grand Total
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{grandTotal.toFixed(0)}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      className="w-full h-14 font-bold text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                      onClick={handleProceedToCheckout}
                    >
                      <span>Proceed To Checkout</span>
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

      {/* Coupon Drawer / Modal Overlay */}
      <AnimatePresence>
        {couponDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCouponDrawerOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-[#0D0B14] border-l border-white/10 shadow-2xl flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Tag size={18} className="text-primary" /> Apply Coupon
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">Select a coupon for savings on your order</p>
                </div>
                <button
                  onClick={() => setCouponDrawerOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {isBirthdayApplied && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-400 leading-relaxed mb-2">
                    📢 Applying a coupon will remove the free celebration cake from your Birthday Special offer.
                  </div>
                )}
                {couponList.map((coupon) => {
                  const isEligible = subtotal >= coupon.minimumAmount;
                  const needed = coupon.minimumAmount - subtotal;
                  return (
                    <div
                      key={coupon.code}
                      className={`relative rounded-2xl border p-5 overflow-hidden transition-all duration-300 ${
                        isEligible
                          ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                          : 'border-white/5 bg-black/40 opacity-60 filter blur-[0.3px]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-extrabold text-sm text-white bg-primary/20 px-3 py-1 rounded-lg border border-primary/30 uppercase tracking-wider">
                          {coupon.code}
                        </span>
                        {isEligible ? (
                          <button
                            onClick={() => handleSelectCoupon(coupon)}
                            className="text-xs font-bold text-primary hover:text-white px-3 py-1.5 bg-primary/10 hover:bg-primary border border-primary/20 rounded-lg transition-all"
                          >
                            Apply
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                            🔒 Locked
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-neutral-300 mt-3">{coupon.description}</p>
                      {!isEligible && (
                        <p className="text-[10px] text-primary font-semibold mt-2.5">
                          Add items worth ₹{needed.toFixed(0)} more to unlock
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Required Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-[#0F0D16] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden z-10 space-y-6 animate-fade-in"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2 text-primary">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="text-2xl font-bold font-display text-white">Continue to Checkout</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Login or create an account to place your order.
                </p>
              </div>

              <div className="space-y-3">
                {/* Continue with Google */}
                <Button
                  onClick={() => {
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
                    window.location.href = `${apiUrl}/auth/google`;
                  }}
                  variant="outline"
                  className="w-full h-12 border-white/10 hover:bg-white/5 font-semibold flex items-center justify-center gap-3 text-white"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </Button>

                {/* Login */}
                <Button
                  onClick={() => {
                    const checkoutState = {
                      orderType,
                      tableNumber: orderType === 'DINE_IN' ? tableNumber : '',
                      discount,
                      couponCode: appliedCoupon?.code || '',
                      isBirthdayApplied,
                      deliveryFee,
                    };
                    navigate('/login', {
                      state: { from: { pathname: '/checkout', state: checkoutState } },
                    });
                  }}
                  variant="primary"
                  className="w-full h-12 font-bold shadow-md shadow-primary/10"
                >
                  Login
                </Button>

                {/* Register */}
                <Button
                  onClick={() => {
                    const checkoutState = {
                      orderType,
                      tableNumber: orderType === 'DINE_IN' ? tableNumber : '',
                      discount,
                      couponCode: appliedCoupon?.code || '',
                      isBirthdayApplied,
                      deliveryFee,
                    };
                    navigate('/register', {
                      state: { from: { pathname: '/checkout', state: checkoutState } },
                    });
                  }}
                  variant="secondary"
                  className="w-full h-12 font-bold text-slate-900"
                >
                  Register
                </Button>

                {/* Cancel */}
                <Button
                  onClick={() => setShowLoginModal(false)}
                  variant="outline"
                  className="w-full h-12 border-transparent hover:bg-white/5 font-semibold text-neutral-400"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartPage;
