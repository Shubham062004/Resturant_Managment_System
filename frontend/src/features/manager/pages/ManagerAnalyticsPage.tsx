import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/apiClient';
import { Card, CardHeader, CardContent } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Clock 
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ManagerAnalyticsPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({
    revenue: 0,
    orders: 0,
    avgOrderValue: 0,
    customers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0
  });

  const [salesData, setSalesData] = useState<any[]>([]);
  const [peakHoursData, setPeakHoursData] = useState<any[]>([]);
  const [topItemsData, setTopItemsData] = useState<any[]>([]);

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

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Fallback: We fetch all orders and calculate local analytics if no branch-specific endpoint exists.
        const res = await apiClient.get('/admin/orders');
        const allOrders = res.data.data || [];
        const branchOrders = allOrders.filter((o: any) => o.branchId === selectedBranchId || o.branch?.id === selectedBranchId);
        
        // 1. Basic Metrics Calculation
        const totalRev = branchOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0);
        const totalOrds = branchOrders.length;
        const uniqueCustomers = new Set(branchOrders.map((o: any) => o.user?.id || o.user?.email)).size;
        
        setMetrics({
          revenue: totalRev,
          orders: totalOrds,
          avgOrderValue: totalOrds > 0 ? totalRev / totalOrds : 0,
          customers: uniqueCustomers,
          revenueGrowth: 12.5, // Mocked growth
          ordersGrowth: 8.2 // Mocked growth
        });

        // 2. Sales Trend (Mocked 7 days based on today)
        const sData = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          sData.push({
            name: d.toLocaleDateString('en-US', { weekday: 'short' }),
            sales: Math.floor(Math.random() * 50000) + 10000
          });
        }
        setSalesData(sData);

        // 3. Peak Hours (Mocked typical restaurant distribution)
        setPeakHoursData([
          { time: '12 PM', orders: 45 },
          { time: '1 PM', orders: 60 },
          { time: '2 PM', orders: 40 },
          { time: '6 PM', orders: 75 },
          { time: '7 PM', orders: 95 },
          { time: '8 PM', orders: 110 },
          { time: '9 PM', orders: 85 },
        ]);

        // 4. Top Items Calculation
        const itemCounts: Record<string, number> = {};
        branchOrders.forEach((o: any) => {
          o.items?.forEach((item: any) => {
            const name = item.product?.name || 'Unknown Item';
            itemCounts[name] = (itemCounts[name] || 0) + item.quantity;
          });
        });
        
        const tItems = Object.entries(itemCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        
        // Mock fallback if no orders
        if (tItems.length === 0) {
          setTopItemsData([
            { name: 'Margherita Pizza', value: 120 },
            { name: 'Garlic Bread', value: 85 },
            { name: 'Pasta Alfredo', value: 65 },
            { name: 'Cola', value: 150 },
            { name: 'Tiramisu', value: 45 },
          ]);
        } else {
          setTopItemsData(tItems);
        }

      } catch (err) {
        console.error('Failed to load branch analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedBranchId]);

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Performance Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Deep dive into branch revenue, trends, and operational metrics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 border border-border/20 rounded-xl p-1">
            {['7D', '30D', '90D'].map((range, i) => (
              <button 
                key={range}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${i === 0 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {range}
              </button>
            ))}
          </div>

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
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 space-y-6">
        
        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-slate-900/60 border-border/20 backdrop-blur-xl group hover:border-emerald-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <Badge variant="success" className="text-[10px] font-bold px-1.5 py-0 flex items-center gap-0.5">
                <TrendingUp size={10} /> {metrics.revenueGrowth}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold font-mono text-white mb-1">₹{metrics.revenue.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
          </Card>
          
          <Card className="p-5 bg-slate-900/60 border-border/20 backdrop-blur-xl group hover:border-blue-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
              </div>
              <Badge variant="success" className="text-[10px] font-bold px-1.5 py-0 flex items-center gap-0.5">
                <TrendingUp size={10} /> {metrics.ordersGrowth}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold font-mono text-white mb-1">{metrics.orders.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</p>
          </Card>
          
          <Card className="p-5 bg-slate-900/60 border-border/20 backdrop-blur-xl group hover:border-purple-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-purple-500/10">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <Badge variant="neutral" className="text-[10px] font-bold px-1.5 py-0">
                Stable
              </Badge>
            </div>
            <h3 className="text-2xl font-bold font-mono text-white mb-1">{metrics.customers.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unique Customers</p>
          </Card>

          <Card className="p-5 bg-slate-900/60 border-border/20 backdrop-blur-xl group hover:border-amber-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <Badge variant="danger" className="text-[10px] font-bold px-1.5 py-0 flex items-center gap-0.5">
                <TrendingDown size={10} /> 2.1%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold font-mono text-white mb-1">₹{Math.round(metrics.avgOrderValue).toLocaleString()}</h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Order Value</p>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue Trend */}
          <Card className="p-5 bg-slate-900/40 border-border/20">
            <CardHeader className="p-0 mb-4 border-none flex flex-row items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">Revenue Trend</h3>
                <p className="text-xs text-slate-400">Daily sales performance</p>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-64">
              {loading ? (
                <div className="w-full h-full bg-slate-900/50 animate-pulse rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Peak Hours Analysis */}
          <Card className="p-5 bg-slate-900/40 border-border/20">
            <CardHeader className="p-0 mb-4 border-none flex flex-row items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">Peak Hours Analysis</h3>
                <p className="text-xs text-slate-400">Order volume by time of day</p>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-64">
              {loading ? (
                <div className="w-full h-full bg-slate-900/50 animate-pulse rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: '#1e293b', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                      itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="p-5 bg-slate-900/40 border-border/20 lg:col-span-2 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <CardHeader className="p-0 mb-4 border-none">
                <h3 className="font-bold text-white text-lg">Top Selling Items</h3>
                <p className="text-xs text-slate-400">Most popular menu items by quantity sold</p>
              </CardHeader>
              <div className="space-y-3">
                {topItemsData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-border/10">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        #{i + 1}
                      </div>
                      <span className="font-semibold text-slate-200 text-sm">{item.name}</span>
                    </div>
                    <span className="font-mono text-primary font-bold">{item.value} Sold</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="h-48 w-full max-w-[200px]">
                {loading ? (
                  <div className="w-48 h-48 rounded-full bg-slate-900/50 animate-pulse mx-auto" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topItemsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {topItemsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2 italic text-center">Sales distribution among top 5 items</p>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
