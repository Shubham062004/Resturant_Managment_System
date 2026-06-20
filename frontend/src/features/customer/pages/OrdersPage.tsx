import {
  ClipboardList,
  Flame,
  Truck,
  Activity,
  PackageCheck,
  History,
  CheckCircle2,
  RefreshCw,
  Receipt,
  XCircle,
  MapPin,
  Clock,
  Loader2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import SEO from '../../../shared/components/SEO';
import EmptyState from '../../../shared/components/ui/EmptyState';
import SkeletonCard from '../../../shared/components/ui/SkeletonCard';
import { useToast } from '../../../shared/components/ui/Toast';
import { apiClient } from '../../../services/apiClient';

// ----- Types -----
interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  totalAmount: string;
  subtotal: string;
  tax: string;
  deliveryFee: string;
  discount: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  branch?: { id: string; name: string; address: string };
  restaurant?: { id: string; name: string };
  address?: { addressLine1: string; city: string };
  statusHistory?: Array<{
    newStatus: string;
    timestamp: string;
  }>;
}

// ----- API hooks -----
const useMyOrders = () =>
  useQuery<{ success: boolean; data: Order[]; message: string }>({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await apiClient.get('/orders');
      return data;
    },
    refetchInterval: 15000, // auto-refresh every 15s to pick up status changes
  });

const useCancelOrder = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await apiClient.post(`/orders/${orderId}/cancel`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Order cancelled successfully.');
    },
    onError: () => {
      toast.error('Unable to cancel order. It may have already been prepared.');
    },
  });
};

// ----- Status config -----
const STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Confirmed', icon: PackageCheck },
  { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2 },
  { key: 'PREPARING', label: 'Preparing', icon: Flame },
  { key: 'READY', label: 'Ready', icon: CheckCircle2 },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

