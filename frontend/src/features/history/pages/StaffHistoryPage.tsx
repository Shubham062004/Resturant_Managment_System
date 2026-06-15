import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { Download, Search, Users, UserMinus, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useHistoryQuery } from '../../../api/hooks/useHistory';
import { formatCurrency } from '../../../shared/utils/currency';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function StaffHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'CURRENT' | 'PAST' | 'RESIGNED' | 'TERMINATED'>('CURRENT');

  const { data: response, isLoading } = useHistoryQuery('staff', { limit: 200 });
  const records = useMemo(() => response?.data || [], [response]);

  // Derived KPIs
  const stats = useMemo(() => {
    if (!records.length) return { active: 0, attrition: 0, attendance: 0, payroll: 0 };
    const active = records.filter((r: any) => r.isActive).length;
    const past = records.length - active;
    const attrition = records.length ? (past / records.length) * 100 : 0;
    
    // Mock payroll calculation for demo based on role if no payroll relation exists yet
    const payroll = active * 4500; 

    return {
      active,
      attrition,
      attendance: 94.5, // Mocked high attendance for KPI demo, in reality we'd pull from attendance logs
      payroll
    };
  }, [records]);

  // Chart Data
  const chartData = useMemo(() => {
    const roleMap: Record<string, number> = {};
    records.forEach((r: any) => {
      const role = r.role || 'STAFF';
      roleMap[role] = (roleMap[role] || 0) + 1;
    });

    const deptDistribution = Object.keys(roleMap).map(role => ({
      name: role.replace('_', ' '),
      value: roleMap[role]
    }));

    // Mocked Monthly Attendance trend for demonstration
    const attendanceTrend = [
      { month: 'Jan', rate: 92 }, { month: 'Feb', rate: 95 }, { month: 'Mar', rate: 91 },
      { month: 'Apr', rate: 96 }, { month: 'May', rate: 94 }, { month: 'Jun', rate: 97 }
    ];

    return { deptDistribution, attendanceTrend };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r: any) => {
      const matchSearch = (r.firstName + ' ' + r.lastName).toLowerCase().includes(searchTerm.toLowerCase());
      let matchTab = true;
      if (activeTab === 'CURRENT') matchTab = r.isActive === true;
      if (activeTab === 'PAST') matchTab = r.isActive === false;
      // Further filter for resigned/terminated if supported by DB schema, currently boolean isActive
      if (activeTab === 'RESIGNED' || activeTab === 'TERMINATED') matchTab = r.isActive === false; 
      
      return matchSearch && matchTab;
    });
  }, [records, searchTerm, activeTab]);

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Staff Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Workforce composition, retention, and performance metrics.</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700">
          <Download size={16} />
          <span>Export Roster</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Active Employees" value={stats.active} trend={4.2} icon={Users} loading={isLoading} />
        <StatCard title="Attrition Rate" value={`${stats.attrition.toFixed(1)}%`} trend={-1.5} icon={UserMinus} loading={isLoading} />
        <StatCard title="Avg Attendance" value={`${stats.attendance.toFixed(1)}%`} trend={2.1} icon={Clock} loading={isLoading} />
        <StatCard title="Est. Payroll/Mo" value={formatCurrency(stats.payroll)} trend={8.4} icon={DollarSign} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900/40 border-border/20 lg:col-span-2">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Attendance Trends (Last 6 Months)</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={['dataMin - 5', 100]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-border/20">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Department Distribution</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData.deptDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.deptDistribution.map((entry, index) => (
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

      <Card className="bg-slate-900/40 border-border/20 flex-1">
        <CardHeader className="border-b border-border/10 bg-slate-900/50 p-0">
          <div className="flex border-b border-border/10">
            {['CURRENT', 'PAST', 'RESIGNED', 'TERMINATED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-4 flex justify-between items-center">
             <div className="relative w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search employees..." 
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
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Branch</th>
                  <th className="px-6 py-4 font-medium">Join Date</th>
                  <th className="px-6 py-4 font-medium">Performance</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-500">No {activeTab.toLowerCase()} employees found.</td></tr>
                ) : (
                  filteredRecords.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                            {row.firstName?.[0]}{row.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-white">{row.firstName} {row.lastName}</p>
                            <p className="text-xs text-slate-400">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-medium">{row.role?.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-slate-400">{row.workAssignments?.[0]?.branch?.name || 'Central Office'}</td>
                      <td className="px-6 py-4 text-slate-400">{format(new Date(row.createdAt), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 text-emerald-400 font-medium">92%</td>
                      <td className="px-6 py-4">
                        <Badge className={row.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}>
                          {row.isActive ? 'ACTIVE' : 'INACTIVE'}
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
