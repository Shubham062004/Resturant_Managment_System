import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/apiClient';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Users,
  ChevronRight,
  Check,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Building,
  Star
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface SummaryData {
  revenueToday: number;
  revenueThisMonth: number;
  ordersToday: number;
  kitchenLoad: number;
  lowStockCount: number;
  pendingRequestsCount: number;
  reservationsCount: number;
  staffOnline: number;
}

interface BranchPerformance {
  branchId: string;
  name: string;
  city: string;
  revenue: number;
  orders: number;
  staffCount: number;
  kitchenQueue: number;
  pendingDeliveries: number;
  inventoryHealth: string;
  customerRating: number;
}



interface LowStockAlert {
  id: string;
  ingredientName: string;
  branchName: string;
  quantity: number;
  unit: string;
}

interface InventoryRequestItem {
  id?: string;
  ingredientId: string;
  ingredientName?: string;
  requestedQuantity: number;
  approvedQuantity: number;
}

interface InventoryRequest {
  id: string;
  branchId: string;
  branch: { name: string };
  status: string;
  notes?: string;
  createdAt: string;
  items: Array<{
    id: string;
    ingredientId: string;
    ingredient: { name: string; unit: string };
    requestedQuantity: number;
    approvedQuantity: number | null;
  }>;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

const COLORS = ['#FF8C42', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6'];

export default function OwnerDashboardPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [branches, setBranches] = useState<BranchPerformance[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  
  // Inventory Approval States
  const [inventoryRequests, setInventoryRequests] = useState<InventoryRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<InventoryRequest | null>(null);
  const [approvalItems, setApprovalItems] = useState<InventoryRequestItem[]>([]);
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  const [appendQuantity, setAppendQuantity] = useState<number>(10);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ownerRes, requestRes, ingredientRes] = await Promise.all([
        apiClient.get('/api/v1/admin/analytics/owner-dashboard'),
        apiClient.get('/api/v1/inventory/requests'),
        apiClient.get('/api/v1/inventory/ingredients')
      ]);

      const data = ownerRes.data.data;
      setSummary(data.summary);
      setBranches(data.branchPerformance);
      setLowStockAlerts(data.lowStockAlerts);

      // Filter for PENDING inventory requests
      const allRequests = requestRes.data.data.requests || [];
      const pendingReqs = allRequests.filter((r: any) => r.status === 'PENDING');
      setInventoryRequests(pendingReqs);

      setIngredients(ingredientRes.data.data.ingredients || []);
    } catch (error) {
      console.error('Error fetching owner dashboard data:', error);
      toast.error('Failed to retrieve dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const startApprovalFlow = (request: InventoryRequest) => {
    setActiveRequest(request);
    setApprovalNotes(request.notes || '');
    setApprovalItems(
      request.items.map(item => ({
        id: item.id,
        ingredientId: item.ingredientId,
        ingredientName: item.ingredient.name,
        requestedQuantity: item.requestedQuantity,
        approvedQuantity: item.requestedQuantity // default to requested quantity
      }))
    );
  };

  const handleUpdateItemQuantity = (index: number, val: number) => {
    const updated = [...approvalItems];
    updated[index].approvedQuantity = Math.max(0, val);
    setApprovalItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...approvalItems];
    updated.splice(index, 1);
    setApprovalItems(updated);
  };

  const handleAppendIngredient = () => {
    if (!selectedIngredientId) return;
    const ing = ingredients.find(i => i.id === selectedIngredientId);
    if (!ing) return;
    
    // Check if ingredient already in list
    if (approvalItems.find(item => item.ingredientId === selectedIngredientId)) {
      toast.warning('Ingredient is already added to the request list.');
      return;
    }

    setApprovalItems([
      ...approvalItems,
      {
        ingredientId: selectedIngredientId,
        ingredientName: ing.name,
        requestedQuantity: 0,
        approvedQuantity: appendQuantity
      }
    ]);
    setSelectedIngredientId('');
  };