const ACTIVE_STATUSES = new Set([
  'PLACED',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'READY_FOR_PICKUP',
]);

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  PLACED: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  ACCEPTED: { label: 'Accepted', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  PREPARING: { label: 'Preparing', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  READY: { label: 'Ready', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  OUT_FOR_DELIVERY: { label: 'On the Way', color: 'bg-primary/10 text-primary border-primary/20' },
  DELIVERED: { label: 'Delivered', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  PICKED_UP: { label: 'Picked Up', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  REFUNDED: { label: 'Refunded', color: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20' },
};

// ----- Active Order Tracker -----
function ActiveOrderCard({ order, onCancel }: { order: Order; onCancel: () => void }) {
  const currentStatusIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      <div className="h-1.5 bg-gradient-to-r from-primary via-amber-500 to-primary" />
      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${(STATUS_BADGE[order.status] || STATUS_BADGE['PLACED']).color}`}
              >
                {(STATUS_BADGE[order.status] || STATUS_BADGE['PLACED']).label}
              </span>
              <span className="text-xs text-neutral-500">
                {order.orderType === 'DELIVERY' ? '🚚 Delivery' : order.orderType === 'PICKUP' ? '🏃 Pickup' : '🍽 Dine In'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-white">
              Order #{order.orderNumber}
            </h2>
            <p className="text-sm text-neutral-400 flex flex-wrap items-center gap-2">
              {order.branch && (
                <>
                  <MapPin size={12} className="text-primary" />
                  <span>{order.branch.name}</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-600" />
                </>
              )}
              <Clock size={12} />
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-left md:text-right bg-white/[0.03] p-4 rounded-xl border border-white/5">
              <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-white">₹{parseFloat(order.totalAmount).toFixed(2)}</p>
            </div>
            {order.status === 'PLACED' && (
              <button
                onClick={onCancel}
                className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all flex items-center gap-2 justify-center"
              >
                <XCircle size={14} /> Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Tracking Steps */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            Live Tracking Status
          </h3>
          <div className="relative pt-2 pb-6 overflow-x-auto">
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-white/5 rounded-full -z-10" />
            <div
              className="absolute top-6 left-6 h-0.5 bg-primary rounded-full -z-10 shadow-[0_0_8px_rgba(var(--color-primary),0.5)] transition-all duration-500"
              style={{ width: `${currentStatusIdx >= 0 ? ((currentStatusIdx / (STATUS_STEPS.length - 1)) * 100) : 0}%` }}
            />
            <div className="grid grid-cols-6 gap-2 min-w-[500px]">
              {STATUS_STEPS.map((step, idx) => {
                const done = idx <= currentStatusIdx;
                const current = idx === currentStatusIdx;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        current
                          ? 'bg-primary text-white shadow-[0_0_20px_rgba(var(--color-primary),0.4)] scale-110 border-2 border-white/20'
                          : done
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-neutral-900 border border-white/10 text-neutral-600'
                      }`}
                    >
                      <Icon size={18} className={current && step.key === 'PREPARING' ? 'animate-bounce' : ''} />
                    </div>
                    <span
                      className={`text-[10px] font-bold leading-tight ${
                        current ? 'text-white' : done ? 'text-neutral-300' : 'text-neutral-600'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-black/20 rounded-2xl p-5 border border-white/5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 border-b border-white/5 pb-3">
            Order Summary ({order.items.length} items)
          </h3>
          <div className="space-y-3 text-sm">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center gap-4 text-neutral-300">
                <p className="font-bold text-white">
                  <span className="text-primary mr-2">{item.quantity}x</span>
                  {item.product.name}
                </p>
                <span className="text-neutral-400 text-xs whitespace-nowrap">
                  ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-3 space-y-1.5 text-xs text-neutral-400">
            <div className="flex justify-between">
              <span>Subtotal</span><span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span><span>₹{parseFloat(order.tax).toFixed(2)}</span>
            </div>
            {parseFloat(order.deliveryFee) > 0 && (
              <div className="flex justify-between">
                <span>Delivery Fee</span><span>₹{parseFloat(order.deliveryFee).toFixed(2)}</span>
              </div>
            )}
            {parseFloat(order.discount) > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount</span><span>-₹{parseFloat(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-white text-sm pt-1 border-t border-white/5">
              <span>Total</span><span>₹{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- Past Order Card -----
function PastOrderCard({ order }: { order: Order }) {
  const badge = STATUS_BADGE[order.status] || STATUS_BADGE['PLACED'];
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 space-y-4 hover:border-white/15 transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${badge.color}`}>
              {badge.label}
            </span>
            <span className="text-xs text-neutral-600">
              {order.orderType === 'DELIVERY' ? '🚚' : order.orderType === 'PICKUP' ? '🏃' : '🍽'}
            </span>
          </div>
          <h3 className="font-bold text-white text-sm">Order #{order.orderNumber}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {new Date(order.createdAt).toLocaleString()}
            {order.branch && ` · ${order.branch.name}`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-white text-lg">₹{parseFloat(order.totalAmount).toFixed(2)}</p>
          <p className="text-xs text-neutral-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="border-t border-white/5 pt-3">
        <div className="flex flex-wrap gap-2">
          {order.items.slice(0, 3).map((item) => (
            <span key={item.id} className="text-xs bg-white/5 rounded-lg px-2 py-1 text-neutral-400">
              {item.quantity}× {item.product.name}
            </span>
          ))}
          {order.items.length > 3 && (
            <span className="text-xs bg-white/5 rounded-lg px-2 py-1 text-neutral-500">
              +{order.items.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ----- Main Component -----
export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const { data: ordersRes, isLoading, isError, refetch, isFetching } = useMyOrders();
  const cancelOrder = useCancelOrder();

  const allOrders = ordersRes?.data ?? [];
  const activeOrders = allOrders.filter((o) => ACTIVE_STATUSES.has(o.status));
  const pastOrders = allOrders.filter((o) => !ACTIVE_STATUSES.has(o.status));

  return (
    <>
      <SEO
        title="My Orders — ABC Restaurant"
        description="Track your live orders and view your order history."
        keywords="Order history ABC, pizza order tracker, kitchen ticket tracking"
      />

      <div className="space-y-8 font-sans">
        {/* Header */}
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
              aria-label="Refresh orders"
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            </button>
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-1.5 flex gap-1 select-none">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-5 py-2 font-bold text-sm rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === 'active'
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity size={16} />
                Live
                {activeOrders.length > 0 && (
                  <span className="w-5 h-5 bg-white/20 rounded-full text-[10px] flex items-center justify-center">
                    {activeOrders.length}
                  </span>
                )}
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
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="text-center py-16 bg-red-500/5 border border-red-500/10 rounded-2xl">
            <XCircle size={40} className="mx-auto text-red-400 mb-4" />
            <p className="text-white font-bold mb-2">Unable to load orders</p>
            <p className="text-neutral-400 text-sm mb-4">Please check your connection and try again.</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Active Orders Tab */}
        {!isLoading && !isError && activeTab === 'active' && (
          <div className="space-y-8">
            {activeOrders.length === 0 ? (
              <div className="py-16 bg-white/[0.02] border border-white/5 rounded-3xl text-center px-6">
                <Activity size={48} className="mx-auto text-neutral-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Active Orders</h3>
                <p className="text-neutral-400 text-sm mb-6 max-w-md mx-auto">
                  You don&apos;t have any orders being prepared right now.
                </p>
                <button
                  onClick={() => navigate('/menu')}
                  className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20"
                >
                  Order Now
                </button>
              </div>
            ) : (
              <>
                {activeOrders.map((order) => (
                  <ActiveOrderCard
                    key={order.id}
                    order={order}
                    onCancel={() => cancelOrder.mutate(order.id)}
                  />
                ))}
                <div className="text-center py-4 text-sm text-neutral-500 bg-primary/5 rounded-xl border border-primary/10">
                  <Loader2 size={14} className="inline-block mr-2 animate-spin text-primary" />
                  Auto-refreshing every 15 seconds...
                </div>
              </>
            )}
          </div>
        )}

        {/* Past Orders Tab */}
        {!isLoading && !isError && activeTab === 'history' && (
          <div className="space-y-4">
            {pastOrders.length === 0 ? (
              <div className="py-16 bg-white/[0.02] border border-white/5 rounded-3xl text-center px-6">
                <History size={48} className="mx-auto text-neutral-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Past Orders Found</h3>
                <p className="text-neutral-400 text-sm mb-6 max-w-md mx-auto">
                  You haven&apos;t completed any orders yet. Discover our delicious menu!
                </p>
                <button
                  onClick={() => navigate('/menu')}
                  className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Receipt size={16} className="text-neutral-400" />
                  <p className="text-neutral-400 text-sm">{pastOrders.length} past order{pastOrders.length !== 1 ? 's' : ''}</p>
                </div>
                {pastOrders.map((order) => (
                  <PastOrderCard key={order.id} order={order} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersPage;
