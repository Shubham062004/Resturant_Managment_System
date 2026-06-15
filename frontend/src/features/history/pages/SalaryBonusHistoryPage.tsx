import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { Download, Search, DollarSign, Wallet, Eye, EyeOff, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useHistoryQuery } from '../../../api/hooks/useHistory';
import { formatCurrency } from '../../../shared/utils/currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export default function SalaryBonusHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSalary, setShowSalary] = useState(false);

  const { data: response, isLoading } = useHistoryQuery('salary', { limit: 500 });
  const records = useMemo(() => response?.data || [], [response]);

  // Derived KPIs
  const stats = useMemo(() => {
    if (!records.length) return { totalPaid: 0, totalBonuses: 0, totalDeductions: 0, slips: 0 };
    
    let totalPaid = 0;
    let totalBonuses = 0;
    let totalDeductions = 0;

    records.forEach((r: any) => {
      totalPaid += r.netPaid || 0;
      totalBonuses += r.bonusPaid || 0;
      totalDeductions += r.deductions || 0;
    });

    return {
      totalPaid,
      totalBonuses,
      totalDeductions,
      slips: records.length
    };
  }, [records]);

  // Chart Data
  const chartData = useMemo(() => {
    // Mock monthly payroll
    const monthlyPayroll = [
      { month: 'Jan', base: 450000, bonus: 20000 },
      { month: 'Feb', base: 480000, bonus: 15000 },
      { month: 'Mar', base: 510000, bonus: 35000 },
      { month: 'Apr', base: 490000, bonus: 12000 },
      { month: 'May', base: 540000, bonus: 40000 },
      { month: 'Jun', base: 580000, bonus: 55000 },
    ];

    return { monthlyPayroll };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r: any) => 
      r.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Payroll & Bonuses</h1>
          <p className="text-sm text-slate-400 mt-1">Salary disbursement, deductions, and historic payslips.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowSalary(!showSalary)}
            className="flex items-center space-x-2 bg-slate-900 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700"
          >
            {showSalary ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showSalary ? 'Hide Amounts' : 'Reveal Amounts'}</span>
          </button>
          <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700">
            <Download size={16} />
            <span>Export Payroll</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Disbursed" value={showSalary ? formatCurrency(stats.totalPaid) : '******'} trend={12.4} icon={Wallet} loading={isLoading} />
        <StatCard title="Total Bonuses Paid" value={showSalary ? formatCurrency(stats.totalBonuses) : '******'} trend={24.1} icon={DollarSign} loading={isLoading} />
        <StatCard title="Total Deductions" value={showSalary ? formatCurrency(stats.totalDeductions) : '******'} trend={-5.4} icon={FileText} loading={isLoading} />
        <StatCard title="Payslips Generated" value={stats.slips.toLocaleString()} trend={0} icon={Search} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="bg-slate-900/40 border-border/20">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Monthly Payroll Breakdown</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.monthlyPayroll} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => showSalary ? `₹${val/1000}k` : '***'} />
                  <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="base" name="Base Salary" fill="#3b82f6" radius={[0, 0, 0, 0]} stackId="a" />
                  <Bar dataKey="bonus" name="Bonuses" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/40 border-border/20 flex-1 min-h-[400px]">
        <CardHeader className="border-b border-border/10 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Payroll Ledger</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search employee..." 
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
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Base Salary</th>
                  <th className="px-6 py-4 font-medium">Bonuses</th>
                  <th className="px-6 py-4 font-medium">Deductions</th>
                  <th className="px-6 py-4 font-medium">Net Pay</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-500">No payroll records found.</td></tr>
                ) : (
                  filteredRecords.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{row.user?.firstName} {row.user?.lastName}</td>
                      <td className="px-6 py-4 text-slate-400">{format(new Date(row.payrollDate), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4 text-slate-300">{showSalary ? formatCurrency(row.baseSalary) : '******'}</td>
                      <td className="px-6 py-4 text-emerald-400">{showSalary ? `+${formatCurrency(row.bonusPaid)}` : '******'}</td>
                      <td className="px-6 py-4 text-rose-400">{showSalary ? `-${formatCurrency(row.deductions)}` : '******'}</td>
                      <td className="px-6 py-4 font-bold text-white">{showSalary ? formatCurrency(row.netPaid) : '******'}</td>
                      <td className="px-6 py-4">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{row.status}</Badge>
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
