import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import EmptyState from '../../../shared/components/ui/EmptyState';
import { useToast } from '../../../shared/components/ui/Toast';
import { useCart, useAddresses, useValidateCoupon, type Address } from '../store/cartQueries';
import { useAppSelector } from '../../../app/store';
import { Tag, MapPin, CreditCard, CheckCircle2 } from 'lucide-react';

type CheckoutStep = 'address' | 'coupon' | 'payment';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: cart, isLoading } = useCart(isAuthenticated);
  const { data: addresses = [] } = useAddresses(isAuthenticated);
  const validateCoupon = useValidateCoupon();

  const [step, setStep] = useState<CheckoutStep>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentProvider, setPaymentProvider] = useState<'STRIPE'>('STRIPE');

  if (!isAuthenticated) {
    navigate('/login', { state: { from: { pathname: '/checkout' } } });
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <EmptyState
          type="orders"
          title="Nothing to checkout"
          description="Add items to your cart first."
          actionLabel="View Cart"
          onAction={() => navigate('/cart')}
        />
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  );
  const total = Math.max(0, subtotal - discountAmount);
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode.trim(),
        orderAmount: subtotal,
      });
      setDiscountAmount(result.discountAmount);
      toast.success(`Coupon applied: -$${result.discountAmount.toFixed(2)}`);
      setStep('payment');
    } catch {
      toast.error('Invalid or expired coupon');
    }
  };

  const handlePlaceOrder = () => {
    toast.info(
      `Payment via ${paymentProvider} will be enabled in the next release. Order draft API is pending.`,
    );
  };

  return (
    <>
      <SEO title="Checkout" description="Complete your ABC order." />
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <h1 className="text-2xl font-display font-bold text-white">Checkout</h1>

        <div className="flex gap-2 text-xs font-semibold uppercase tracking-wider">
          {(['address', 'coupon', 'payment'] as CheckoutStep[]).map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              className={`px-3 py-1.5 rounded-full border ${
                step === s
                  ? 'bg-primary text-white border-primary'
                  : 'border-border/60 text-muted-foreground'
              }`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 'address' && (
              <section className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  Delivery Address
                </h2>
                {addresses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No saved addresses.{' '}
                    <Link to="/addresses" className="text-primary hover:underline">
                      Add an address
                    </Link>
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {addresses.map((addr: Address) => (
                      <li key={addr.id}>
                        <label className="flex items-start gap-3 p-3 rounded-lg border border-border/50 cursor-pointer hover:border-primary/40">
                          <input
                            type="radio"
                            name="address"
                            checked={(selectedAddressId || defaultAddress?.id) === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1"
                          />
                          <span className="text-sm">
                            <strong className="text-white">{addr.fullName}</strong>
                            <br />
                            {addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
                <Button variant="outline" onClick={() => setStep('coupon')}>
                  Continue
                </Button>
              </section>
            )}

            {step === 'coupon' && (
              <section className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Tag size={18} className="text-primary" />
                  Apply Coupon
                </h2>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1"
                  />
                  <Button
                    variant="primary"
                    onClick={handleApplyCoupon}
                    isLoading={validateCoupon.isPending}
                  >
                    Apply
                  </Button>
                </div>
                <Button variant="ghost" onClick={() => setStep('payment')}>
                  Skip coupon
                </Button>
              </section>
            )}

            {step === 'payment' && (
              <section className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <CreditCard size={18} className="text-primary" />
                  Payment Method
                </h2>
                <div className="flex gap-3">
                  {(['STRIPE'] as const).map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => setPaymentProvider(provider)}
                      className={`flex-1 py-3 rounded-lg border text-sm font-semibold ${
                        paymentProvider === provider
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/60 text-muted-foreground'
                      }`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Payment gateway integration is scaffolded on the backend. Webhook handlers will
                  confirm orders once PR-007 payment module ships.
                </p>
                <Button variant="primary" size="lg" onClick={handlePlaceOrder}>
                  Place Order (${total.toFixed(2)})
                </Button>
              </section>
            )}
          </div>

          <aside className="glass-card p-6 rounded-xl border border-white/5 h-fit space-y-3">
            <h3 className="font-semibold text-white">Order Summary</h3>
            <p className="text-sm flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </p>
            <p className="text-sm flex justify-between text-success">
              <span>Discount</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </p>
            <p className="text-lg flex justify-between font-bold text-primary border-t border-border/40 pt-3">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </p>
            {discountAmount > 0 && (
              <p className="text-xs text-success flex items-center gap-1">
                <CheckCircle2 size={14} />
                Coupon applied
              </p>
            )}
          </aside>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
