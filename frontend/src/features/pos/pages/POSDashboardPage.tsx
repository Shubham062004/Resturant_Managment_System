import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
  startShift,
  checkoutPOS,
  processPayment,
  setOrderType,
  addToCart,
  clearCart,
} from '../store/posSlice';
import { fetchCategories, fetchProducts } from '../../menu/store/menuSlice';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import {
  ShoppingCart,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Coffee,
  Trash2,
  Store,
  Printer,
  History,
  QrCode
} from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge';
import { Alert } from '../../../shared/components/ui/Alert';

export default function POSDashboardPage() {
  const dispatch = useAppDispatch();
  const { terminals, activeDrawer, cart, activeOrder, receipts, status } = useAppSelector(
    (state) => state.pos,
  );
  const { categories, products } = useAppSelector((state) => state.menu);

  // Local UI States
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTerminal, setSelectedTerminal] = useState<string>('');
  const [openingAmount, setOpeningAmount] = useState<number>(100);
  const [viewTab, setViewTab] = useState<'register' | 'history'>('register');

  // Checkout / Payment UI States
  const [upiReference, setUpiReference] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printedReceipt, setPrintedReceipt] = useState<any | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleStartShift = () => {
    if (selectedTerminal) {
      dispatch(startShift({ terminalId: selectedTerminal, openingAmount }));
    }
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;
    try {
      await dispatch(checkoutPOS({})).unwrap();
      setAlertMsg({ type: 'success', text: 'POS Invoice draft created. Process payment below.' });
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Checkout failed.' });
    }
  };

  const handlePayment = async (method: 'CASH' | 'UPI' | 'CARD') => {
    if (!activeOrder) return;
    if (method === 'UPI' && !upiReference) {
      setAlertMsg({ type: 'error', text: 'Please enter the UPI transaction reference number.' });
      return;
    }

    try {
      const result = await dispatch(
        processPayment({
          posOrderId: activeOrder.id,
          payments: [
            {
              method,
              amount: activeOrder.order.totalAmount,
              reference: method === 'UPI' ? upiReference : undefined,
            },
          ],
        })
      ).unwrap();

      if (result.status === 'PAID' || result.order?.status === 'PAID' || result.state?.status === 'PAID') {
        setAlertMsg({ type: 'success', text: 'Payment completed successfully. Order closed.' });
        // Set receipt content to print
        setPrintedReceipt(activeOrder);
        setShowPrintModal(true);
        setUpiReference('');
      } else {
        setAlertMsg({ type: 'success', text: 'Payment received. Awaiting full completion.' });
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Payment processing failed.' });
    }
  };

  const triggerPrintReceipt = () => {
    window.print();
  };

  if (!activeDrawer) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6 animate-fade-in text-slate-100">
        <div className="text-center">
          <Store className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Start POS Shift</h2>
          <p className="text-slate-400 mt-2">
            Open the cash drawer terminal registry to begin walk-in register checkout operations.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Select Terminal Register
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 transition-colors"
              value={selectedTerminal}
              onChange={(e) => setSelectedTerminal(e.target.value)}
            >
              <option value="">-- Choose Terminal --</option>
              {terminals.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.terminalName}
                </option>
              ))}
              <option value="demo-terminal-id">Main Register #1 (Auto-Fallback)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Opening Cash Balance ($)
            </label>
            <Input
              id="opening-cash-amount"
              type="number"
              className="w-full bg-slate-950 border border-slate-800 text-white"
              value={openingAmount}
              onChange={(e) => setOpeningAmount(Number(e.target.value))}
            />
          </div>
          <Button
            onClick={handleStartShift}
            className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg"
            disabled={!selectedTerminal}
          >
            Open POS Register
          </Button>
        </div>
      </div>
    );
  }

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p: any) => p.categoryId === activeCategory);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4 p-4 text-slate-100 max-w-7xl mx-auto">
      
      {/* Dynamic Print CSS Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-receipt-content, #print-receipt-content * {
            visibility: visible !important;
          }
          #print-receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px !important;
          }
        }
      `}</style>

      {/* POS Header Actions */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-white">Cashier Checkout Point</h1>
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setViewTab('register')}
              className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 ${viewTab === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Store className="w-3.5 h-3.5" /> Terminal Register
            </button>
            <button
              onClick={() => setViewTab('history')}
              className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 ${viewTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <History className="w-3.5 h-3.5" /> Shift Payout History
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info" className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            REGISTER ACTIVE: #{activeDrawer.terminalId?.slice(0, 6) || 'Main Register'}
          </Badge>
        </div>
      </div>

      {alertMsg && (
        <div className="relative mb-1">
          <Alert
            variant={alertMsg.type === 'success' ? 'success' : 'error'}
            className="pr-10"
          >
            {alertMsg.text}
          </Alert>
          <button
            onClick={() => setAlertMsg(null)}
            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {viewTab === 'register' ? (
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left Column: Menu Items Grid */}
          <div className="flex-1 flex flex-col bg-slate-900/50 rounded-xl border border-slate-850 overflow-hidden">
            
            {/* Category selection */}
            <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex gap-2 overflow-x-auto hide-scrollbar">
              <Badge
                variant={activeCategory === 'all' ? 'info' : 'neutral'}
                className="cursor-pointer whitespace-nowrap px-4 py-2 uppercase text-xs tracking-wider"
                onClick={() => setActiveCategory('all')}
              >
                All Menu Items
              </Badge>
              {categories.map((cat: any) => (
                <Badge
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'info' : 'neutral'}
                  className="cursor-pointer whitespace-nowrap px-4 py-2 uppercase text-xs tracking-wider"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>

            {/* Product Cards */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 content-start">
              {filteredProducts.map((product: any) => (
                <Card
                  key={product.id}
                  className="bg-slate-950/40 border-slate-800 hover:border-indigo-500/40 cursor-pointer transition p-3.5 flex flex-col justify-between"
                  onClick={() =>
                    dispatch(
                      addToCart({
                        productId: product.id,
                        quantity: 1,
                        name: product.name,
                        price: parseFloat(product.basePrice),
                      }),
                    )
                  }
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="bg-slate-900 p-2.5 rounded-full text-indigo-400">
                      <Coffee className="w-5 h-5" />
                    </div>
                    <h3 className="text-white text-xs font-semibold leading-tight line-clamp-2 min-h-[32px]">
                      {product.name}
                    </h3>
                    <p className="text-indigo-400 font-mono text-sm font-bold">${parseFloat(product.basePrice).toFixed(2)}</p>
                  </div>
                </Card>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500">No items available under this category.</div>
              )}
            </div>
          </div>

          {/* Right Column: Checkout Cart Panel */}
          <div className="w-[380px] flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shrink-0">
            {/* Order types selector */}
            <div className="p-3 bg-slate-950/40 border-b border-slate-850 grid grid-cols-3 gap-2">
              {(['WALK_IN', 'DINE_IN', 'TAKEAWAY'] as const).map((type) => (
                <button
                  key={type}
                  className={`py-2 rounded text-[10px] uppercase tracking-wider font-extrabold transition ${
                    cart.orderType === type
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                  onClick={() => dispatch(setOrderType(type))}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Cart item listing */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                  <ShoppingCart className="w-10 h-10 opacity-30" />
                  <p className="text-xs uppercase tracking-wider font-bold">Register Order Empty</p>
                </div>
              ) : (
                cart.items.map((item: any) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between bg-slate-950/40 p-3 rounded border border-slate-850"
                  >
                    <div className="flex-1 pr-2">
                      <h4 className="text-slate-200 font-semibold text-xs truncate">{item.name}</h4>
                      <p className="text-indigo-400 text-xs font-mono font-bold mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 rounded p-1">
                      <button
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        onClick={() => dispatch(addToCart({ ...item, quantity: -1 }))}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-white text-xs font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Price Calculations */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-850 space-y-4">
              <div className="space-y-1.5 text-xs text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Gross Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST + CGST (5%)</span>
                  <span>${cart.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-slate-850">
                  <span>Net Payout</span>
                  <span className="text-indigo-400">${cart.total.toFixed(2)}</span>
                </div>
              </div>

              {!activeOrder ? (
                <div className="flex gap-2">
                  <Button variant="outline" className="h-12 border-slate-700 text-slate-300" onClick={() => dispatch(clearCart())}>
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </Button>
                  <Button
                    className="flex-1 h-12 text-sm font-bold bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleCheckout}
                    disabled={cart.items.length === 0 || status === 'loading'}
                  >
                    Charge Register
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 border-t border-slate-800 pt-3 animate-fade-in">
                  <p className="text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1">
                    <span>⚡</span> INVOICE READY: #{activeOrder.id?.slice(0, 8)}
                  </p>

                  {/* UPI Reference Box */}
                  <div className="space-y-2 bg-slate-950 p-3 rounded border border-slate-850">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-indigo-400" /> UPI Pay QR Code
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">abc_restaurant@upi</span>
                    </div>
                    <Input
                      id="upi-ref-no"
                      placeholder="Enter 12-digit UPI Txn Ref ID..."
                      value={upiReference}
                      onChange={(e) => setUpiReference(e.target.value)}
                      className="w-full h-9 bg-slate-900 border-slate-800 text-xs text-white"
                    />
                  </div>

                  {/* Payment Trigger Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      className="h-10 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                      onClick={() => handlePayment('CASH')}
                    >
                      <Banknote className="w-4 h-4 mr-1.5" /> Cash
                    </Button>
                    <Button
                      size="sm"
                      className="h-10 bg-sky-600 hover:bg-sky-700 text-xs font-bold"
                      onClick={() => handlePayment('CARD')}
                    >
                      <CreditCard className="w-4 h-4 mr-1.5" /> Card
                    </Button>
                    <Button
                      size="sm"
                      className="h-10 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
                      onClick={() => handlePayment('UPI')}
                      disabled={!upiReference}
                    >
                      Verify UPI
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Shift History tab panel */
        <div className="flex-1 overflow-y-auto space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" /> Shift Payout Transactions Log
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {receipts.map((rec: any, idx) => (
              <Card key={rec.id || idx} className="bg-slate-900 border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <span className="font-semibold text-white text-sm">Invoice #{rec.id?.slice(0, 8)}</span>
                    <Badge variant="success">Completed</Badge>
                  </div>
                  <div className="text-xs text-slate-400 mt-2 font-mono flex flex-col gap-1">
                    <span>Order Type: {rec.orderType || 'Walk-In'}</span>
                    <span>Total Amount Charged: ${parseFloat(rec.order?.totalAmount || rec.total || 0).toFixed(2)}</span>
                    <span>Payments Settled: CASH / CARD / UPI</span>
                  </div>
                </div>
                <div className="flex justify-end pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 text-slate-300 flex items-center gap-1.5 text-xs font-bold"
                    onClick={() => {
                      setPrintedReceipt(rec);
                      setShowPrintModal(true);
                    }}
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Invoice
                  </Button>
                </div>
              </Card>
            ))}

            {receipts.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded">
                No checkout transactions processed in this shift drawer.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Styled Register Thermal Receipt Modal */}
      {showPrintModal && printedReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="bg-slate-900 border-slate-800 max-w-sm w-full p-6 text-slate-100 flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm uppercase font-bold text-slate-400 flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-400" /> Thermal Print Slip
              </h3>
              <button
                className="text-slate-400 hover:text-white"
                onClick={() => {
                  setShowPrintModal(false);
                  setPrintedReceipt(null);
                }}
              >
                ✕
              </button>
            </div>

            {/* Print Slip Structure */}
            <div
              id="print-receipt-content"
              className="bg-white text-black p-5 rounded font-mono text-xs border border-slate-300 space-y-4 leading-relaxed shadow-inner"
            >
              <div className="text-center space-y-1">
                <h4 className="font-extrabold text-sm uppercase tracking-wide">ABC Restaurant</h4>
                <p className="text-[10px] text-slate-600">Branch Register Cashier Receipt</p>
                <p className="text-[9px] text-slate-500">June 2026 Shift Ledger</p>
              </div>

              <div className="border-t border-b border-dashed border-black/35 py-2 space-y-1 text-[10px]">
                <div>TRANS: #{printedReceipt.id?.slice(0, 12)}</div>
                <div>TYPE: {printedReceipt.orderType || 'WALK_IN'}</div>
                <div>DATE: {new Date().toLocaleString()}</div>
              </div>

              {/* Items */}
              <div className="space-y-1.5 text-[10px]">
                {printedReceipt.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      {item.name || item.product?.name} x {item.quantity}
                    </div>
                    <div className="font-semibold">${((item.price || item.product?.basePrice || 0) * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-black/35 pt-2 text-[10px] space-y-1">
                <div className="flex justify-between font-bold text-[11px]">
                  <span>NET TAX (5%):</span>
                  <span>${(parseFloat(printedReceipt.order?.totalAmount || printedReceipt.total || 0) * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm border-t border-black/40 pt-1">
                  <span>TOTAL PAID:</span>
                  <span>${parseFloat(printedReceipt.order?.totalAmount || printedReceipt.total || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center text-[9px] text-slate-500 pt-3 border-t border-dashed border-black/25">
                *** THANK YOU FOR VISITING ***
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300"
                onClick={() => {
                  setShowPrintModal(false);
                  setPrintedReceipt(null);
                }}
              >
                Close Slip
              </Button>
              <Button variant="primary" onClick={triggerPrintReceipt} className="bg-indigo-600 hover:bg-indigo-700">
                Print Receipt
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
