import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { Download, Search, Filter, ShoppingCart, DollarSign, Activity, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useHistoryQuery } from '../../../api/hooks/useHistory';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

import { formatCurrency } from '../../../shared/utils/currency';

export default function OrderHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch 500 records to have enough data for charts, standard pagination limits apply
  const { data: response, isLoading } = useHistoryQuery('orders', { limit: 500 });
  
  const records = useMemo(() => response?.data || [], [response]);

  // Derived Statistics
  const stats = useMemo(() => {
    if (!records.length) return { revenue: 0, count: 0, avg: 0, refunded: 0 };
    const rev = records.reduce((acc: number, r: any) => acc + Number(r.totalAmount || 0), 0);
    const ref = records.filter((r:any) => r.status === 'REFUNDED').length;
    return {
      revenue: rev,
      count: records.length,
      avg: rev / records.length,
      refunded: ref
    };
  }, [records]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {};

    records.forEach((r: any) => {
      // Daily Revenue
      const dateStr = r.createdAt ? format(parseISO(r.createdAt), 'MMM dd') : 'Unknown';
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + Number(r.totalAmount || 0);

      // Status Distribution
      const stat = r.status || 'UNKNOWN';
      statusMap[stat] = (statusMap[stat] || 0) + 1;
    });

    const dailyTrend = Object.keys(dailyMap).slice(-14).map(date => ({
      date,
      revenue: parseFloat(dailyMap[date].toFixed(2))
    }));

    const statusBreakdown = Object.keys(statusMap).map(status => ({
      status,
      count: statusMap[status]
    }));

    return { dailyTrend, statusBreakdown };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r: any) => {
      const matchSearch = r.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter ? r.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [records, searchTerm, statusFilter]);

  const exportCSV = () => {
    const headers = "Order ID,Customer,Branch,Date,Amount,Status,Payment Method\\n";
    const rows = filteredRecords.map((o: any) => 
      `${o.id},${o.customer?.firstName || 'Guest'} ${o.customer?.lastName || ''},${o.branch?.name || 'Main'},${new Date(o.createdAt).toLocaleDateString()},${o.totalAmount},${o.status},${o.paymentMethod || 'CARD'}`
    ).join("\\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Order_Analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Order Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Enterprise dashboard for order historical data.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={exportCSV} className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700">
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Historical Revenue" 
          value={formatCurrency(stats.revenue)} 
          trend={12.5} 
          icon={DollarSign} 
          loading={isLoading}
        />
        <StatCard 
          title="Total Orders" 
          value={stats.count.toLocaleString()} 
          trend={8.2} 
          icon={ShoppingCart} 
          loading={isLoading}
        />
        <StatCard 
          title="Average Order Value" 
          value={formatCurrency(stats.avg)} 
          trend={-1.4} 
          icon={Activity} 
          loading={isLoading}
        />
        <StatCard 
          title="Refunded/Voided" 
          value={stats.refunded} 
          trend={-5.0} 
          icon={XCircle} 
          loading={isLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900/40 border-border/20 lg:col-span-2">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Revenue Trend (Last 14 Days)</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.dailyTrend}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-border/20">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Order Status Breakdown</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.statusBreakdown} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} hide />
                  <YAxis dataKey="status" type="category" stroke="#94a3b8" fontSize={10} width={80} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} cursor={{fill: '#1e293b'}}/>
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Grid */}
      <Card className="bg-slate-900/40 border-border/20 flex-1 flex flex-col min-h-[400px]">
        <CardHeader className="border-b border-border/10 bg-slate-900/50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <h3 className="font-bold text-white">All Orders</h3>
            <div className="flex items-center space-x-3">
               <div className="relative w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search by ID or Customer..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full bg-slate-950 border border-slate-800 text-white rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors" 
                  />
               </div>
               <select 
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="bg-slate-950 border border-slate-800 text-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
               >
                 <option value="">All Statuses</option>
                 <option value="DELIVERED">Delivered</option>
                 <option value="PREPARING">Preparing</option>
                 <option value="PENDING">Pending</option>
                 <option value="REFUNDED">Refunded</option>
               </select>
               <button className="p-2 bg-slate-800 rounded-md border border-slate-700 text-slate-300 hover:text-white transition-colors">
                 <Filter size={16}/>
               </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto flex-1">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
              <p className="text-slate-500 text-sm">Loading enterprise data...</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 sticky top-0 z-10 border-b border-border/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Branch</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                          <Search className="text-slate-500" size={24} />
                        </div>
                        <p className="text-slate-300 font-medium text-lg">No orders found</p>
                        <p className="text-slate-500 mt-1">Try adjusting your filters or search term.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.slice(0, 50).map((order: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-400 text-xs group-hover:text-primary transition-colors cursor-pointer">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-slate-200 font-medium">
                        {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Guest User'}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{order.branch?.name || 'Main Branch'}</td>
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-6 py-4 text-slate-300">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${order.paymentMethod === 'CARD' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                          <span>{order.paymentMethod || 'CARD'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={
                          order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          order.status === 'REFUNDED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }>
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
