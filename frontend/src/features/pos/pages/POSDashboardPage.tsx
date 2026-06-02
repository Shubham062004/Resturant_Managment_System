import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { startShift, checkoutPOS, processPayment, setOrderType, addToCart, clearCart } from '../store/posSlice';
import { fetchCategories, fetchProducts } from '../../menu/store/menuSlice';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { ShoppingCart, Plus, Minus, CreditCard, Banknote, Coffee, Trash2, Store } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge';

export default function POSDashboardPage() {
  const dispatch = useAppDispatch();
  const { terminals, activeDrawer, cart, activeOrder, status } = useAppSelector((state) => state.pos);
  const { categories, products } = useAppSelector((state) => state.menu);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTerminal, setSelectedTerminal] = useState<string>('');
  const [openingAmount, setOpeningAmount] = useState<number>(100);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
    // Assuming branchId is stored in user or selected globally. For demo, we fetch terminals for a hardcoded/first branch later.
    // In a real scenario, you get the branchId from the manager's context.
  }, [dispatch]);

  const handleStartShift = () => {
    if (selectedTerminal) {
      dispatch(startShift({ terminalId: selectedTerminal, openingAmount }));
    }
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) return;
    dispatch(checkoutPOS({}));
  };

  const handlePayment = (method: 'CASH' | 'UPI' | 'CARD') => {
    if (activeOrder) {
      dispatch(processPayment({
        posOrderId: activeOrder.id,
        payments: [{ method, amount: activeOrder.order.totalAmount }]
      }));
    }
  };

  if (!activeDrawer) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-surface border border-border/50 rounded-xl space-y-6 animate-fade-in">
        <div className="text-center">
          <Store className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Start POS Shift</h2>
          <p className="text-muted-foreground mt-2">Open the cash drawer to begin accepting orders.</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Select Terminal</label>
            <select 
              className="w-full bg-background border border-border/50 rounded-lg px-4 py-2 text-white focus:border-primary transition-colors"
              value={selectedTerminal}
              onChange={(e) => setSelectedTerminal(e.target.value)}
            >
              <option value="">-- Choose Terminal --</option>
              {terminals.map(t => (
                <option key={t.id} value={t.id}>{t.terminalName}</option>
              ))}
              {/* Fallback option for demo if no terminals fetched yet */}
              <option value="demo-terminal-id">Main Register (Demo)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Opening Cash ($)</label>
            <input 
              type="number"
              className="w-full bg-background border border-border/50 rounded-lg px-4 py-2 text-white focus:border-primary transition-colors"
              value={openingAmount}
              onChange={(e) => setOpeningAmount(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleStartShift} className="w-full h-12 text-lg font-semibold" disabled={!selectedTerminal}>
            Open Shift
          </Button>
        </div>
      </div>
    );
  }

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.categoryId === activeCategory);

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-6 overflow-hidden animate-fade-in p-4">
      {/* Left Column: Menu Grid */}
      <div className="flex-1 flex flex-col bg-surface/30 rounded-xl border border-border/50 overflow-hidden">
        {/* Categories */}
        <div className="p-4 border-b border-border/50 overflow-x-auto flex gap-3 hide-scrollbar">
          <Badge 
            variant={activeCategory === 'all' ? 'default' : 'outline'} 
            className="cursor-pointer whitespace-nowrap text-sm px-4 py-2"
            onClick={() => setActiveCategory('all')}
          >
            All Items
          </Badge>
          {categories.map(cat => (
            <Badge 
              key={cat.id} 
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap text-sm px-4 py-2"
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </Badge>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 content-start">
          {filteredProducts.map(product => (
            <Card 
              key={product.id} 
              className="bg-background/50 border-border/50 hover:border-primary/50 cursor-pointer transition-colors p-3 flex flex-col justify-between aspect-square"
              onClick={() => dispatch(addToCart({ productId: product.id, quantity: 1, name: product.name, price: product.basePrice }))}
            >
              <div className="text-center h-full flex flex-col items-center justify-center space-y-2">
                <Coffee className="w-8 h-8 text-muted-foreground mb-2" />
                <h3 className="text-white text-sm font-medium line-clamp-2 leading-tight">{product.name}</h3>
                <p className="text-primary font-bold">${Number(product.basePrice).toFixed(2)}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Column: Active Cart / Order */}
      <div className="w-[400px] flex flex-col bg-surface border border-border/50 rounded-xl overflow-hidden shrink-0">
        
        {/* Order Types */}
        <div className="p-4 border-b border-border/50 grid grid-cols-3 gap-2">
          {(['WALK_IN', 'DINE_IN', 'TAKEAWAY'] as const).map(type => (
            <button
              key={type}
              className={`py-2 rounded-lg text-xs font-bold transition-colors ${cart.orderType === type ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-surface-light'}`}
              onClick={() => dispatch(setOrderType(type))}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <p>No items in current order</p>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.productId} className="flex items-center justify-between bg-background/50 p-3 rounded-lg border border-border/30">
                <div className="flex-1 pr-2">
                  <h4 className="text-white font-medium text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-primary text-xs font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 bg-surface rounded-lg p-1">
                  <button className="p-1 text-muted-foreground hover:text-white transition-colors" onClick={() => dispatch(addToCart({ ...item, quantity: -1 }))}>
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-white text-sm w-4 text-center font-medium">{item.quantity}</span>
                  <button className="p-1 text-muted-foreground hover:text-white transition-colors" onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout */}
        <div className="p-4 bg-background border-t border-border/50 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (5%)</span>
              <span>${cart.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-border/50">
              <span>Total</span>
              <span className="text-primary">${cart.total.toFixed(2)}</span>
            </div>
          </div>

          {!activeOrder ? (
            <div className="flex gap-2">
              <Button variant="outline" className="h-14 px-4" onClick={() => dispatch(clearCart())}>
                <Trash2 className="w-5 h-5 text-destructive" />
              </Button>
              <Button className="flex-1 h-14 text-lg font-bold" onClick={handleCheckout} disabled={cart.items.length === 0 || status === 'loading'}>
                {status === 'loading' ? 'Processing...' : 'Charge Order'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <p className="text-center text-sm font-medium text-success">Order Created! Select Payment Method:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button className="h-14 bg-green-600 hover:bg-green-700 font-bold" onClick={() => handlePayment('CASH')}>
                  <Banknote className="w-5 h-5 mr-2" /> Cash
                </Button>
                <Button className="h-14 bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => handlePayment('CARD')}>
                  <CreditCard className="w-5 h-5 mr-2" /> Card
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
