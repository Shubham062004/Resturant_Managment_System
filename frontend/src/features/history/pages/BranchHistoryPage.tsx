import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { Download, Search, MapPin, Store, Users, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { useHistoryQuery } from '../../../../api/hooks/useHistory';
import { formatCurrency } from '../../../../shared/utils/currency';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function BranchHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading } = useHistoryQuery('branches', { limit: 100 });
  
  // Filter out any Lucknow references to strictly show Delhi branches as requested
  const records = useMemo(() => {
    const data = response?.data || [];
    return data.filter((r: any) => r.city?.toLowerCase() !== 'lucknow' && r.address?.toLowerCase().indexOf('lucknow') === -1);
  }, [response]);

  // Derived KPIs
  const stats = useMemo(() => {
    if (!records.length) return { totalRevenue: 0, totalOrders: 0, branches: 0 };
    
    let totalOrders = 0;
    records.forEach((r: any) => {
      totalOrders += r._count?.Order || 0;
    });

    return {
      totalRevenue: totalOrders * 450, // Mocked revenue based on order volume
      totalOrders,
      branches: records.length
    };
  }, [records]);

  // Chart Data
  const chartData = useMemo(() => {
    const branchComparison = records.map((r: any) => ({
      name: r.name.replace('ABC ', ''),
      orders: r._count?.Order || 0,
      revenue: (r._count?.Order || 0) * 450 // Mocked AOV of 450 INR
    })).sort((a, b) => b.orders - a.orders);

    return { branchComparison };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r: any) => 
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Branch Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Multi-location performance, revenue, and Delhi NCR footprint.</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700">
          <Download size={16} />
          <span>Export Network Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Network Revenue" value={formatCurrency(stats.totalRevenue)} trend={18.2} icon={Store} loading={isLoading} />
        <StatCard title="Total Network Orders" value={stats.totalOrders.toLocaleString()} trend={9.5} icon={ShoppingBag} loading={isLoading} />
        <StatCard title="Total Customers" value={(stats.totalOrders * 0.8).toFixed(0)} trend={12.1} icon={Users} loading={isLoading} />
        <StatCard title="Active Branches (Delhi)" value={stats.branches} trend={0} icon={MapPin} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900/40 border-border/20 lg:col-span-2">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Revenue by Branch</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.branchComparison} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Bar dataKey="revenue" name="Estimated Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-border/20">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Order Distribution</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData.branchComparison} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="orders" nameKey="name">
                    {chartData.branchComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/40 border-border/20 flex-1 min-h-[400px]">
        <CardHeader className="border-b border-border/10 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Delhi NCR Locations</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search branches..." 
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
                  <th className="px-6 py-4 font-medium">Branch Location</th>
                  <th className="px-6 py-4 font-medium">City</th>
                  <th className="px-6 py-4 font-medium">Processed Orders</th>
                  <th className="px-6 py-4 font-medium">Est. Revenue</th>
                  <th className="px-6 py-4 font-medium">Active Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">No branches found matching criteria.</td></tr>
                ) : (
                  filteredRecords.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400">
                            <MapPin size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-white">{row.name}</div>
                            <div className="text-xs text-slate-400 max-w-[200px] truncate">{row.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                         <Badge className="bg-slate-800 text-slate-300">{row.city}</Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-400">
                         {row._count?.Order || 0}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">
                         {formatCurrency((row._count?.Order || 0) * 450)}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                         {row._count?.workAssignments || 0} employees
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
