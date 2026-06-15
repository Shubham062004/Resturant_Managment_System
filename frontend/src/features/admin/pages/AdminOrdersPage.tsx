import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Undo,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import apiClient from '../../../services/apiClient';
import { Button } from '../../../shared/components/ui/Button';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image?: string;
  };
}

interface Refund {
  id: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  status: string;
  orderType: string;
  notes?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  branch?: {
    name: string;
  };
  items: OrderItem[];
  refunds: Refund[];
}

export default function AdminOrdersPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal details state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Refund forms state
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/orders');
      setOrders(res.data.data || []);
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      toast.error('Failed to load system orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setSubmittingAction(true);
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Could not update order status.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setSubmittingAction(true);
      await apiClient.post(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully.');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Could not cancel order.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleIssueRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setSubmittingAction(true);
      const amount = parseFloat(refundAmount);
      if (isNaN(amount) || amount <= 0 || amount > selectedOrder.totalAmount) {
        toast.error(`Refund amount must be between 0 and ₹${selectedOrder.totalAmount}`);
        return;
      }

      await apiClient.post(`/inventory/refunds`, {
        orderId: selectedOrder.id,
        amount,
        reason: refundReason,
      });

      toast.success(`Refund of ₹${amount} initiated successfully.`);
      setShowRefundModal(false);
      setShowDetailsModal(false);
      setRefundAmount('');
      setRefundReason('');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Could not initiate refund.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Derived metrics
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) =>
    ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'READY_FOR_PICKUP'].includes(o.status),
  ).length;
  const completedOrdersCount = orders.filter((o) =>
    ['DELIVERED', 'PICKED_UP'].includes(o.status),
  ).length;
  const cancelledOrdersCount = orders.filter((o) => o.status === 'CANCELLED').length;
  const totalRevenue = orders
    .filter((o) => ['DELIVERED', 'PICKED_UP'].includes(o.status))
    .reduce((acc, o) => acc + Number(o.totalAmount), 0);

  const branches = Array.from(new Set(orders.map((o) => o.branch?.name).filter(Boolean)));

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const customerName = `${o.user.firstName} ${o.user.lastName}`.toLowerCase();
    const orderNum = o.orderNumber.toLowerCase();
    const matchesSearch =
      customerName.includes(searchQuery.toLowerCase()) ||
      orderNum.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesBranch = branchFilter === 'ALL' || o.branch?.name === branchFilter;
    const matchesType = typeFilter === 'ALL' || o.orderType === typeFilter;

    return matchesSearch && matchesStatus && matchesBranch && matchesType;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'PICKED_UP':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'REFUNDED':
        return 'bg-violet-500/20 text-violet-400 border border-violet-500/30';
      case 'PLACED':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse';
      case 'ACCEPTED':
      case 'PREPARING':
      case 'READY':
      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-8 p-6 text-[#F8FAFC] bg-[#0F172A] min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Order Command Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor orders lifecycle, alter workflow status, initiate customer refunds, and audit
            remote sales.
          </p>
        </div>
        <Button
          onClick={fetchOrders}
          variant="outline"
          className="flex items-center gap-2 border-border bg-slate-900 text-slate-100 hover:bg-slate-800"
        >
          <RefreshCw size={16} /> Sync Orders
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="p-5 bg-gradient-to-b from-blue-500/10 to-transparent border-blue-500/20 rounded-2xl">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase">
            <span>Total Orders</span>
            <ShoppingBag className="text-blue-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold font-display mt-3">{totalOrdersCount}</p>
          <span className="text-[10px] text-slate-500 block mt-1">Overall logged orders</span>
        </Card>

        <Card className="p-5 bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/20 rounded-2xl">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase">
            <span>Active Orders</span>
            <Clock className="text-amber-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold font-display mt-3">{pendingOrdersCount}</p>
          <span className="text-[10px] text-slate-500 block mt-1">Awaiting completion</span>
        </Card>

        <Card className="p-5 bg-gradient-to-b from-emerald-500/10 to-transparent border-emerald-500/20 rounded-2xl">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase">
            <span>Completed Orders</span>
            <CheckCircle className="text-emerald-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold font-display mt-3">{completedOrdersCount}</p>
          <span className="text-[10px] text-slate-500 block mt-1">Successful deliveries</span>
        </Card>

        <Card className="p-5 bg-gradient-to-b from-rose-500/10 to-transparent border-rose-500/20 rounded-2xl">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase">
            <span>Cancelled Orders</span>
            <XCircle className="text-rose-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold font-display mt-3">{cancelledOrdersCount}</p>
          <span className="text-[10px] text-slate-500 block mt-1">Voided transactions</span>
        </Card>

        <Card className="p-5 bg-gradient-to-b from-lime-500/10 to-transparent border-lime-500/20 rounded-2xl">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase">
            <span>Gross Revenue</span>
            <DollarSign className="text-lime-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold font-display mt-3">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-500 block mt-1">Completed orders value</span>
        </Card>
      </div>

      {/* Main Grid Filters & Listing */}
      <Card className="p-6 bg-[#111827] border-slate-800 rounded-2xl shadow-xl">
        <CardHeader className="border-none p-0 mb-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-display text-white">Live Operations Grid</h3>
            <p className="text-xs text-slate-450">
              Benchmarking, status tracking, and order overrides
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs w-64">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search Order # or Customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white focus:outline-none w-full placeholder-slate-500"
              />
            </div>

            {/* Branch Filter */}
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Branch:</span>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">
                  All Branches
                </option>
                {branches.map((b) => (
                  <option key={b} value={b} className="bg-slate-900">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">
                  All Statuses
                </option>
                <option value="PLACED" className="bg-slate-900">
                  Placed
                </option>
                <option value="ACCEPTED" className="bg-slate-900">
                  Accepted
                </option>
                <option value="PREPARING" className="bg-slate-900">
                  Preparing
                </option>
                <option value="READY" className="bg-slate-900">
                  Ready
                </option>
                <option value="OUT_FOR_DELIVERY" className="bg-slate-900">
                  Out For Delivery
                </option>
                <option value="DELIVERED" className="bg-slate-900">
                  Delivered
                </option>
                <option value="CANCELLED" className="bg-slate-900">
                  Cancelled
                </option>
                <option value="REFUNDED" className="bg-slate-900">
                  Refunded
                </option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">
                  All Types
                </option>
                <option value="DINE_IN" className="bg-slate-900">
                  Dine In
                </option>
                <option value="DELIVERY" className="bg-slate-900">
                  Delivery
                </option>
                <option value="TAKEAWAY" className="bg-slate-900">
                  Takeaway
                </option>
              </select>
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-primary w-8 h-8" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">
            No orders matched the criteria.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans text-left">
              <thead>
                <tr className="border-b border-border/40 text-slate-400 font-semibold text-xs pb-3">
                  <th className="pb-3 pr-2">Order Info</th>
                  <th className="pb-3 pr-2">Date</th>
                  <th className="pb-3 pr-2">Customer</th>
                  <th className="pb-3 pr-2">Outlet</th>
                  <th className="pb-3 pr-2 text-center">Type</th>
                  <th className="pb-3 pr-2 text-center">Status</th>
                  <th className="pb-3 pr-2 text-right">Amount</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-900/20 transition-colors text-xs sm:text-sm"
                  >
                    <td className="py-3 font-semibold text-slate-200">
                      #{order.orderNumber.slice(-8).toUpperCase()}
                      <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <span className="block text-[10px] text-slate-600 mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="py-3">
                      <p className="text-slate-200 font-medium">
                        {order.user.firstName} {order.user.lastName}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{order.user.email}</p>
                    </td>
                    <td className="py-3 text-slate-300 font-medium">
                      {order.branch?.name.replace('ABC - ', '') || 'Central'}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-semibold">
                        {order.orderType}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-emerald-400 font-medium font-mono">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailsModal(true);
                          }}
                          size="sm"
                          className="bg-slate-800 hover:bg-slate-700 border border-border/20 text-slate-200 p-1.5"
                        >
                          <Eye size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Order Details & Audit logs modal */}
      <AnimatePresence>
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-[#F8FAFC]"
            >
              <div className="px-6 py-4 border-b border-border/20 flex justify-between items-center bg-slate-950/40">
                <div>
                  <h2 className="text-lg font-bold font-display text-white">
                    Order Details: #{selectedOrder.orderNumber.toUpperCase()}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Logged on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Details layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Customer & Outlet
                    </h3>
                    <div className="p-3 bg-slate-950/50 rounded-xl border border-border/10 space-y-1 text-sm">
                      <p className="text-slate-200 font-semibold">
                        {selectedOrder.user.firstName} {selectedOrder.user.lastName}
                      </p>
                      <p className="text-slate-400 text-xs">{selectedOrder.user.email}</p>
                      <p className="text-indigo-400 text-xs pt-1.5 border-t border-border/5 mt-1.5">
                        Branch: {selectedOrder.branch?.name || 'Central'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Status Actions
                    </h3>
                    <div className="p-3 bg-slate-950/50 rounded-xl border border-border/10 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Current workflow:</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(selectedOrder.status)}`}
                        >
                          {selectedOrder.status}
                        </span>
                      </div>

                      {selectedOrder.status !== 'CANCELLED' &&
                        selectedOrder.status !== 'REFUNDED' && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/5">
                            {selectedOrder.status === 'PLACED' && (
                              <Button
                                onClick={() => handleUpdateStatus(selectedOrder.id, 'ACCEPTED')}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] py-1 px-2.5"
                              >
                                Accept Order
                              </Button>
                            )}
                            {selectedOrder.status === 'ACCEPTED' && (
                              <Button
                                onClick={() => handleUpdateStatus(selectedOrder.id, 'PREPARING')}
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] py-1 px-2.5"
                              >
                                Start Cooking
                              </Button>
                            )}
                            {selectedOrder.status === 'PREPARING' && (
                              <Button
                                onClick={() => handleUpdateStatus(selectedOrder.id, 'READY')}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] py-1 px-2.5"
                              >
                                Mark Ready
                              </Button>
                            )}
                            {['READY', 'OUT_FOR_DELIVERY'].includes(selectedOrder.status) && (
                              <Button
                                onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] py-1 px-2.5"
                              >
                                Complete Delivery
                              </Button>
                            )}

                            <Button
                              onClick={() => handleCancelOrder(selectedOrder.id)}
                              size="sm"
                              className="bg-rose-500/20 text-rose-500 border border-rose-500/30 hover:bg-rose-500/30 text-[11px] py-1 px-2.5"
                            >
                              Cancel Order
                            </Button>
                          </div>
                        )}

                      {['DELIVERED', 'PICKED_UP'].includes(selectedOrder.status) && (
                        <div className="pt-2 border-t border-border/5">
                          <Button
                            onClick={() => setShowRefundModal(true)}
                            size="sm"
                            className="w-full bg-violet-600/20 text-violet-400 border border-violet-500/30 hover:bg-violet-600/30 text-[11px] py-1"
                          >
                            <Undo size={12} className="inline mr-1" /> Issue Refund
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items details */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Order Items
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-border/10"
                      >
                        <div className="flex items-center gap-3">
                          {item.product.image && (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-10 h-10 object-cover rounded-lg border border-border/10"
                            />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-200">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-slate-300 font-mono">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary calculation */}
                <div className="p-4 bg-slate-950/80 rounded-xl border border-border/20 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="text-slate-300">
                      ₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tax & GST:</span>
                    <span className="text-slate-300">
                      ₹{Number(selectedOrder.tax).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Delivery Fee:</span>
                    <span className="text-slate-300">
                      ₹{Number(selectedOrder.deliveryFee).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {Number(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Promo Discount:</span>
                      <span>-₹{Number(selectedOrder.discount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-border/10 pt-2 flex justify-between font-bold text-sm text-emerald-400">
                    <span>Total Amount Charged:</span>
                    <span>₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Refunds audit */}
                {selectedOrder.refunds && selectedOrder.refunds.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Issued Refunds
                    </h3>
                    <div className="space-y-2">
                      {selectedOrder.refunds.map((refund) => (
                        <div
                          key={refund.id}
                          className="p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl flex justify-between items-center text-xs"
                        >
                          <div>
                            <p className="font-semibold text-slate-300">Refund: ₹{refund.amount}</p>
                            <p className="text-slate-500 text-[10px] mt-0.5">
                              Reason: {refund.reason}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-violet-400 px-2 py-0.5 rounded bg-violet-500/10 uppercase">
                            {refund.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-border/20 flex justify-end bg-slate-950/40">
                <Button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Close Details
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Refund Processing Modal */}
      <AnimatePresence>
        {showRefundModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-[#F8FAFC]"
            >
              <div className="px-6 py-4 border-b border-border/20 flex justify-between items-center bg-slate-950/40">
                <h2 className="text-base font-bold font-display">
                  Issue Refund: #{selectedOrder.orderNumber.toUpperCase()}
                </h2>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleIssueRefund} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Refund Amount (INR)
                  </label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedOrder.totalAmount}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder={`Max: ₹${selectedOrder.totalAmount}`}
                    className="bg-slate-950 border-border/30 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Reason for Refund
                  </label>
                  <textarea
                    required
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Enter reason e.g. Cold food delivered, missing items..."
                    className="w-full bg-slate-950 border border-border/30 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 min-h-[80px]"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                    variant="outline"
                    className="bg-slate-900 border-border/30 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingAction}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {submittingAction ? 'Processing...' : 'Authorize Refund'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