  const handleProcessRequest = async (status: 'APPROVED' | 'REJECTED') => {
    if (!activeRequest) return;
    try {
      const payload: any = {
        status,
        notes: approvalNotes
      };

      if (status === 'APPROVED') {
        payload.items = approvalItems.map(item => ({
          id: item.id,
          ingredientId: item.ingredientId,
          approvedQuantity: item.approvedQuantity
        }));
      }

      await apiClient.patch(`/api/v1/inventory/requests/${activeRequest.id}/approve`, payload);
      toast.success(status === 'APPROVED' ? `Replenishment request approved for ${activeRequest.branch.name}` : `Replenishment request rejected for ${activeRequest.branch.name}`);
      
      setActiveRequest(null);
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Could not update request status.');
    }
  };

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <RefreshCw className="animate-spin text-primary w-12 h-12 mb-4" />
        <p className="font-display font-medium tracking-wide">Assembling Executive Dashboard...</p>
      </div>
    );
  }

  const kpis = [
    {
      title: "Today's Net Revenue",
      value: `₹${summary?.revenueToday.toLocaleString('en-IN') || 0}`,
      desc: 'Live branch transactions',
      icon: <DollarSign className="text-emerald-500 w-6 h-6" />,
      bg: 'from-emerald-500/10 to-teal-500/5',
      border: 'border-emerald-500/20'
    },
    {
      title: "Monthly Consolidated Sales",
      value: `₹${summary?.revenueThisMonth.toLocaleString('en-IN') || 0}`,
      desc: 'May 2026 Historical Performance',
      icon: <TrendingUp className="text-blue-500 w-6 h-6" />,
      bg: 'from-blue-500/10 to-indigo-500/5',
      border: 'border-blue-500/20'
    },
    {
      title: "Today's Orders",
      value: summary?.ordersToday || 0,
      desc: 'Direct walk-in + orders',
      icon: <ShoppingBag className="text-orange-500 w-6 h-6" />,
      bg: 'from-orange-500/10 to-amber-500/5',
      border: 'border-orange-500/20'
    },
    {
      title: 'Active Kitchen Load',
      value: summary?.kitchenLoad || 0,
      desc: 'Ongoing preparation items',
      icon: <Clock className="text-rose-500 w-6 h-6" />,
      bg: 'from-rose-500/10 to-pink-500/5',
      border: 'border-rose-500/20'
    },
    {
      title: 'Low Stock SKU Alerts',
      value: summary?.lowStockCount || 0,
      desc: 'Requires branch restock',
      icon: <AlertTriangle className="text-yellow-500 w-6 h-6" />,
      bg: 'from-yellow-500/10 to-amber-500/5',
      border: 'border-yellow-500/20'
    },
    {
      title: 'Active Operations Staff',
      value: summary?.staffOnline || 0,
      desc: 'On-shift registered accounts',
      icon: <Users className="text-purple-500 w-6 h-6" />,
      bg: 'from-purple-500/10 to-violet-500/5',
      border: 'border-purple-500/20'
    }
  ];

  return (
    <div className="space-y-8 p-6 text-white bg-slate-950 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Executive Control Tower
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-sans">
            Consolidated operations metrics and branch performance dashboard for ABC Restaurant Management.
          </p>
        </div>
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          className="flex items-center gap-2 border-border bg-slate-900 text-slate-100 hover:bg-slate-800"
        >
          <RefreshCw size={16} /> Refresh Metrics
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`glass-card p-5 rounded-2xl border ${kpi.border} bg-gradient-to-b ${kpi.bg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 font-sans tracking-wide uppercase">
                {kpi.title}
              </span>
              <div className="p-2 bg-slate-900/60 rounded-xl">{kpi.icon}</div>
            </div>
            <p className="text-2xl font-bold font-display mt-3 text-white">{kpi.value}</p>
            <span className="text-[11px] text-slate-500 mt-1 block font-sans font-medium">
              {kpi.desc}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance bar chart */}
        <Card className="lg:col-span-2 border-border/40 bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden p-6">
          <CardHeader className="border-none p-0 mb-6">
            <h3 className="text-lg font-bold font-display">Branch Revenue Performance</h3>
            <p className="text-xs text-slate-400 font-sans">Comparison of sales across active outlets for May 2026</p>
          </CardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branches}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar name="Revenue (₹)" dataKey="revenue" fill="#FF8C42" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order distribution pie chart */}
        <Card className="border-border/40 bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden p-6">
          <CardHeader className="border-none p-0 mb-6">
            <h3 className="text-lg font-bold font-display">Order Volume Share</h3>
            <p className="text-xs text-slate-400 font-sans">Branch order distribution breakdown</p>
          </CardHeader>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={branches}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="orders"
                >
                  {branches.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Operations Status Table */}
        <Card className="border-border/40 bg-slate-900/40 backdrop-blur-md rounded-2xl p-6">
          <CardHeader className="border-none p-0 mb-6">
            <h3 className="text-lg font-bold font-display">Live Operations Monitor</h3>
            <p className="text-xs text-slate-400 font-sans">Active queues, inventory, and branch ratings</p>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-left border-b border-border/40 text-slate-400 font-semibold pb-3">
                  <th className="pb-3 pr-2">Branch</th>
                  <th className="pb-3 pr-2">Location</th>
                  <th className="pb-3 pr-2">Active Kitchen</th>
                  <th className="pb-3 pr-2">Deliveries</th>
                  <th className="pb-3 pr-2 text-center">Stock</th>
                  <th className="pb-3 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {branches.map((b) => (
                  <tr key={b.branchId} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-3 font-semibold text-slate-200">{b.name}</td>
                    <td className="py-3 text-slate-400">{b.city}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        b.kitchenQueue > 10 ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {b.kitchenQueue} active
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{b.pendingDeliveries} dispatch</td>
                    <td className="py-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        b.inventoryHealth === 'Low Stock' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                      }`}>
                        {b.inventoryHealth}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium text-amber-400">
                      <div className="flex items-center justify-end gap-1">
                        <Star size={14} fill="currentColor" />
                        <span>{b.customerRating.toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Low Stock SKUs and Top Products */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <Card className="border-border/40 bg-slate-900/40 backdrop-blur-md rounded-2xl p-6">
            <CardHeader className="border-none p-0 mb-4 flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-display">Low Stock SKUs</h3>
                <p className="text-xs text-slate-400 font-sans">Immediate branch replenishment recommended</p>
              </div>
              <AlertTriangle className="text-yellow-500 w-5 h-5" />
            </CardHeader>
            <div className="space-y-3">
              {lowStockAlerts.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">All branches are fully stocked.</p>
              ) : (
                lowStockAlerts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-border/20">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{item.ingredientName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Outlet: {item.branchName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-yellow-500">{item.quantity}</span>
                      <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Inventory Request Pipeline (Approval flow) */}
      <Card className="border-border/40 bg-slate-900/40 backdrop-blur-md rounded-2xl p-6">
        <CardHeader className="border-none p-0 mb-6 flex flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display">Branch Replenishment Requests</h3>
            <p className="text-xs text-slate-400 font-sans">Review, modify, and authorize branch restock pipelines</p>
          </div>
          <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold font-sans">
            {inventoryRequests.length} Pending
          </span>
        </CardHeader>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* List of pending requests */}
          <div className="xl:col-span-1 border-r border-border/20 pr-0 xl:pr-6 space-y-4">
            {inventoryRequests.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center font-sans">No pending replenishment requests.</p>
            ) : (
              inventoryRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => startApprovalFlow(req)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    activeRequest?.id === req.id
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border/20 bg-slate-950/50 hover:bg-slate-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                      <Building size={14} className="text-primary" /> {req.branch.name.replace('Oven Xpress - ', '')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {req.notes && (
                    <p className="text-xs text-slate-400 mt-2 truncate italic">&quot;{req.notes}&quot;</p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{req.items.length} items requested</span>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Active Approval Editor Panel */}
          <div className="xl:col-span-2">
            <AnimatePresence mode="wait">
              {activeRequest ? (
                <motion.div
                  key={activeRequest.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-start border-b border-border/20 pb-4">
                    <div>
                      <h4 className="text-base font-semibold text-slate-200">
                        Authorize Request for: {activeRequest.branch.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">Request ID: {activeRequest.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleProcessRequest('REJECTED')}
                        className="bg-rose-500/20 text-rose-500 border border-rose-500/30 hover:bg-rose-500/30"
                      >
                        <X size={14} className="mr-1" /> Reject Request
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleProcessRequest('APPROVED')}
                        className="bg-green-500 text-white hover:bg-green-600"
                      >
                        <Check size={14} className="mr-1" /> Approve Request
                      </Button>
                    </div>
                  </div>

                  {/* List of items in active request */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Stock List</h5>
                    <div className="space-y-3">
                      {approvalItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-border/20 gap-3"
                        >
                          <div className="flex-1">
                            <span className="text-sm font-semibold text-slate-200">{item.ingredientName}</span>
                            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                              <span>Requested: {item.requestedQuantity}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-32">
                              <Input
                                type="number"
                                value={item.approvedQuantity}
                                onChange={(e) => handleUpdateItemQuantity(idx, parseFloat(e.target.value) || 0)}
                                className="bg-slate-900 border-border/30 text-white py-1 text-center font-bold text-sm"
                              />
                            </div>
                            <Button
                              onClick={() => handleRemoveItem(idx)}
                              className="p-2 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-500 rounded-lg border border-border/10"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Append Ingredients Panel */}
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-border/10 space-y-3">
                    <h5 className="text-xs font-semibold text-slate-300">Append New Ingredient to Request</h5>
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="flex-1">
                        <select
                          value={selectedIngredientId}
                          onChange={(e) => setSelectedIngredientId(e.target.value)}
                          className="w-full bg-slate-900 border border-border/30 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary"
                        >
                          <option value="">-- Select Ingredient --</option>
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} ({ing.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full md:w-32">
                        <Input
                          type="number"
                          value={appendQuantity}
                          onChange={(e) => setAppendQuantity(parseFloat(e.target.value) || 10)}
                          placeholder="Quantity"
                          className="bg-slate-900 border-border/30 text-center"
                        />
                      </div>
                      <Button
                        onClick={handleAppendIngredient}
                        className="bg-slate-800 text-slate-100 hover:bg-slate-700 border border-border/20 flex items-center justify-center gap-1.5"
                      >
                        <Plus size={16} /> Append
                      </Button>
                    </div>
                  </div>

                  {/* Approval Notes */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Approval Notes</h5>
                    <textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      placeholder="Add official notes or delivery remarks..."
                      className="w-full h-20 bg-slate-950/80 border border-border/20 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-primary"
                    />
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 border border-dashed border-border/20 rounded-2xl bg-slate-950/20 text-slate-500">
                  <RefreshCw size={28} className="text-slate-600 animate-pulse mb-3" />
                  <p className="text-sm font-sans">Select a replenishment request from the queue to process.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </div>
  );
}
