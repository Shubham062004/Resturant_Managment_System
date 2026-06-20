import { format } from 'date-fns';
import { Leaf, TrendingDown, AlertTriangle, Activity } from 'lucide-react';
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
import { formatCurrency } from '../../../shared/utils/currency';
import type { DatePreset } from '../../../shared/utils/exportData';
import HistoryPageLayout from '../components/HistoryPageLayout';

export default function IngredientHistoryPage() {
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
    'ingredients',
    queryParams
  );
  const records = response?.data || [];
  const summary = response?.summary || {};
  const chartData = response?.charts?.consumptionMap || [];
  const totalPages = Math.ceil((response?.total || 0) / 20);

  const stats = [
    {
      title: 'Tracked Ingredients',
      value: summary.totalIngredients || 0,
      icon: Leaf,
    },
    {
      title: 'Total Consumed',
      value: (summary.totalConsumed || 0).toLocaleString(),
      icon: Activity,
    },
    {
      title: 'Cost Impact',
      value: formatCurrency(summary.costImpact || 0),
      icon: TrendingDown,
    },
    {
      title: 'High Waste Alerts',
      value: summary.highWasteAlerts || 0,
      icon: AlertTriangle,
    },
  ];

  return (
    <HistoryPageLayout
      title="Ingredient Tracking"
      subtitle="Movement logs, consumption trends, and waste monitoring from database."
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
      exportFilename="ingredient-history"
      chartSection={
        <div className="bg-slate-900/40 border border-border/20 rounded-xl p-6 h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={9}
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="consumed"
                  name="Consumed"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="wasted"
                  name="Wasted"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              No consumption data
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
          No ingredients found.
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-border/10">
            <tr>
              <th className="px-6 py-4">Ingredient</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Unit</th>
              <th className="px-6 py-4">Movements</th>
              <th className="px-6 py-4">Cost/Unit</th>
              <th className="px-6 py-4">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {records.map(
              (row: {
                id: string;
                name: string;
                category: string;
                unit: string;
                costPrice: number;
                stockMovements?: unknown[];
                updatedAt: string;
              }) => (
                <tr key={row.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-white">
                    {row.name}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-slate-800 text-slate-300">
                      {row.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{row.unit}</td>
                  <td className="px-6 py-4 text-blue-400 font-bold">
                    {row.stockMovements?.length || 0} logs
                  </td>
                  <td className="px-6 py-4">
                    {formatCurrency(row.costPrice || 0)}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {row.updatedAt
                      ? format(new Date(row.updatedAt), 'dd MMM yyyy')
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
