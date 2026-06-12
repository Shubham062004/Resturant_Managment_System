import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/apiClient';
import { useToast } from '../../../shared/components/ui/Toast';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  ChefHat, 
  CheckCircle, 
  Package, 
  ShoppingBag,
  MoreVertical,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useAppSelector } from '../../../app/store';

// Assuming standard order interfaces
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string };
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  orderType: string;
  user?: { firstName: string; lastName: string; phone: string };
  items: OrderItem[];
  branchId: string;
}

export default function ManagerOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  // Fetch branches logic for context
  useEffect(() => {
    const init = async () => {
      try {
        const res = await apiClient.get('/catalog/branches');
        const b = res.data.data.branches || [];
        setBranches(b);
        if (b.length > 0) setSelectedBranchId(b[0].id);
      } catch (err) {
        console.error('Failed to init branches', err);
      }
    };
    init();
  }, []);

  // Fetch orders when branch changes
  useEffect(() => {
    if (!selectedBranchId) return;
    fetchOrders();
  }, [selectedBranchId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fallback to fetch all and filter client side if specific endpoint doesn't exist
      // Real implementation should use ?branchId=...
      const res = await apiClient.get(`/admin/orders`); 
      const allOrders = res.data.data || [];
      // Filter for this branch only
      const branchOrders = allOrders.filter((o: any) => o.branchId === selectedBranchId || o.branch?.id === selectedBranchId);
      setOrders(branchOrders);
    } catch (err) {
      toast.error('Failed to load live orders.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order moved to ${newStatus}`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Could not update status');
    }
  };

  // Group orders by columns
  const columns = [
    { id: 'PENDING', title: 'New / Pending', statuses: ['PLACED'], icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'PREPARING', title: 'In Kitchen', statuses: ['ACCEPTED', 'PREPARING'], icon: ChefHat, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'READY', title: 'Ready for Pickup', statuses: ['READY', 'READY_FOR_PICKUP'], icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'DELIVERED', title: 'Completed', statuses: ['DELIVERED', 'PICKED_UP'], icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  const getOrderCard = (order: Order) => {
    const isLate = new Date().getTime() - new Date(order.createdAt).getTime() > 20 * 60000; // 20 mins

    return (
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        key={order.id} 
        className={`p-4 rounded-xl border ${isLate && order.status !== 'DELIVERED' ? 'bg-rose-500/5 border-rose-500/30' : 'bg-slate-900/60 border-border/20 hover:border-primary/40'} shadow-lg backdrop-blur-md flex flex-col gap-3 group transition-colors`}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold font-mono text-slate-200">#{order.orderNumber.slice(-6).toUpperCase()}</span>
              {isLate && order.status !== 'DELIVERED' && <AlertTriangle size={14} className="text-rose-500 animate-pulse" />}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleTimeString()}</p>
          </div>
          <Badge variant={order.orderType === 'DELIVERY' ? 'warning' : 'info'} className="text-[9px] px-1.5 py-0.5">
            {order.orderType}
          </Badge>
        </div>

        <div className="text-sm text-slate-300">
          <p className="font-semibold text-slate-200">{order.user?.firstName || 'Guest'} {order.user?.lastName || ''}</p>
          <p className="text-xs text-slate-500 truncate mt-1">
            {order.items.length} Items • ₹{order.totalAmount}
          </p>
        </div>

        {/* Actions based on current status */}
        <div className="mt-2 pt-3 border-t border-border/10 flex flex-wrap gap-2">
          {order.status === 'PLACED' && (
            <>
              <Button onClick={() => updateOrderStatus(order.id, 'ACCEPTED')} size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-1 h-7">
                Accept Order
              </Button>
              <Button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} size="sm" className="bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 text-[10px] py-1 h-7 border border-border/20">
                <XCircle size={14} />
              </Button>
            </>
          )}
          {['ACCEPTED'].includes(order.status) && (
            <Button onClick={() => updateOrderStatus(order.id, 'PREPARING')} size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] py-1 h-7">
              Send to Kitchen
            </Button>
          )}
          {['PREPARING'].includes(order.status) && (
            <Button onClick={() => updateOrderStatus(order.id, 'READY')} size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] py-1 h-7">
              Mark Ready
            </Button>
          )}
          {['READY', 'READY_FOR_PICKUP'].includes(order.status) && (
            <Button onClick={() => updateOrderStatus(order.id, 'DELIVERED')} size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] py-1 h-7">
              {order.orderType === 'DELIVERY' ? 'Hand to Rider' : 'Hand to Customer'}
            </Button>
          )}
          <Button size="sm" className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] py-1 h-7 px-2 border border-border/20">
            <MoreVertical size={14} />
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Live Order Kanban</h1>
          <p className="text-sm text-slate-400 mt-1">Manage kitchen dispatch and fulfillment workflow.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-border/30 rounded-xl px-4 py-2">
            <span className="text-slate-400 text-xs">Branch:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer appearance-none"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">{b.name}</option>
              ))}
            </select>
          </div>
          <Button onClick={fetchOrders} className="bg-slate-800 hover:bg-slate-700 text-white border border-border/30 rounded-xl h-9">
            Refresh
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
        <div className="flex gap-4 h-full min-w-[1000px]">
          {columns.map((col) => {
            const columnOrders = orders.filter((o) => col.statuses.includes(o.status));
            const ColIcon = col.icon;
            
            return (
              <div key={col.id} className="flex-1 flex flex-col bg-slate-900/30 rounded-2xl border border-border/10 overflow-hidden">
                {/* Column Header */}
                <div className={`p-4 border-b border-border/20 flex items-center justify-between shrink-0 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${col.bg} flex items-center justify-center`}>
                      <ColIcon className={`w-4 h-4 ${col.color}`} />
                    </div>
                    <h3 className="font-bold text-white tracking-wide text-sm">{col.title}</h3>
                  </div>
                  <Badge variant="neutral" className="bg-slate-950 text-slate-300 font-bold px-2 py-0.5 text-xs border border-border/20">
                    {columnOrders.length}
                  </Badge>
                </div>

                {/* Column Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {loading ? (
                    <div className="animate-pulse space-y-4">
                      {[1, 2].map(i => <div key={i} className="h-32 bg-slate-800/50 rounded-xl border border-border/10" />)}
                    </div>
                  ) : columnOrders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                      <ShoppingBag size={32} className="text-slate-600 mb-3" />
                      <p className="text-xs font-semibold text-slate-500">No Orders Here</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {columnOrders.map(getOrderCard)}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
