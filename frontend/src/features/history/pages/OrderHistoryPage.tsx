import { format } from 'date-fns';
import { ShoppingCart, DollarSign, Activity, XCircle } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
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

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: 'bg-emerald-500/10 text-emerald-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
  REFUNDED: 'bg-neutral-500/10 text-neutral-400',
  PLACED: 'bg-blue-500/10 text-blue-400',
  PREPARING: 'bg-amber-500/10 text-amber-400',
};

export default function OrderHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 25,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      preset: datePreset !== 'custom' ? datePreset : undefined,
      startDate: datePreset === 'custom' ? customStartDate : undefined,
      endDate: datePreset === 'custom' ? customEndDate : undefined,
    }),
    [page, searchTerm, statusFilter, datePreset, customStartDate, customEndDate]
  );

  const { data: response, isLoading } = useHistoryQuery('orders', queryParams);
  const records = response?.data || [];
  const summary = response?.summary || {};
  const dailyTrend = response?.charts?.dailyTrend || [];
  const totalPages = Math.ceil((response?.total || 0) / 25);

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(summary.revenue || 0),
      trend: summary.revenueTrend,
      icon: DollarSign,
    },
    {
      title: 'Orders',
      value: (summary.orderCount || 0).toLocaleString(),
      icon: ShoppingCart,
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(summary.avgOrderValue || 0),
      icon: Activity,
    },
    { title: 'Refunded', value: summary.refundedCount || 0, icon: XCircle },
  ];

  const exportHeaders = [
    'Order ID',
    'Customer',
    'Branch',
    'Date',
    'Amount',
    'Status',
    'Payment',
  ];
  const exportRows = records.map(
    (r: {
      orderNumber: string;
      user?: { firstName: string; lastName: string };
      branch?: { name: string };
      createdAt: string;
      totalAmount: string;
      status: string;
      payment?: { status: string };
    }) => [
      r.orderNumber,
      r.user ? `${r.user.firstName} ${r.user.lastName}` : '—',
      r.branch?.name || '—',
      format(new Date(r.createdAt), 'dd MMM yyyy'),
      r.totalAmount,
      r.status,
      r.payment?.status || '—',
    ]
  );

  return (
    <HistoryPageLayout
      title="Order History"
      subtitle="Complete order records with customer, branch, payment, kitchen staff, and delivery data."
      stats={stats}
      isLoading={isLoading}
      searchTerm={searchTerm}
      onSearchChange={(v) => {
        setSearchTerm(v);
        setPage(1);
      }}
      datePreset={datePreset}
      onDatePresetChange={setDatePreset}
      customStartDate={customStartDate}
      customEndDate={customEndDate}
      onCustomStartChange={setCustomStartDate}
      onCustomEndChange={setCustomEndDate}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      exportHeaders={exportHeaders}
      exportRows={exportRows}
      exportFilename="order-history"
      filters={
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {['PLACED', 'PREPARING', 'DELIVERED', 'CANCELLED', 'REFUNDED'].map(
            (s) => (
              <option key={s} value={s}>
                {s}
              </option>
            )
          )}
        </select>
      }
      chartSection={
        dailyTrend.length > 0 ? (
          <div className="bg-slate-900/40 border border-border/20 rounded-xl p-6 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  vertical={false}
                />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <RechartsTooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
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
          No orders found for selected filters.
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-border/10">
            <tr>
              <th className="px-4 py-4">Order</th>
              <th className="px-4 py-4">Customer</th>
              <th className="px-4 py-4">Branch</th>
              <th className="px-4 py-4">Date</th>
              <th className="px-4 py-4">Amount</th>
              <th className="px-4 py-4">Payment</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Kitchen</th>
              <th className="px-4 py-4">Delivery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {records.map(
              (row: {
                id: string;
                orderNumber: string;
                user?: { firstName: string; lastName: string };
                branch?: { name: string };
                createdAt: string;
                totalAmount: string;
                status: string;
                payment?: { status: string };
                kitchenOrder?: {
                  assignedUser?: { firstName: string; lastName: string };
                };
                deliveryAssignment?: {
                  driver?: { user?: { firstName: string; lastName: string } };
                };
                refunds?: { status: string }[];
              }) => (
                <tr key={row.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono text-white text-xs">
                    {row.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    {row.user
                      ? `${row.user.firstName} ${row.user.lastName}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {row.branch?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {format(new Date(row.createdAt), 'dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-400">
                    {formatCurrency(Number(row.totalAmount))}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {row.payment?.status || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={STATUS_COLORS[row.status] || 'bg-slate-800'}
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {row.kitchenOrder?.assignedUser
                      ? `${row.kitchenOrder.assignedUser.firstName} ${row.kitchenOrder.assignedUser.lastName}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {row.deliveryAssignment?.driver?.user
                      ? `${row.deliveryAssignment.driver.user.firstName} ${row.deliveryAssignment.driver.user.lastName}`
                      : '—'}
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
