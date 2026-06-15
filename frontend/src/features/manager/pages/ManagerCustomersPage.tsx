import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Star,
  AlertTriangle,
  ShoppingBag,
  History,
  MessageSquare,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import apiClient from '../../../services/apiClient';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';

export default function ManagerCustomersPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await apiClient.get('/catalog/branches');
        const b = res.data.data.branches || [];
        setBranches(b);
        if (b.length > 0) setSelectedBranchId(b[0].id);
      } catch (err) {
        console.error('Failed to load branches', err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedBranchId) return;

    const fetchBranchCustomers = async () => {
      try {
        setLoading(true);
        // We fetch all orders and derive customers.
        const res = await apiClient.get('/admin/orders');
        const allOrders = res.data.data || [];
        const branchOrders = allOrders.filter(
          (o: any) => o.branchId === selectedBranchId || o.branch?.id === selectedBranchId,
        );

        setOrders(branchOrders);

        // Extract unique customers and aggregate data
        const customerMap = new Map<string, any>();

        branchOrders.forEach((o: any) => {
          if (!o.user) return;
          const uid = o.user.id || o.user.email;
          if (!customerMap.has(uid)) {
            customerMap.set(uid, {
              id: uid,
              firstName: o.user.firstName,
              lastName: o.user.lastName,
              email: o.user.email,
              phone: o.user.phone,
              orderCount: 0,
              totalSpent: 0,
              recentOrders: [],
              feedback: o.user.feedback || [], // Mocking feedback
            });
          }
          const c = customerMap.get(uid);
          c.orderCount += 1;
          c.totalSpent += Number(o.totalAmount);
          c.recentOrders.push(o);
        });

        setCustomers(Array.from(customerMap.values()));
      } catch (err) {
        console.error('Failed to load branch customers', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranchCustomers();
  }, [selectedBranchId]);

  const filteredCustomers = customers
    .filter((c) => {
      const nameMatch = `${c.firstName} ${c.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const emailMatch = c.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || emailMatch;
    })
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">
            Customer Relations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage local branch customers, feedback, and issue resolution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-border/30 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-border/30 rounded-xl px-4 py-2">
            <span className="text-slate-400 text-xs">Branch:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer appearance-none"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Customer Directory List */}
        <Card className="lg:col-span-1 bg-slate-900/40 border-border/20 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-border/10 bg-slate-900/60 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-white">Branch Customers</h3>
            <Badge className="bg-indigo-500/20 text-indigo-400 font-bold">
              {filteredCustomers.length}
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-900/50 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                <Users size={32} className="mb-2" />
                <p className="text-xs font-semibold">No customers found.</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-indigo-600/20 border-indigo-500/50'
                      : 'bg-slate-950/60 border-border/10 hover:border-indigo-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-200">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {customer.email || 'No email'}
                      </p>
                    </div>
                    {customer.totalSpent > 5000 && (
                      <Star size={14} className="text-amber-400 fill-amber-400/20" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShoppingBag size={12} className="text-emerald-500" /> {customer.orderCount}{' '}
                      Orders
                    </span>
                    <span className="font-mono">₹{customer.totalSpent.toLocaleString()} Spent</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Customer Details Panel */}
        <Card className="lg:col-span-2 bg-slate-900/40 border-border/20 flex flex-col h-full overflow-hidden">
          {!selectedCustomer ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
              <Users size={64} className="mb-4" />
              <p className="font-semibold">Select a customer to view history & feedback.</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-border/20 bg-slate-900/80 backdrop-blur-md shrink-0 flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <span className="text-2xl font-bold text-indigo-400">
                      {selectedCustomer.firstName[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-display text-white">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      {selectedCustomer.email} • {selectedCustomer.phone || 'No Phone'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={selectedCustomer.totalSpent > 5000 ? 'warning' : 'neutral'}
                    className="text-xs font-bold px-3 py-1"
                  >
                    {selectedCustomer.totalSpent > 5000 ? 'VIP Customer' : 'Standard'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                  >
                    <MessageSquare size={12} className="mr-2" /> Send Message
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-border/10">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-slate-200">
                      {selectedCustomer.orderCount}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-border/10">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Lifetime Value
                    </p>
                    <p className="text-2xl font-bold text-emerald-400 font-mono">
                      ₹{selectedCustomer.totalSpent.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-border/10">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Avg Order Val
                    </p>
                    <p className="text-2xl font-bold text-slate-200 font-mono">
                      ₹
                      {Math.round(
                        selectedCustomer.totalSpent / selectedCustomer.orderCount,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Feedback / Complaints (Mocked representation if array exists) */}
                {selectedCustomer.feedback?.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                      <AlertTriangle className="text-rose-500 w-4 h-4" /> Reported Issues
                    </h3>
                    <div className="space-y-3">
                      {selectedCustomer.feedback.map((fb: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/20"
                        >
                          <p className="text-sm text-slate-300">{fb.message}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] text-slate-500">
                              {new Date(fb.date).toLocaleDateString()}
                            </span>
                            <Badge
                              className={`text-[10px] ${fb.resolved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
                            >
                              {fb.resolved ? 'Resolved' : 'Requires Attention'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order History */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                    <History className="text-sky-500 w-4 h-4" /> Order History at this Branch
                  </h3>
                  <div className="space-y-3">
                    {selectedCustomer.recentOrders
                      .sort(
                        (a: any, b: any) =>
                          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                      )
                      .slice(0, 5)
                      .map((order: any) => (
                        <div
                          key={order.id}
                          className="p-4 bg-slate-950/60 rounded-xl border border-border/10 flex justify-between items-center group hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-slate-300">
                                #{order.orderNumber.slice(-6).toUpperCase()}
                              </span>
                              <Badge className="text-[9px] bg-slate-800 text-slate-400 border-none px-1.5 py-0.5">
                                {order.orderType}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-400 font-mono">
                              ₹{order.totalAmount.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">{order.status}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
