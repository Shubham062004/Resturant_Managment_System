import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../../shared/components/SEO';
import Card, { CardContent } from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import EmptyState from '../../../shared/components/ui/EmptyState';
import {
  ClipboardList,
  Flame,
  Truck,
  Activity,
  PackageCheck
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Simulated active order state
  const activeOrder = {
    id: 'OX-9801',
    branch: 'Oven Xpress - Midtown Manhattan',
    date: 'Today, 07:15 PM',
    amount: 34.50,
    items: [
      { name: 'Firebrick Pepperoni Pizza', qty: 1, modifiers: ['Extra Cheese', 'Thick Crust'] },
      { name: 'Classic Craft Cheeseburger', qty: 1, modifiers: ['No Pickles'] }
    ],
    status: 'baking', // received, preparing, baking, packed, dispatched
    steps: [
      { key: 'received', label: 'Order Logged', done: true, current: false },
      { key: 'preparing', label: 'Chef Preparation', done: true, current: false },
      { key: 'baking', label: 'Baking (800°F)', done: true, current: true },
      { key: 'dispatched', label: 'Courier Transit', done: false, current: false }
    ]
  };

  return (
    <>
      <SEO
        title="Order Tracker & History"
        description="Monitor active kitchen preparation steps, track delivery transit, and view order receipts from Oven Xpress."
        keywords="Order history Oven Xpress, pizza order tracker, kitchen ticket tracking"
      />

      <div className="space-y-6 font-sans">
        
        {/* Head details */}
        <div className="border-b border-border/40 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
              <ClipboardList className="text-primary" size={22} />
              <span>Orders Dispatch Tracker</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Live digital ticket streams and historical kitchen invoices.</p>
          </div>

          {/* Toggle Tab */}
          <div className="bg-secondary/60 border border-border/50 rounded-lg p-1 flex gap-1 select-none text-xs">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
                activeTab === 'active'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              Active Stream
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors ${
                activeTab === 'history'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              Invoices History
            </button>
          </div>
        </div>

        {activeTab === 'active' ? (
          <div className="space-y-6">
            
            {/* Active order panel */}
            <Card className="bg-card/45 border-border/80 shadow-lg">
              <CardContent className="p-6 space-y-6">
                
                {/* Header details of active order */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary font-display">Active Dispatch</span>
                    <h2 className="text-base font-bold text-white">Order Ticket #{activeOrder.id}</h2>
                    <p className="text-xs text-muted-foreground">{activeOrder.branch} • {activeOrder.date}</p>
                  </div>
                  <Badge variant="warning" className="text-[9px] font-extrabold tracking-wider px-3 py-1 animate-pulse">
                    Baking in progress
                  </Badge>
                </div>

                {/* Items preview list */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">Culinary details</h3>
                  <div className="space-y-2 text-xs">
                    {activeOrder.items.map((item) => (
                      <div key={item.name} className="flex justify-between items-start text-foreground/80 border-b border-border/20 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-white">{item.qty}x {item.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.modifiers.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking Progress Steps */}
                <div className="border-t border-border/40 pt-6 space-y-4">
                  <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Activity size={14} className="text-primary animate-pulse" />
                    <span>Kitchen Progress Stream</span>
                  </h3>

                  {/* Horizontal tracker steps */}
                  <div className="grid grid-cols-4 gap-2 relative mt-4">
                    {activeOrder.steps.map((step) => (
                      <div key={step.key} className="flex flex-col items-center text-center space-y-2 relative">
                        <div
                          className={`w-8 h-8 rounded-full border flex items-center justify-center relative z-10 ${
                            step.current
                              ? 'bg-primary border-primary text-white shadow shadow-primary/20 animate-pulse'
                              : step.done
                              ? 'bg-success/20 border-success text-success'
                              : 'bg-secondary border-border/80 text-muted-foreground'
                          }`}
                        >
                          {step.key === 'received' && <PackageCheck size={14} />}
                          {step.key === 'preparing' && <Activity size={14} />}
                          {step.key === 'baking' && <Flame size={14} />}
                          {step.key === 'dispatched' && <Truck size={14} />}
                        </div>
                        <span className={`text-[9px] font-bold tracking-tight leading-tight ${
                          step.current ? 'text-primary' : step.done ? 'text-success' : 'text-muted-foreground'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>

            <div className="text-center py-6 text-xs text-muted-foreground italic font-sans border border-dashed border-border/60 rounded-xl">
              * The kitchen dashboard will automatically notify you with hot acoustic pings on courier handoff.
            </div>

          </div>
        ) : (
          /* Past orders (empty state) */
          <div className="py-12">
            <EmptyState
              type="orders"
              title="No Invoices Recorded"
              description="You have not placed any orders yet. Select an outpost, configure modifiers, and complete checkout to see transactions here."
              actionLabel="Discover Outposts"
              onAction={() => navigate('/branches')}
            />
          </div>
        )}

      </div>
    </>
  );
};

export default OrdersPage;
