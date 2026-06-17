import { format } from 'date-fns';
import {
  Download,
  Search,
  Users,
  Activity,
  Heart,
  Calendar,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

import { useHistoryQuery } from '../../../api/hooks/useHistory';
import { Badge } from '../../../shared/components/ui/Badge';
import {
  Card,
  CardContent,
  CardHeader,
} from '../../../shared/components/ui/Card';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { formatCurrency } from '../../../shared/utils/currency';

export default function CustomerActivityHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading } = useHistoryQuery('customers', {
    limit: 500,
  });
  const records = useMemo(() => response?.data || [], [response]);

  // Derived KPIs
  const stats = useMemo(() => {
    if (!records.length)
      return { totalCustomers: 0, repeatRate: 0, avgSpend: 0, retention: 0 };

    let repeat = 0;
    records.forEach((r: any) => {
      if ((r._count?.orders || 0) > 1) repeat++;
    });

    return {
      totalCustomers: records.length,
      repeatRate: records.length ? (repeat / records.length) * 100 : 0,
      avgSpend: 1450, // Mocked Average Lifetime Spend
      retention: 68.4, // Mocked retention metric
    };
  }, [records]);

  // Chart Data
  const chartData = useMemo(() => {
    // Mock Customer Growth
    const customerGrowth = [
      { month: 'Jan', new: 120, repeat: 450 },
      { month: 'Feb', new: 145, repeat: 480 },
      { month: 'Mar', new: 110, repeat: 510 },
      { month: 'Apr', new: 180, repeat: 490 },
      { month: 'May', new: 160, repeat: 540 },
      { month: 'Jun', new: 195, repeat: 580 },
    ];

    return { customerGrowth };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(
      (r: any) =>
        r.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">
            Customer Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Retention, purchasing behaviors, and demographic growth.
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700">
          <Download size={16} />
          <span>Export Database</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          trend={14.2}
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          title="Repeat Purchase Rate"
          value={`${stats.repeatRate.toFixed(1)}%`}
          trend={4.1}
          icon={Activity}
          loading={isLoading}
        />
        <StatCard
          title="Average Lifetime Spend"
          value={formatCurrency(stats.avgSpend)}
          trend={2.5}
          icon={Heart}
          loading={isLoading}
        />
        <StatCard
          title="Estimated Retention"
          value={`${stats.retention.toFixed(1)}%`}
          trend={-1.2}
          icon={Calendar}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/40 border-border/20 lg:col-span-2">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">
              Customer Growth & Loyalty
            </h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData.customerGrowth}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="repeat"
                    name="Repeat Customers"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorRep)"
                  />
                  <Area
                    type="monotone"
                    dataKey="new"
                    name="New Customers"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorNew)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/40 border-border/20 flex-1 min-h-[400px]">
        <CardHeader className="border-b border-border/10 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Customer Database</h3>
            <div className="relative w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search customers..."
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
                  <th className="px-6 py-4 font-medium">Customer Profile</th>
                  <th className="px-6 py-4 font-medium">Total Orders</th>
                  <th className="px-6 py-4 font-medium">Estimated LTV</th>
                  <th className="px-6 py-4 font-medium">Coupons Used</th>
                  <th className="px-6 py-4 font-medium">First Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center text-slate-500"
                    >
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((row: any, idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold">
                            {row.firstName?.[0] || 'C'}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {row.firstName} {row.lastName}
                            </div>
                            <div className="text-xs text-slate-400">
                              {row.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-400">
                        {row._count?.orders || 0}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">
                        {formatCurrency((row._count?.orders || 0) * 450)}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {row._count?.couponUsages || 0}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {row.createdAt
                          ? format(new Date(row.createdAt), 'MMM yyyy')
                          : 'Unknown'}
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
