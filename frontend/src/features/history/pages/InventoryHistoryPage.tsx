import { format } from 'date-fns';
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { useHistoryQuery } from '../../../api/hooks/useHistory';
import { Badge } from '../../../shared/components/ui/Badge';
import type { DatePreset } from '../../../shared/utils/exportData';
import HistoryPageLayout from '../components/HistoryPageLayout';

export default function InventoryHistoryPage() {
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
    'inventory',
    queryParams
  );
  const records = response?.data || [];
  const summary = response?.summary || {};
  const chartData = response?.charts?.movementTrend || [];
  const totalPages = Math.ceil((response?.total || 0) / 20);

  const stats = [
    {
      title: 'Stock Added',
      value: (summary.stockAdded || 0).toLocaleString(),
      icon: TrendingUp,
    },
    {
      title: 'Stock Removed',
      value: (summary.stockRemoved || 0).toLocaleString(),
      icon: TrendingDown,
    },
    {
      title: 'Wastage',
      value: (summary.wastage || 0).toLocaleString(),
      icon: AlertTriangle,
    },
    {
      title: 'Current Stock',
      value: (summary.currentStock || 0).toLocaleString(),
      icon: Package,
    },
  ];

  return (
    <HistoryPageLayout
      title="Inventory History"
      subtitle="Stock movements, wastage, transfers, purchase orders, and branch requests."
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
      exportFilename="inventory-history"
      chartSection={
        chartData.length > 0 ? (
          <div className="bg-slate-900/40 border border-border/20 rounded-xl p-6 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  vertical={false}
                />
                <XAxis dataKey="type" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
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
          No inventory requests found.
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-border/10">
            <tr>
              <th className="px-6 py-4">Request ID</th>
              <th className="px-6 py-4">Branch</th>
              <th className="px-6 py-4">Requested By</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {records.map(
              (row: {
                id: string;
                branch?: { name: string };
                requestedBy?: { firstName: string; lastName: string };
                items?: unknown[];
                status: string;
                createdAt: string;
              }) => (
                <tr key={row.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    {row.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-white">
                    {row.branch?.name || '—'}
                  </td>
                  <td className="px-6 py-4">
                    {row.requestedBy
                      ? `${row.requestedBy.firstName} ${row.requestedBy.lastName}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4">{row.items?.length || 0}</td>
                  <td className="px-6 py-4">
                    <Badge className="bg-blue-500/10 text-blue-400">
                      {row.status}
                    </Badge>
                  </td>
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
