import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../../shared/components/SEO';
import EmptyState from '../../../shared/components/ui/EmptyState';
import {
  ClipboardList,
  Flame,
  Truck,
  Activity,
  PackageCheck,
  History,
  CheckCircle2,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Simulated active order state
  const activeOrder = {
    id: 'OX-9801',
    branch: 'ABC - Midtown Manhattan',
    date: 'Today, 07:15 PM',
    amount: 34.5,
    items: [
      { name: 'Firebrick Pepperoni Pizza', qty: 1, modifiers: ['Extra Cheese', 'Thick Crust'] },
      { name: 'Classic Craft Cheeseburger', qty: 1, modifiers: ['No Pickles'] },
    ],
    status: 'baking', // received, preparing, baking, packed, dispatched
    steps: [
      { key: 'received', label: 'Order Confirmed', done: true, current: false },
      { key: 'preparing', label: 'Preparing', done: true, current: false },
      { key: 'baking', label: 'In the Oven', done: true, current: true },
      { key: 'dispatched', label: 'Out for Delivery', done: false, current: false },
    ],
  };

  return (
    <>
      <SEO
        title="My Orders — ABC Restaurant"
        description="Track your live orders and view your order history."
        keywords="Order history ABC, pizza order tracker, kitchen ticket tracking"
      />

      <div className="space-y-8 font-sans">
        {/* Head details */}
        <div className="border-b border-white/5 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-white flex items-center gap-3">
              <ClipboardList className="text-primary" size={28} />
              <span>My Orders</span>
            </h1>
            <p className="text-sm text-neutral-400 mt-2">
              Track live deliveries and view your past order receipts.
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-1.5 flex gap-1 select-none">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-5 py-2 font-bold text-sm rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'active'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity size={16} /> Live Orders
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2 font-bold text-sm rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History size={16} /> Past Orders
            </button>
          </div>
        </div>

        {activeTab === 'active' ? (
          <div className="space-y-8">
            {/* Active order panel */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
              {/* Top Banner highlight */}
              <div className="h-2 bg-gradient-to-r from-primary via-amber-500 to-primary" />

              <div className="p-6 md:p-8 space-y-8">
                {/* Header details of active order */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md inline-block">
                      Preparing Now
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold font-display text-white">
                      Order #{activeOrder.id}
                    </h2>
                    <p className="text-sm text-neutral-400 flex flex-wrap items-center gap-2">
                      <span>{activeOrder.branch}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-600" />
                      <span>{activeOrder.date}</span>
                    </p>
                  </div>

                  <div className="text-left md:text-right bg-white/[0.03] p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold mb-1">
                      Total Paid
                    </p>
                    <p className="text-2xl font-bold text-white">
                      ₹{activeOrder.amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Tracking Progress Steps */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity size={16} className="text-primary" />
                    Live Tracking Status
                  </h3>

                  <div className="relative pt-2 pb-6">
                    {/* Background track line */}
                    <div className="absolute top-6 left-6 right-6 h-1 bg-white/5 rounded-full -z-10" />
                    {/* Active track line */}
                    <div className="absolute top-6 left-6 w-1/2 h-1 bg-primary rounded-full -z-10 shadow-[0_0_10px_rgba(var(--color-primary),0.5)]" />

                    <div className="grid grid-cols-4 gap-2">
                      {activeOrder.steps.map((step) => (
                        <div
                          key={step.key}
                          className="flex flex-col items-center text-center space-y-3"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              step.current
                                ? 'bg-primary text-white shadow-[0_0_20px_rgba(var(--color-primary),0.4)] scale-110 border-2 border-primary-light'
                                : step.done
                                  ? 'bg-primary/20 text-primary border border-primary/30'
                                  : 'bg-neutral-900 border border-white/10 text-neutral-600'
                            }`}
                          >
                            {step.key === 'received' && <PackageCheck size={18} />}
                            {step.key === 'preparing' && <CheckCircle2 size={18} />}
                            {step.key === 'baking' && (
                              <Flame size={18} className={step.current ? 'animate-bounce' : ''} />
                            )}
                            {step.key === 'dispatched' && <Truck size={18} />}
                          </div>
                          <span
                            className={`text-xs font-bold leading-tight ${
                              step.current
                                ? 'text-white'
                                : step.done
                                  ? 'text-neutral-300'
                                  : 'text-neutral-600'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Items preview list */}
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 border-b border-white/5 pb-3">
                    Order Summary ({activeOrder.items.length} items)
                  </h3>
                  <div className="space-y-4 text-sm">
                    {activeOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start gap-4 text-neutral-300"
                      >
                        <div>
                          <p className="font-bold text-white">
                            <span className="text-primary mr-2">{item.qty}x</span>
                            {item.name}
                          </p>
                          {item.modifiers.length > 0 && (
                            <p className="text-xs text-neutral-500 mt-1 pl-6">
                              {item.modifiers.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center py-4 text-sm text-neutral-500 bg-primary/5 rounded-xl border border-primary/10">
              <span className="text-primary font-semibold">Tip:</span> You will receive a
              notification when your order is out for delivery.
            </div>
          </div>
        ) : (
          /* Past orders (empty state) */
          <div className="py-16 bg-white/[0.02] border border-white/5 rounded-3xl text-center px-6">
            <History size={48} className="mx-auto text-neutral-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Past Orders Found</h3>
            <p className="text-neutral-400 text-sm mb-6 max-w-md mx-auto">
              You haven't completed any orders yet. Discover our delicious menu and place your first
              order today!
            </p>
            <button
              onClick={() => navigate('/restaurants')}
              className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold"
            >
              Browse Menu
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersPage;
