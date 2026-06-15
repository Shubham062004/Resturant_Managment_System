import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { Download, Search, Truck, DollarSign, Star, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useHistoryQuery } from '../../../../api/hooks/useHistory';
import { formatCurrency } from '../../../../shared/utils/currency';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function SupplierHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading } = useHistoryQuery('suppliers', { limit: 500 });
  const records = useMemo(() => response?.data || [], [response]);

  // Derived KPIs
  const stats = useMemo(() => {
    if (!records.length) return { totalSpend: 0, orders: 0, onTime: 0, avgRating: 0 };
    
    let totalOrders = 0;
    let sumRating = 0;
    records.forEach((r: any) => {
      totalOrders += r.purchaseOrders?.length || 0;
      sumRating += r.rating || 0;
    });

    return {
      totalSpend: 1250000, // Mocked total supplier spend
      orders: totalOrders,
      onTime: 92.5, // Mocked %
      avgRating: sumRating / (records.length || 1)
    };
  }, [records]);

  // Chart Data
  const chartData = useMemo(() => {
    // Supplier Ranking by Orders
    const rankingMap = records.map((r: any) => ({
      name: r.name,
      orders: r.purchaseOrders?.length || 0
    })).sort((a, b) => b.orders - a.orders).slice(0, 5);

    // Mock Monthly Spend
    const monthlySpend = [
      { month: 'Jan', spend: 120000 },
      { month: 'Feb', spend: 145000 },
      { month: 'Mar', spend: 110000 },
      { month: 'Apr', spend: 180000 },
      { month: 'May', spend: 160000 },
      { month: 'Jun', spend: 195000 }
    ];

    return { rankingMap, monthlySpend };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r: any) => 
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Supplier Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Vendor performance, purchasing trends, and delivery tracking.</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700">
          <Download size={16} />
          <span>Export Vendor Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Supplier Spend" value={formatCurrency(stats.totalSpend)} trend={5.2} icon={DollarSign} loading={isLoading} />
        <StatCard title="Total Purchase Orders" value={stats.orders} trend={2.1} icon={Truck} loading={isLoading} />
        <StatCard title="On-Time Delivery" value={`${stats.onTime}%`} trend={1.5} icon={Clock} loading={isLoading} />
        <StatCard title="Avg Vendor Rating" value={`${stats.avgRating.toFixed(1)} ★`} trend={-0.2} icon={Star} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/40 border-border/20">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Monthly Purchasing Spend</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.monthlySpend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="spend" name="Spend" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-border/20">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Top Suppliers by Volume</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.rankingMap} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} hide />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} cursor={{fill: '#1e293b'}}/>
                  <Bar dataKey="orders" name="Purchase Orders" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/40 border-border/20 flex-1 min-h-[400px]">
        <CardHeader className="border-b border-border/10 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Vendor Directory</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search vendors..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50" 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
             <div className="h-64 flex items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
             </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 sticky top-0 border-b border-border/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Supplier</th>
                  <th className="px-6 py-4 font-medium">Contact Person</th>
                  <th className="px-6 py-4 font-medium">Total POs</th>
                  <th className="px-6 py-4 font-medium">Rating</th>
                  <th className="px-6 py-4 font-medium">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">No suppliers found.</td></tr>
                ) : (
                  filteredRecords.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{row.name}</div>
                        <div className="text-xs text-slate-400">{row.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{row.contactPerson || 'N/A'}</td>
                      <td className="px-6 py-4 font-bold text-blue-400">{row.purchaseOrders?.length || 0}</td>
                      <td className="px-6 py-4">
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                          {row.rating?.toFixed(1) || '5.0'} ★
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {row.createdAt ? format(new Date(row.createdAt), 'MMM yyyy') : 'Unknown'}
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
