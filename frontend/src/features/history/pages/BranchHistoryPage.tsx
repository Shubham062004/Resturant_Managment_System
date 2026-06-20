import { format } from 'date-fns';
import { MapPin, Store, Users, ShoppingBag, TrendingUp } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

import { useHistoryQuery } from '../../../api/hooks/useHistory';
import { Badge } from '../../../shared/components/ui/Badge';
import { formatCurrency } from '../../../shared/utils/currency';
import type { DatePreset } from '../../../shared/utils/exportData';
import HistoryPageLayout from '../components/HistoryPageLayout';

export default function BranchHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: searchTerm || undefined,
      preset: datePreset !== 'custom' ? datePreset : undefined,
      startDate: datePreset === 'custom' ? customStartDate : undefined,
      endDate: datePreset === 'custom' ? customEndDate : undefined,
    }),
    [page, searchTerm, datePreset, customStartDate, customEndDate]
  );

  const { data: response, isLoading } = useHistoryQuery(
    'branches',
    queryParams
  );

  const records = response?.data || [];
  const summary = response?.summary || {};
  const chartData = response?.charts?.branchComparison || [];
  const totalPages = Math.ceil((response?.total || 0) / 20);

  const stats = [
    {
      title: 'Network Revenue',
      value: formatCurrency(summary.totalRevenue || 0),
      trend: summary.revenueTrend,
      icon: Store,
    },
    {
      title: 'Total Orders',
      value: (summary.totalOrders || 0).toLocaleString(),
      icon: ShoppingBag,
    },
    {
      title: 'Total Customers',
      value: (summary.totalCustomers || 0).toLocaleString(),
      icon: Users,
    },
    { title: 'Active Branches', value: summary.branches || 0, icon: MapPin },
  ];

  const exportHeaders = [
    'Branch',
    'City',
    'Revenue',
    'Orders',
    'Customers',
    'Staff',
    'Rating',
    'Growth %',
  ];
  const exportRows = records.map(
    (r: {
      name: string;
      city: string;
      stats?: {
        revenue: number;
        orders: number;
        customers: number;
        staff: number;
        rating: number | null;
        growthPercent: number;
      };
    }) => [
      r.name,
      r.city,
      r.stats?.revenue || 0,
      r.stats?.orders || 0,
      r.stats?.customers || 0,
      r.stats?.staff || 0,
      r.stats?.rating ?? 'N/A',
      r.stats?.growthPercent ?? 0,
    ]
  );

  return (
    <HistoryPageLayout
      title="Branch Analytics"
      subtitle="Multi-location performance, revenue, and growth metrics from database."
      stats={stats}
      isLoading={isLoading}
      searchTerm={searchTerm}
      onSearchChange={(v) => {
        setSearchTerm(v);
        setPage(1);
      }}
      searchPlaceholder="Search branches..."
      datePreset={datePreset}
      onDatePresetChange={(v) => {
        setDatePreset(v);
        setPage(1);
      }}
      customStartDate={customStartDate}
      customEndDate={customEndDate}
      onCustomStartChange={setCustomStartDate}
      onCustomEndChange={setCustomEndDate}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      exportHeaders={exportHeaders}
      exportRows={exportRows}
      exportFilename="branch-history"
      chartSection={
        <div className="bg-slate-900/40 border border-border/20 rounded-xl p-6 h-[300px]">
          {isLoading ? (
            <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
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
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                  }}
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                />
                <Bar
                  dataKey="revenue"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              No branch data for selected period
            </div>
          )}
        </div>
      }
    >
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
        </div>
      ) : records.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          No branch records found.
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 sticky top-0 border-b border-border/10">
            <tr>
              <th className="px-6 py-4">Branch</th>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4">Revenue</th>
              <th className="px-6 py-4">Orders</th>
              <th className="px-6 py-4">Customers</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Growth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {records.map(
              (row: {
                id: string;
                name: string;
                city: string;
                stats?: {
                  revenue: number;
                  orders: number;
                  customers: number;
                  rating: number | null;
                  growthPercent: number;
                };
              }) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{row.city}</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">
                    {formatCurrency(row.stats?.revenue || 0)}
                  </td>
                  <td className="px-6 py-4">{row.stats?.orders || 0}</td>
                  <td className="px-6 py-4">{row.stats?.customers || 0}</td>
                  <td className="px-6 py-4">
                    {row.stats?.rating ? (
                      <Badge className="bg-amber-500/10 text-amber-400">
                        {row.stats.rating}★
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`flex items-center gap-1 ${(row.stats?.growthPercent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      <TrendingUp size={12} />
                      {row.stats?.growthPercent ?? 0}%
                    </span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </HistoryPageLayout>
  );
}
