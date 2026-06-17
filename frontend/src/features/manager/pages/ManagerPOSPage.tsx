import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Banknote,
  CreditCard,
  Search,
  Lock,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import apiClient from '../../../services/apiClient';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import { fetchCategories, fetchProducts } from '../../menu/store/menuSlice';
import {
  startShift,
  endShift,
  checkoutPOS,
  processPayment,
  setOrderType,
  addToCart,
  clearCart,
  updateQuantity,
} from '../../pos/store/posSlice';

export default function ManagerPOSPage() {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { activeDrawer, cart, activeOrder } = useAppSelector(
    (state) => state.pos
  );
  const { categories, products } = useAppSelector((state) => state.menu);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Shift Management States
  const [openingAmount, setOpeningAmount] = useState<number>(5000);
  const [closingAmount, setClosingAmount] = useState<number>(0);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleStartShift = () => {
    dispatch(startShift({ terminalId: 'manager-terminal', openingAmount }))
      .unwrap()
      .then(() => toast.success(`Register opened with ₹${openingAmount}`))
      .catch((err) => toast.error(err.message || 'Could not open shift.'));
  };

  const handleEndShift = () => {
    if (!activeDrawer) return;
    dispatch(
      endShift({
        drawerId: activeDrawer.id,
        closingAmount,
        notes: 'Manager shift close',
      })
    )
      .unwrap()
      .then(() => {
        toast.success('Register balanced and closed.');
        setShowCloseModal(false);
      })
      .catch((err) => toast.error(err.message || 'Failed to close shift.'));
  };

  const handlePOSCheckout = () => {
    if (cart.items.length === 0) return;
    const payload = {
      terminalId: 'manager-terminal',
      orderType: cart.orderType,
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      discount: cart.discount,
    };

    apiClient
      .post('/pos/orders', payload)
      .then((res) => {
        dispatch(checkoutPOS.fulfilled(res.data.data, '', {}));
        toast.success(`Order created. Amount: ₹${cart.total.toFixed(2)}`);
      })
      .catch((err) => {
        toast.error(err.response?.data?.error?.message || 'Checkout failed.');
      });
  };

  const handlePOSPayment = (method: 'CASH' | 'CARD') => {
    if (!activeOrder) return;
    dispatch(
      processPayment({
        posOrderId: activeOrder.id,
        payments: [{ method, amount: activeOrder.order.totalAmount }],
      })
    )
      .unwrap()
      .then(() => {
        toast.success(`Payment via ${method} successful. Receipt printed.`);
        dispatch(clearCart());
      })
      .catch((err) => toast.error(err.message || 'Payment failed.'));
  };

  const filteredProducts = products.filter((p: any) => {
    const matchesCategory =
      activeCategory === 'all' || p.categoryId === activeCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!activeDrawer) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 border-border/20 bg-slate-900/60 backdrop-blur-xl rounded-2xl text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20">
              <Lock className="w-10 h-10 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-display">
                Register Closed
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Open a new shift to access the POS terminal.
              </p>
            </div>
            <div className="space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">
                  Opening Float (₹)
                </label>
                <Input
                  type="number"
                  value={openingAmount}
                  onChange={(e) =>
                    setOpeningAmount(parseFloat(e.target.value) || 0)
                  }
                  className="mt-1 bg-slate-950 border-border/30 text-white py-6 text-lg text-center font-mono"
                />
              </div>
              <Button
                onClick={handleStartShift}
                className="w-full h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20"
              >
                Open Register
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left: Product Catalog */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/30 rounded-2xl border border-border/10 overflow-hidden">
        {/* Top Filter Bar */}
        <div className="p-4 border-b border-border/20 bg-slate-900/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-border/20 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            <Badge
              variant={activeCategory === 'all' ? 'info' : 'neutral'}
              className="cursor-pointer px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap"
              onClick={() => setActiveCategory('all')}
            >
              All
            </Badge>
            {categories.map((cat: any) => (
              <Badge
                key={cat.id}
                variant={activeCategory === cat.id ? 'info' : 'neutral'}
                className="cursor-pointer px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap"
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product: any) => (
              <div
                key={product.id}
                onClick={() =>
                  dispatch(
                    addToCart({
                      productId: product.id,
                      quantity: 1,
                      name: product.name,
                      price: product.basePrice,
                    })
                  )
                }
                className="bg-slate-900 border border-border/10 rounded-xl p-4 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center text-center h-32 group"
              >
                <h3 className="text-sm font-semibold text-slate-200 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
                  {product.name}
                </h3>
                <span className="text-sm font-bold text-slate-400 mt-2 font-mono">
                  ₹{Number(product.basePrice).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Active Cart */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-900/40 rounded-2xl border border-border/10 overflow-hidden shrink-0">
        {/* Cart Header */}
        <div className="p-4 border-b border-border/20 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <h2 className="font-display font-bold text-lg text-white">
            Current Order
          </h2>
          <div className="flex bg-slate-950 rounded-lg p-1 border border-border/10">
            {(['WALK_IN', 'DINE_IN', 'TAKEAWAY'] as const).map((type) => (
              <button
                key={type}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-colors ${
                  cart.orderType === type
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                onClick={() => dispatch(setOrderType(type))}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
              <ShoppingCart className="w-12 h-12 mb-4" />
              <p className="text-sm font-semibold">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {cart.items.map((item: any) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-border/5"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-sm font-semibold text-slate-200 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-indigo-400 font-mono mt-0.5">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-border/10">
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId: item.productId,
                              quantity: item.quantity - 1,
                            })
                          )
                        }
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-6 text-center text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId: item.productId,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Totals & Checkout Actions */}
        <div className="p-4 border-t border-border/20 bg-slate-900/80 backdrop-blur-md shrink-0 space-y-4">
          <div className="space-y-2 text-sm font-sans">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono">
                ₹
                {cart.subtotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tax (5%)</span>
              <span className="font-mono">
                ₹
                {cart.tax.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-border/10">
              <span>Total</span>
              <span className="font-mono text-indigo-400">
                ₹
                {cart.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {!activeOrder ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="px-4 border-border/20 hover:bg-rose-500/10 text-rose-500 hover:text-rose-400 hover:border-rose-500/30"
                onClick={() => dispatch(clearCart())}
              >
                <Trash2 size={18} />
              </Button>
              <Button
                onClick={handlePOSCheckout}
                disabled={cart.items.length === 0}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-indigo-500/20"
              >
                Charge ₹
                {cart.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 bg-slate-950 p-4 rounded-xl border border-indigo-500/30"
            >
              <p className="text-center text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Select Payment
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handlePOSPayment('CASH')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 py-4"
                >
                  <Banknote size={16} /> Cash
                </Button>
                <Button
                  onClick={() => handlePOSPayment('CARD')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 py-4"
                >
                  <CreditCard size={16} /> Card
                </Button>
              </div>
            </motion.div>
          )}

          {/* Shift Close Trigger */}
          <div className="pt-2 border-t border-border/10 flex justify-end">
            <button
              onClick={() => {
                setClosingAmount(openingAmount);
                setShowCloseModal(true);
              }}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-400 uppercase tracking-wider transition-colors"
            >
              Close Register
            </button>
          </div>
        </div>
      </div>

      {/* Close Shift Modal */}
      <AnimatePresence>
        {showCloseModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-border/20 max-w-sm w-full rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white font-display">
                Close Register
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Count the physical drawer and verify total.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    Closing Cash (₹)
                  </label>
                  <Input
                    type="number"
                    value={closingAmount}
                    onChange={(e) =>
                      setClosingAmount(parseFloat(e.target.value) || 0)
                    }
                    className="mt-1 bg-slate-950 border-border/30 text-white font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowCloseModal(false)}
                  className="border-none text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEndShift}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Lock Register
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
