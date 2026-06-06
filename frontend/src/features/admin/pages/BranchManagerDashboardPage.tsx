import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
  startShift,
  endShift,
  checkoutPOS,
  processPayment,
  setOrderType,
  addToCart,
  removeFromCart,
  clearCart,
  updateQuantity
} from '../../pos/store/posSlice';
import { fetchCategories, fetchProducts } from '../../menu/store/menuSlice';
import {
  fetchBranchReservations,
  updateReservationStatus
} from '../../reservations/store/reservationSlice';
import apiClient from '../../../services/apiClient';
import { Card, CardHeader, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Badge } from '../../../shared/components/ui/Badge';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  Store,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Banknote,
  CreditCard,
  Users,
  Clock,
  PlusCircle,
  ClipboardList,
  Building,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Branch {
  id: string;
  name: string;
  city: string;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

interface ReplenishmentItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export default function BranchManagerDashboardPage() {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { terminals, activeDrawer, cart, activeOrder } = useAppSelector((state) => state.pos);
  const { categories, products } = useAppSelector((state) => state.menu);
  const { reservations } = useAppSelector((state) => state.reservations);

  // local component states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openingAmount, setOpeningAmount] = useState<number>(5000);
  const [closingAmount, setClosingAmount] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);

  // Replenishment Form states
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  const [reqQuantity, setReqQuantity] = useState<number>(10);
  const [replenishmentList, setReplenishmentList] = useState<ReplenishmentItem[]>([]);
  const [replenishmentNotes, setReplenishmentNotes] = useState<string>('');

  // fetch branch lists and ingredients
  const initConsole = async () => {
    try {
      const [branchRes, ingredientRes] = await Promise.all([
        apiClient.get('/catalog/branches'),
        apiClient.get('/api/v1/inventory/ingredients')
      ]);

      const fetchedBranches = branchRes.data.data.branches || [];
      setBranches(fetchedBranches);
      if (fetchedBranches.length > 0) {
        setSelectedBranchId(fetchedBranches[0].id);
      }

      setAllIngredients(ingredientRes.data.data.ingredients || []);
    } catch (err) {
      console.error('Failed to initialize branch manager console:', err);
    }
  };

  useEffect(() => {
    initConsole();
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  // fetch branch specific reservations
  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchBranchReservations(selectedBranchId));
    }
  }, [selectedBranchId, dispatch]);

  const handleStartShift = () => {
    // start shift with a default or main register
    dispatch(startShift({ terminalId: 'demo-terminal-id', openingAmount }))
      .unwrap()
      .then(() => {
        toast.success(`Cash register successfully opened with ₹${openingAmount}`);
      })
      .catch((err) => {
        toast.error(err.message || 'Could not open shift.');
      });
  };

  const handleEndShift = () => {
    if (!activeDrawer) return;
    dispatch(
      endShift({
        drawerId: activeDrawer.id,
        closingAmount,
        notes: closingNotes
      })
    )
      .unwrap()
      .then(() => {
        toast.success('Cash drawer successfully balanced and shift closed.');
        setShowCloseModal(false);
        setClosingNotes('');
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to close shift.');
      });
  };

  const handlePOSCheckout = () => {
    if (cart.items.length === 0) return;
    // mock active terminal id
    const payload = {
      terminalId: 'demo-terminal-id',
      orderType: cart.orderType,
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      discount: cart.discount
    };

    apiClient
      .post('/pos/orders', payload)
      .then((res) => {
        dispatch(checkoutPOS.fulfilled(res.data.data, '', {}));
        toast.success(`POS Order successfully created. Amount: ₹${cart.total.toFixed(2)}`);
      })
      .catch((err) => {
        toast.error(err.response?.data?.error?.message || 'Failed to checkout POS order.');
      });
  };

  const handlePOSPayment = (method: 'CASH' | 'CARD') => {
    if (!activeOrder) return;
    dispatch(
      processPayment({
        posOrderId: activeOrder.id,
        payments: [{ method, amount: activeOrder.order.totalAmount }]
      })
    )
      .unwrap()
      .then(() => {
        toast.success(`Order successfully paid via ${method}. KDS ticket routed.`);
        dispatch(clearCart());
      })
      .catch((err) => {
        toast.error(err.message || 'Payment processing failed.');
      });
  };

  const handleAddReplenishmentItem = () => {
    if (!selectedIngredientId) return;
    const ing = allIngredients.find((i) => i.id === selectedIngredientId);
    if (!ing) return;

    if (replenishmentList.find((item) => item.ingredientId === selectedIngredientId)) {
      toast.warning('This ingredient is already in the replenishment list.');
      return;
    }

    setReplenishmentList([
      ...replenishmentList,
      {
        ingredientId: selectedIngredientId,
        ingredientName: ing.name,
        quantity: reqQuantity,
        unit: ing.unit
      }
    ]);
    setSelectedIngredientId('');
  };

  const handleRemoveReplenishmentItem = (index: number) => {
    const list = [...replenishmentList];
    list.splice(index, 1);
    setReplenishmentList(list);
  };

  const handleSubmitReplenishment = async () => {
    if (replenishmentList.length === 0) return;
    try {
      const payload = {
        branchId: selectedBranchId,
        notes: replenishmentNotes,
        items: replenishmentList.map((item) => ({
          ingredientId: item.ingredientId,
          requestedQuantity: item.quantity
        }))
      };

      await apiClient.post('/api/v1/inventory/requests', payload);
      toast.success('Inventory request successfully submitted to Organization Owner for approval.');
      setReplenishmentList([]);
      setReplenishmentNotes('');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Could not submit replenishment request.');
    }
  };

  const handleUpdateReservation = (resId: string, status: string) => {
    dispatch(updateReservationStatus({ id: resId, status }))
      .unwrap()
      .then(() => {
        toast.success(`Reservation status successfully marked as ${status}.`);
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to update reservation.');
      });
  };

  const filteredProducts = products.filter((p: any) => {
    const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 p-6 text-white bg-slate-950 min-h-screen">
      {/* Header and Branch Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/20 pb-5">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Branch Operations Console
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-sans">
            Unified dashboard for walk-in POS billing, shift drawer balance, reservations, and inventory requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-border/20 rounded-xl px-3 py-1.5">
            <Building size={16} className="text-primary" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.name.replace('Oven Xpress - ', '')}
                </option>
              ))}
            </select>
          </div>
          {activeDrawer && (
            <Badge variant="success" className="h-8 font-semibold">
              Drawer Open
            </Badge>
          )}
        </div>
      </div>

      {/* Main Console Split */}
      {!activeDrawer ? (
        /* Drawer Shift Start Form */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto py-12"
        >
          <Card className="border-border/40 bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 space-y-6">
            <div className="text-center">
              <Store className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white font-display">Start Operations Shift</h2>
              <p className="text-slate-400 text-sm mt-2 font-sans">
                Open the branch cash register drawer to begin walk-in orders.
              </p>
            </div>
            <div className="space-y-4 font-sans">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Opening Balance (₹)</label>
                <Input
                  type="number"
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(parseFloat(e.target.value) || 0)}
                  className="bg-slate-950 border-border/30 text-white"
                />
              </div>
              <Button onClick={handleStartShift} className="w-full h-12 text-base font-bold bg-primary text-white hover:bg-primary-hover">
                Open Cash Drawer Shift
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        /* Main Interactive Layout Grid */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* POS Catalog & Walk-in Terminal - Col 7 */}
          <div className="xl:col-span-8 space-y-6">
            {/* Catalog Grid */}
            <Card className="border-border/40 bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 overflow-hidden flex flex-col h-[620px]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/20 shrink-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold font-display">POS Billing Grid</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search menu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950/80 border border-border/20 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary w-48"
                    />
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                  <Badge
                    variant={activeCategory === 'all' ? 'info' : 'neutral'}
                    className="cursor-pointer text-xs px-3 py-1.5 font-medium whitespace-nowrap"
                    onClick={() => setActiveCategory('all')}
                  >
                    All Items
                  </Badge>
                  {categories.map((cat: any) => (
                    <Badge
                      key={cat.id}
                      variant={activeCategory === cat.id ? 'info' : 'neutral'}
                      className="cursor-pointer text-xs px-3 py-1.5 font-medium whitespace-nowrap"
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="flex-1 overflow-y-auto pt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
                {filteredProducts.map((product: any) => (
                  <div
                    key={product.id}
                    onClick={() =>
                      dispatch(
                        addToCart({
                          productId: product.id,
                          quantity: 1,
                          name: product.name,
                          price: product.basePrice
                        })
                      )
                    }
                    className="glass-card bg-slate-900/40 p-4 rounded-xl border border-border/20 cursor-pointer flex flex-col justify-between items-center text-center group hover:border-primary/40"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 mb-3 group-hover:bg-primary/20">
                      <Store className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 line-clamp-2 leading-tight">
                      {product.name}
                    </span>
                    <span className="text-sm font-bold text-primary mt-2">
                      ₹{Number(product.basePrice).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Reservations Grid & Waitlist */}
            <Card className="border-border/40 bg-slate-900/40 backdrop-blur-md rounded-2xl p-5">
              <CardHeader className="border-none p-0 mb-4 flex flex-row items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold font-display">Branch Reservations Grid</h3>
                  <p className="text-xs text-slate-400 font-sans">Active tables bookings status</p>
                </div>
                <Users className="text-slate-400 w-5 h-5" />
              </CardHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservations.length === 0 ? (
                  <p className="text-slate-500 text-xs py-4 col-span-2 text-center">No reservations booked.</p>
                ) : (
                  reservations.map((res: any) => (
                    <div
                      key={res.id}
                      className="p-4 bg-slate-950/60 rounded-xl border border-border/20 flex flex-col justify-between gap-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm text-slate-200">
                            {res.customer?.firstName} {res.customer?.lastName}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Clock size={12} /> {res.reservationDate} at {res.reservationTime}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">Guests: {res.guestCount}</p>
                        </div>
                        <Badge
                          variant={
                            res.status === 'PENDING'
                              ? 'warning'
                              : res.status === 'CONFIRMED'
                              ? 'success'
                              : 'neutral'
                          }
                          className="text-[10px]"
                        >
                          {res.status}
                        </Badge>
                      </div>
                      <div className="flex justify-end gap-2 border-t border-border/10 pt-3">
                        {res.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateReservation(res.id, 'CONFIRMED')}
                            className="bg-green-600 text-white text-xs px-2.5 py-1 hover:bg-green-700"
                          >
                            Confirm
                          </Button>
                        )}
                        {res.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateReservation(res.id, 'CHECKED_IN')}
                            className="bg-blue-600 text-white text-xs px-2.5 py-1 hover:bg-blue-700"
                          >
                            Check In
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Active POS Billing Cart & Replenishment Form - Col 5 */}
          <div className="xl:col-span-4 space-y-6">
            {/* Active Drawer & Shift Tracker */}
            <Card className="border-border/40 bg-slate-900/40 backdrop-blur-md rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Active Shift Log</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Terminal ID: Main Register (Demo)
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setClosingAmount(openingAmount);
                    setShowCloseModal(true);
                  }}
                  className="bg-rose-500/20 text-rose-500 border border-rose-500/30 hover:bg-rose-500/30 text-xs px-3"
                >
                  Close Shift
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-sans text-slate-400 bg-slate-950/60 p-3 rounded-xl">
                <div>
                  <p>Opening Balance</p>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">₹{openingAmount}</p>
                </div>
                <div>
                  <p>Shift Status</p>
                  <p className="text-sm font-bold text-green-500 mt-0.5">Active / Open</p>
                </div>
              </div>
            </Card>

            {/* POS Billing Cart */}
            <Card className="border-border/40 bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 flex flex-col h-[520px]">
              <div className="border-b border-border/20 pb-3 flex items-center justify-between shrink-0">
                <h3 className="text-base font-bold font-display">Active Order Cart</h3>
                <div className="flex gap-1 bg-slate-950/60 p-0.5 rounded-lg border border-border/10">
                  {(['WALK_IN', 'DINE_IN', 'TAKEAWAY'] as const).map((type) => (
                    <button
                      key={type}
                      className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-colors ${
                        cart.orderType === type
                          ? 'bg-primary text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      onClick={() => dispatch(setOrderType(type))}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {cart.items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                    <ShoppingCart className="w-10 h-10 opacity-20" />
                    <p className="text-xs">Cart is currently empty</p>
                  </div>
                ) : (
                  cart.items.map((item: any) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-border/25 gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-slate-200 block truncate">
                          {item.name}
                        </span>
                        <span className="text-xs font-bold text-primary mt-1 block">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-border/10">
                        <button
                          className="p-1 text-slate-400 hover:text-white"
                          onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-white text-xs w-4 text-center font-bold">
                          {item.quantity}
                        </span>
                        <button
                          className="p-1 text-slate-400 hover:text-white"
                          onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* POS Totals and Checkout actions */}
              <div className="border-t border-border/20 pt-3 shrink-0 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-400 font-sans">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (5%)</span>
                    <span>₹{cart.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-sm pt-1.5 border-t border-border/10">
                    <span>Total</span>
                    <span className="text-primary text-base">₹{cart.total.toFixed(2)}</span>
                  </div>
                </div>

                {!activeOrder ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-border bg-slate-900 text-slate-100 hover:bg-slate-800 px-3"
                      onClick={() => dispatch(clearCart())}
                    >
                      <Trash2 size={16} className="text-rose-500" />
                    </Button>
                    <Button
                      onClick={handlePOSCheckout}
                      disabled={cart.items.length === 0}
                      className="flex-1 bg-primary text-white hover:bg-primary-hover font-bold text-sm py-2.5 rounded-xl"
                    >
                      Place Order
                    </Button>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-3 rounded-xl border border-primary/20 space-y-3">
                    <p className="text-center text-[11px] font-bold text-green-500">
                      Checkout successful! Select Payment Method:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handlePOSPayment('CASH')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 text-xs py-2"
                      >
                        <Banknote size={14} /> Cash Checkout
                      </Button>
                      <Button
                        onClick={() => handlePOSPayment('CARD')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 text-xs py-2"
                      >
                        <CreditCard size={14} /> Card Checkout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Replenishment Stock Request Form */}
            <Card className="border-border/40 bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 space-y-4">
              <CardHeader className="border-none p-0 flex flex-row items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-display">Replenishment Request</h3>
                  <p className="text-xs text-slate-400 font-sans">Submit stock requirements to owner</p>
                </div>
                <ClipboardList className="text-slate-400 w-5 h-5" />
              </CardHeader>

              {/* Replenishment Item list */}
              {replenishmentList.length > 0 && (
                <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-border/10 max-h-40 overflow-y-auto">
                  {replenishmentList.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs border-b border-border/10 pb-1.5 last:border-b-0 last:pb-0">
                      <span>
                        {item.ingredientName} ({item.quantity} {item.unit})
                      </span>
                      <button
                        onClick={() => handleRemoveReplenishmentItem(idx)}
                        className="text-rose-500 hover:text-rose-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Stock Input Form */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <select
                    value={selectedIngredientId}
                    onChange={(e) => setSelectedIngredientId(e.target.value)}
                    className="w-full bg-slate-950 border border-border/30 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">-- Add Ingredient --</option>
                    {allIngredients.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    value={reqQuantity}
                    onChange={(e) => setReqQuantity(parseFloat(e.target.value) || 1)}
                    className="bg-slate-950 border-border/30 text-center py-2 text-xs"
                  />
                </div>
                <Button
                  onClick={handleAddReplenishmentItem}
                  className="bg-slate-800 hover:bg-slate-700 text-white p-2 border border-border/20 rounded-xl"
                >
                  <PlusCircle size={16} />
                </Button>
              </div>

              {/* Notes and Submit */}
              <div className="space-y-2">
                <textarea
                  value={replenishmentNotes}
                  onChange={(e) => setReplenishmentNotes(e.target.value)}
                  placeholder="Additional request notes (e.g. urgent restock)..."
                  className="w-full h-14 bg-slate-950 border border-border/20 rounded-xl p-2 text-xs text-slate-300 focus:outline-none focus:border-primary font-sans"
                />
                <Button
                  onClick={handleSubmitReplenishment}
                  disabled={replenishmentList.length === 0}
                  className="w-full bg-primary hover:bg-primary-hover text-white text-xs py-2 font-bold rounded-xl"
                >
                  Submit Replenishment Request
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-border/40 max-w-sm w-full rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-lg font-bold font-display">Close Register Shift</h3>
            <p className="text-xs text-slate-400 font-sans">
              Verify actual cash drawer balance before locking shift drawer.
            </p>
            <div className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">Closing Amount (₹)</label>
                <Input
                  type="number"
                  value={closingAmount}
                  onChange={(e) => setClosingAmount(parseFloat(e.target.value) || 0)}
                  className="bg-slate-950 border-border/20 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Shift Drawer Remarks</label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Notes (optional)..."
                  className="w-full h-16 bg-slate-950 border border-border/20 rounded-xl p-2 text-xs text-slate-300 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-3">
              <Button
                variant="outline"
                onClick={() => setShowCloseModal(false)}
                className="bg-slate-800 hover:bg-slate-700 border-none text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEndShift}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Confirm Shift Closure
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
