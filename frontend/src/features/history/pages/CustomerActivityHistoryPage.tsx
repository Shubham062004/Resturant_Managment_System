import { format } from 'date-fns';
import { Users, DollarSign, Heart, RefreshCw } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
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

export default function CustomerActivityHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('30d');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: searchTerm || undefined,
      preset: datePreset,
    }),
    [page, searchTerm, datePreset]
  );

  const { data: response, isLoading } = useHistoryQuery(
    'customers',
    queryParams
  );
  const records = response?.data || [];
  const summary = response?.summary || {};
  const chartData = response?.charts?.customerGrowth || [];
  const totalPages = Math.ceil((response?.total || 0) / 20);

  const stats = [
    {
      title: 'Total Customers',
      value: (summary.totalCustomers || 0).toLocaleString(),
      icon: Users,
    },
    {
      title: 'Avg Spend',
      value: formatCurrency(summary.avgSpend || 0),
      icon: DollarSign,
    },
    {
      title: 'Retention Rate',
      value: `${summary.retention || 0}%`,
      icon: Heart,
    },
    { title: 'Coupons Used', value: summary.couponsUsed || 0, icon: RefreshCw },
  ];

  return (
    <HistoryPageLayout
      title="Customer Activity History"
      subtitle="Customer orders, spend, visit frequency, and coupon usage from database."
      stats={stats}
      isLoading={isLoading}
      searchTerm={searchTerm}
      onSearchChange={(v) => {
        setSearchTerm(v);
        setPage(1);
      }}
      datePreset={datePreset}
      onDatePresetChange={setDatePreset}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      exportFilename="customer-history"
      chartSection={
        chartData.length > 0 ? (
          <div className="bg-slate-900/40 border border-border/20 rounded-xl p-6 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  vertical={false}
                />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="new"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
        </div>
      ) : records.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          No customers found.
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-border/10">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Orders</th>
              <th className="px-6 py-4">Coupons Used</th>
              <th className="px-6 py-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {records.map(
              (row: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                _count?: { orders: number; couponUsages: number };
                createdAt: string;
              }) => (
                <tr key={row.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-white">
                    {row.firstName} {row.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{row.email}</td>
                  <td className="px-6 py-4">
                    <Badge className="bg-blue-500/10 text-blue-400">
                      {row._count?.orders || 0}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{row._count?.couponUsages || 0}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {format(new Date(row.createdAt), 'dd MMM yyyy')}
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
