import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { Download, Search, PackageSearch, ArrowRightLeft, Trash2, GitPullRequest } from 'lucide-react';
import { format } from 'date-fns';
import { useHistoryQuery } from '../../../api/hooks/useHistory';
import { formatCurrency } from '../../../shared/utils/currency';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export default function InventoryHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading } = useHistoryQuery('inventory', { limit: 500 });
  const records = useMemo(() => response?.data || [], [response]);

  // Derived KPIs
  const stats = useMemo(() => {
    if (!records.length) return { requests: 0, movements: 0, waste: 0, value: 0 };
    return {
      requests: records.length,
      movements: 1245, // Demo aggregate metrics across the network
      waste: 2.4, 
      value: 145000 
    };
  }, [records]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const branchMap: Record<string, number> = {};
    records.forEach((r: any) => {
      const branchName = r.branch?.name || 'Unknown';
      branchMap[branchName] = (branchMap[branchName] || 0) + 1;
    });

    const branchComparison = Object.keys(branchMap).map(name => ({
      name: name.replace('ABC ', ''),
      requests: branchMap[name]
    })).sort((a,b) => b.requests - a.requests).slice(0, 5);

    // Mock trend
    const consumptionTrend = [
      { week: 'W1', consumed: 120, restocked: 150 },
      { week: 'W2', consumed: 145, restocked: 100 },
      { week: 'W3', consumed: 180, restocked: 200 },
      { week: 'W4', consumed: 160, restocked: 150 },
    ];

    return { branchComparison, consumptionTrend };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r: any) => 
      r.branch?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requestedBy?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Inventory Logistics</h1>
          <p className="text-sm text-slate-400 mt-1">Multi-branch stock movements, requests, and waste tracking.</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700">
          <Download size={16} />
          <span>Export Logs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Est. Inventory Value" value={formatCurrency(stats.value)} trend={3.2} icon={PackageSearch} loading={isLoading} />
        <StatCard title="Stock Movements" value={stats.movements} trend={12.4} icon={ArrowRightLeft} loading={isLoading} />
        <StatCard title="Total Restock Reqs" value={stats.requests} trend={5.1} icon={GitPullRequest} loading={isLoading} />
        <StatCard title="Avg Waste %" value={`${stats.waste}%`} trend={-0.8} icon={Trash2} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/40 border-border/20">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Branch Request Volume</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.branchComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Bar dataKey="requests" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-border/20">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Consumption vs Restock (Monthly)</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.consumptionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="consumed" name="Consumed Qty" stroke="#f59e0b" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="restocked" name="Restocked Qty" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/40 border-border/20 flex-1 min-h-[400px]">
        <CardHeader className="border-b border-border/10 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Transfer & Restock Requests</h3>
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
                  <th className="px-6 py-4 font-medium">Branch</th>
                  <th className="px-6 py-4 font-medium">Req Date</th>
                  <th className="px-6 py-4 font-medium">Items Requested</th>
                  <th className="px-6 py-4 font-medium">Requested By</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">No inventory requests found.</td></tr>
                ) : (
                  filteredRecords.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{row.branch?.name}</td>
                      <td className="px-6 py-4 text-slate-400">{format(new Date(row.createdAt), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{row.items?.length || 0} items</Badge>
                          <span className="text-xs text-slate-500 truncate max-w-[150px]">{row.items?.[0]?.ingredient?.name} {row.items?.length > 1 ? '...' : ''}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{row.requestedBy?.firstName} {row.requestedBy?.lastName}</td>
                      <td className="px-6 py-4">
                        <Badge className={
                          row.status === 'APPROVED' || row.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          row.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }>{row.status}</Badge>
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
