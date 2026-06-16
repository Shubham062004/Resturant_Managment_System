import { format } from 'date-fns';
import { Download, Search, Leaf, TrendingDown, AlertTriangle, Activity } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

import { useHistoryQuery } from '../../../api/hooks/useHistory';
import { Badge } from '../../../shared/components/ui/Badge';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { formatCurrency } from '../../../shared/utils/currency';


export default function IngredientHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading } = useHistoryQuery('ingredients', { limit: 500 });
  const records = useMemo(() => response?.data || [], [response]);

  // Derived KPIs
  const stats = useMemo(() => {
    if (!records.length) return { totalIngredients: 0, totalMovements: 0, highWaste: 0, estCost: 0 };
    
    let totalMovements = 0;
    records.forEach((r: any) => {
      totalMovements += r.stockMovements?.length || 0;
    });

    return {
      totalIngredients: records.length,
      totalMovements,
      highWaste: 4, // Demo metric
      estCost: 45200 // Demo metric
    };
  }, [records]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    // Top 5 consumed ingredients
    const consumptionMap = records.map((r: any) => ({
      name: r.name,
      consumed: Math.floor(Math.random() * 500) + 50, // Demo calculation for now
      wasted: Math.floor(Math.random() * 50)
    })).sort((a: any, b: any) => b.consumed - a.consumed).slice(0, 7);

    return { consumptionMap };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r: any) => 
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Ingredient Tracking</h1>
          <p className="text-sm text-slate-400 mt-1">Movement logs, consumption trends, and waste monitoring.</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700">
          <Download size={16} />
          <span>Export Movements</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Tracked Ingredients" value={stats.totalIngredients} trend={2.0} icon={Leaf} loading={isLoading} />
        <StatCard title="Total Movements" value={stats.totalMovements.toLocaleString()} trend={15.4} icon={Activity} loading={isLoading} />
        <StatCard title="Est. Cost Impact" value={formatCurrency(stats.estCost)} trend={-3.2} icon={TrendingDown} loading={isLoading} />
        <StatCard title="High Waste Alerts" value={stats.highWaste} trend={-10.5} icon={AlertTriangle} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="bg-slate-900/40 border-border/20">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Most Consumed Ingredients (vs Waste)</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.consumptionMap} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="consumed" name="Consumed Qty" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="wasted" name="Wasted Qty" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/40 border-border/20 flex-1 min-h-[400px]">
        <CardHeader className="border-b border-border/10 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Ingredient Database</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search ingredients..." 
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
                  <th className="px-6 py-4 font-medium">Ingredient</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Unit</th>
                  <th className="px-6 py-4 font-medium">Recorded Movements</th>
                  <th className="px-6 py-4 font-medium">Last Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">No ingredients found.</td></tr>
                ) : (
                  filteredRecords.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{row.name}</td>
                      <td className="px-6 py-4 text-slate-400">
                         <Badge className="bg-slate-800 text-slate-300">{row.category}</Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{row.unit}</td>
                      <td className="px-6 py-4">
                        <span className="text-blue-400 font-bold">{row.stockMovements?.length || 0} logs</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {row.updatedAt ? format(new Date(row.updatedAt), 'dd MMM yyyy') : 'Unknown'}
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
