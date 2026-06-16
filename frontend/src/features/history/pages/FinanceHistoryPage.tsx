import { format } from 'date-fns';
import { Download, Search, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

import { useHistoryQuery } from '../../../api/hooks/useHistory';
import { Badge } from '../../../shared/components/ui/Badge';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { formatCurrency } from '../../../shared/utils/currency';


const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

export default function FinanceHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading } = useHistoryQuery('finance', { limit: 500 });
  
  // The finance API currently returns aggregated metrics instead of a flat list
  const metrics = useMemo(() => response?.data || {}, [response]);

  // Derived KPIs
  const stats = useMemo(() => {
    const revenue = metrics.totalRevenue || 0;
    const inventoryCost = metrics.totalCost || 0;
    const payrollCost = 1450000; // Mocked payroll
    const tax = revenue * 0.18; // 18% GST mock
    const refunds = revenue * 0.02; // 2% refunds
    const expenses = inventoryCost + payrollCost + tax + refunds;
    const netProfit = revenue - expenses;

    return { revenue, expenses, payrollCost, tax, refunds, netProfit };
  }, [metrics]);

  // Chart Data
  const chartData = useMemo(() => {
    // Mock Profit Trend
    const profitTrend = [
      { month: 'Jan', revenue: 450000, profit: 120000 },
      { month: 'Feb', revenue: 480000, profit: 135000 },
      { month: 'Mar', revenue: 510000, profit: 140000 },
      { month: 'Apr', revenue: 490000, profit: 125000 },
      { month: 'May', revenue: 540000, profit: 160000 },
      { month: 'Jun', revenue: 580000, profit: 195000 }
    ];

    const expenseBreakdown = [
      { name: 'Inventory', value: stats.expenses * 0.4 },
      { name: 'Payroll', value: stats.payrollCost },
      { name: 'Taxes', value: stats.tax },
      { name: 'Refunds/Ops', value: stats.refunds }
    ];

    // Mocked Ledger for the table
    const ledger = [
      { date: new Date('2026-06-15'), category: 'INCOME', description: 'Daily Branch Settlement', amount: 45000, branch: 'Delhi Main' },
      { date: new Date('2026-06-15'), category: 'EXPENSE', description: 'Supplier Payment (Fresh Produce)', amount: -12500, branch: 'HQ' },
      { date: new Date('2026-06-14'), category: 'PAYROLL', description: 'Staff Salary Disbursement', amount: -245000, branch: 'All Branches' },
      { date: new Date('2026-06-14'), category: 'TAX', description: 'GST Remittance', amount: -42000, branch: 'HQ' },
      { date: new Date('2026-06-13'), category: 'INCOME', description: 'Daily Branch Settlement', amount: 51000, branch: 'South Delhi' },
    ];

    return { profitTrend, expenseBreakdown, ledger };
  }, [stats]);

  const filteredLedger = useMemo(() => {
    return chartData.ledger.filter((r: any) => 
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.branch?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chartData.ledger, searchTerm]);

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Financial Overview</h1>
          <p className="text-sm text-slate-400 mt-1">P&L statements, expense tracking, and revenue forecasting.</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700">
          <Download size={16} />
          <span>Export Ledger</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard className="col-span-2" title="Total Revenue" value={formatCurrency(stats.revenue)} trend={12.4} icon={TrendingUp} loading={isLoading} />
        <StatCard className="col-span-2" title="Total Expenses" value={formatCurrency(stats.expenses)} trend={5.2} icon={TrendingDown} loading={isLoading} />
        <StatCard className="col-span-2" title="Net Profit" value={formatCurrency(stats.netProfit)} trend={8.1} icon={DollarSign} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900/40 border-border/20 lg:col-span-2">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Revenue vs Profit (6 Months)</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.profitTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                  <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-border/20">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Expense Breakdown</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData.expenseBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(val: any) => formatCurrency(val)} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/40 border-border/20 flex-1 min-h-[400px]">
        <CardHeader className="border-b border-border/10 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">General Ledger (Recent)</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
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
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Branch</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredLedger.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">No transactions found.</td></tr>
                ) : (
                  filteredLedger.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-400">
                        {format(row.date, 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={
                          row.category === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          row.category === 'EXPENSE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          row.category === 'PAYROLL' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-slate-800 text-slate-300'
                        }>{row.category}</Badge>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{row.description}</td>
                      <td className="px-6 py-4 text-slate-400">{row.branch}</td>
                      <td className={`px-6 py-4 font-bold text-right ${row.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                         {row.amount > 0 ? '+' : ''}{formatCurrency(row.amount)}
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
