import {
  Tag,
  MapPin,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAppSelector } from '../../../app/store';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  useCart,
  useAddresses,
  useValidateCoupon,
  type Address,
} from '../store/cartQueries';

type CheckoutStep = 'address' | 'coupon' | 'payment';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: cart, isLoading } = useCart();
  const { data: addresses = [] } = useAddresses(isAuthenticated);
  const validateCoupon = useValidateCoupon();

  const checkoutState = location.state || {};
  const orderType = checkoutState.orderType || 'DELIVERY';
  const tableNumber = checkoutState.tableNumber || '';
  const isBirthdayApplied = checkoutState.isBirthdayApplied || false;

  const [step, setStep] = useState<CheckoutStep>(
    orderType === 'DELIVERY' ? 'address' : 'payment'
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>(
    checkoutState.couponCode || ''
  );
  const [discountAmount, setDiscountAmount] = useState<number>(
    checkoutState.discount || 0
  );
  const [paymentProvider, setPaymentProvider] = useState<
    'CARD' | 'UPI' | 'COD'
  >('CARD');

  if (!isAuthenticated) {
    navigate('/login', { state: { from: { pathname: '/checkout' } } });
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08070F] pt-32 pb-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#08070F] pt-32 pb-20 px-4">
        <EmptyState
          type="orders"
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          actionLabel="Browse Menu"
          onAction={() => navigate('/menu')}
        />
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (sum: number, item: any) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  const deliveryFee = orderType === 'DELIVERY' ? (subtotal >= 200 ? 0 : 20) : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * 0.05; // 5% GST
  const total = Math.max(0, taxableAmount + deliveryFee + taxAmount);

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode.trim(),
        orderAmount: subtotal,
      });
      setDiscountAmount(result.discountAmount);
      toast.success(
        `Coupon applied! You saved ₹${result.discountAmount.toFixed(0)}`
      );
      setStep('payment');
    } catch {
      toast.error('Invalid or expired coupon');
    }
  };

  const handlePlaceOrder = () => {
    toast.success('Order placed successfully! (Simulation)');
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const steps: CheckoutStep[] =
    orderType === 'DELIVERY' ? ['address', 'coupon', 'payment'] : ['payment'];

  return (
    <>
      <SEO
        title="Secure Checkout — ABC Restaurant"
        description="Complete your ABC Restaurant order securely."
      />
      <div className="min-h-screen bg-[#08070F] text-white pt-24 pb-32 font-sans">
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-white">
                Secure Checkout
              </h1>
              <p className="text-neutral-400 text-sm mt-2 flex items-center gap-1">
                <ShieldCheck size={16} className="text-emerald-500" />{' '}
                {orderType === 'DELIVERY' &&
                  'End-to-end encrypted delivery payment'}
                {orderType === 'TAKEAWAY' && 'Self-Pickup Order details'}
                {orderType === 'DINE_IN' &&
                  `Table #${tableNumber} Dining details`}
              </p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide py-2">
              {steps.map((s, i) => (
                <React.Fragment key={s}>
                  <button
                    type="button"
                    onClick={() => setStep(s)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                      step === s
                        ? 'bg-primary/20 text-primary border border-primary/30 shadow-lg'
                        : 'bg-white/5 text-neutral-400 border border-white/5 hover:text-white'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === s ? 'bg-primary text-white' : 'bg-white/10 text-neutral-500'}`}
                    >
                      {i + 1}
                    </span>
                    {s}
                  </button>
                  {i < steps.length - 1 && (
                    <ChevronRight
                      size={14}
                      className="text-neutral-700 shrink-0"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Steps */}
            <div className="lg:col-span-7 space-y-8">
              {step === 'address' && orderType === 'DELIVERY' && (
                <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin size={20} />
                    </div>
                    <h2 className="text-xl font-bold font-display">
                      Delivery Address
                    </h2>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-neutral-400 mb-4">
                        You don&apos;t have any saved addresses yet.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/addresses')}
                      >
                        Add New Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((addr: Address) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${
                            (selectedAddressId || defaultAddress?.id) ===
                            addr.id
                              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                              : 'border-white/10 bg-white/[0.01] hover:border-white/20'
                          }`}
                        >
                          <div className="mt-1">
                            <input
                              type="radio"
                              name="address"
                              checked={
                                (selectedAddressId || defaultAddress?.id) ===
                                addr.id
                              }
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="w-4 h-4 text-primary bg-transparent border-white/20 focus:ring-primary focus:ring-offset-gray-900"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-white text-base">
                                {addr.fullName}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full font-semibold uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-400 leading-relaxed">
                              {addr.addressLine1}
                              <br />
                              {addr.city}, {addr.state} {addr.postalCode}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <Button
                      variant="primary"
                      className="h-12 px-8 font-bold"
                      onClick={() => setStep('coupon')}
                    >
                      Continue to Coupon
                    </Button>
                  </div>
                </section>
              )}

              {step === 'coupon' && orderType === 'DELIVERY' && (
                <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Tag size={20} />
                    </div>
                    <h2 className="text-xl font-bold font-display">
                      Apply Promo Code
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <p className="text-neutral-400 text-sm">
                      Have a coupon code? Enter it below to get a discount on
                      your order.
                    </p>
                    <div className="flex gap-3">
                      <Input
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        placeholder="e.g. WELCOME50"
                        className="flex-1 bg-black/40 border-white/10 h-12 uppercase text-white font-bold tracking-wider"
                      />
                      <Button
                        variant="primary"
                        className="h-12 px-6 font-bold"
                        onClick={handleApplyCoupon}
                        isLoading={validateCoupon.isPending}
                      >
                        Apply Code
                      </Button>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 size={18} />
                        <span className="font-semibold text-sm">
                          Code applied successfully! Saved ₹
                          {discountAmount.toFixed(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-white/5">
                    <button
                      onClick={() => setStep('address')}
                      className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      Back
                    </button>
                    <Button
                      variant="outline"
                      className="h-12 px-8 font-bold"
                      onClick={() => setStep('payment')}
                    >
                      Skip or Continue
                    </Button>
                  </div>
                </section>
              )}

              {step === 'payment' && (
                <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <CreditCard size={20} />
                    </div>
                    <h2 className="text-xl font-bold font-display">
                      Payment Method
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {(['CARD', 'UPI', 'COD'] as const).map((provider) => (
                      <label
                        key={provider}
                        className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all ${
                          paymentProvider === provider
                            ? 'border-primary bg-primary/5 shadow-lg'
                            : 'border-white/10 bg-white/[0.01] hover:border-white/20'
                        }`}
                        onClick={() => setPaymentProvider(provider)}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentProvider === provider}
                            onChange={() => setPaymentProvider(provider)}
                            className="w-4 h-4 text-primary bg-transparent border-white/20 focus:ring-primary focus:ring-offset-gray-900"
                          />
                          <span className="font-bold text-white tracking-wide">
                            {provider === 'CARD'
                              ? 'Credit / Debit Card'
                              : provider === 'UPI'
                                ? 'UPI (GPay, PhonePe, Paytm)'
                                : 'Cash on Delivery'}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-white/5">
                    <button
                      onClick={() =>
                        orderType === 'DELIVERY'
                          ? setStep('coupon')
                          : navigate('/cart')
                      }
                      className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      Back
                    </button>
                    <Button
                      variant="primary"
                      className="h-14 px-10 font-bold shadow-lg shadow-primary/20 text-base"
                      onClick={handlePlaceOrder}
                    >
                      Pay ₹{total.toFixed(0)} & Place Order
                    </Button>
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Summary */}
            <div className="lg:col-span-5 sticky top-24">
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="text-xl font-bold font-display text-white border-b border-white/5 pb-4 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-primary" /> Order
                  Details
                </h3>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded text-neutral-300 shrink-0">
                          {item.quantity}x
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white line-clamp-1">
                            {item.product.name}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-neutral-500">
                              {item.variant.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white shrink-0">
                        ₹{(parseFloat(item.price) * item.quantity).toFixed(0)}
                      </p>
                    </div>
                  ))}

                  {/* Birthday Special Cake */}
                  {isBirthdayApplied && (
                    <div className="flex justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded text-neutral-300 shrink-0">
                          1x
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white line-clamp-1 flex items-center gap-1.5">
                            <span>Celebration Cake</span>
                            <span className="text-[9px] bg-primary/20 text-primary border border-primary/20 px-1 py-0.5 rounded">
                              Free
                            </span>
                          </p>
                          <p className="text-xs text-neutral-500 font-medium">
                            Birthday Special
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-emerald-400 shrink-0">
                        ₹0
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-6 border-t border-white/5 text-sm">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span className="text-white">₹{subtotal.toFixed(0)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Discount (Coupon)</span>
                      <span>-₹{discountAmount.toFixed(0)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-400">
                    <span>Taxes (5% GST)</span>
                    <span className="text-white">₹{taxAmount.toFixed(0)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-400">
                    <span>Delivery Fee</span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-bold">FREE</span>
                    ) : (
                      <span className="text-white">
                        ₹{deliveryFee.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-5 mt-5 flex justify-between items-end">
                  <div>
                    <span className="text-sm text-neutral-400 block mb-1">
                      Total to pay
                    </span>
                    <span className="text-3xl font-bold font-display text-primary">
                      ₹{total.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
