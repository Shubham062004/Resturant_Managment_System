import { format } from 'date-fns';
import { Truck, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
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

export default function SupplierHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('90d');
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
    'suppliers',
    queryParams
  );
  const records = response?.data || [];
  const summary = response?.summary || {};
  const chartData = response?.charts?.monthlySpend || [];
  const totalPages = Math.ceil((response?.total || 0) / 20);

  const stats = [
    {
      title: 'Total Spend',
      value: formatCurrency(summary.totalSpend || 0),
      icon: DollarSign,
    },
    { title: 'Suppliers', value: summary.supplierCount || 0, icon: Truck },
    {
      title: 'On-Time %',
      value: `${summary.onTimePercent || 0}%`,
      icon: CheckCircle,
    },
    {
      title: 'Delayed %',
      value: `${summary.delayedPercent || 0}%`,
      icon: XCircle,
    },
  ];

  return (
    <HistoryPageLayout
      title="Supplier History"
      subtitle="Orders, deliveries, on-time performance, and spend from database."
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
      exportFilename="supplier-history"
      chartSection={
        chartData.length > 0 ? (
          <div className="bg-slate-900/40 border border-border/20 rounded-xl p-6 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  vertical={false}
                />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <RechartsTooltip
                  formatter={(v: any) => [formatCurrency(Number(v)), 'Spend']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="spend"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
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
          No suppliers found.
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-border/10">
            <tr>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Orders</th>
              <th className="px-6 py-4">Total Spend</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {records.map(
              (row: {
                id: string;
                name: string;
                contactPerson?: string;
                email?: string;
                purchaseOrders?: { totalAmount: string; status: string }[];
              }) => {
                const spend = (row.purchaseOrders || []).reduce(
                  (s, po) => s + Number(po.totalAmount),
                  0
                );
                return (
                  <tr key={row.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-medium text-white">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {row.contactPerson || row.email || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {row.purchaseOrders?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-bold">
                      {formatCurrency(spend)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-emerald-500/10 text-emerald-400">
                        Active
                      </Badge>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      )}
    </HistoryPageLayout>
  );
}
