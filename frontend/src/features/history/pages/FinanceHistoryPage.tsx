import { format } from 'date-fns';
import { DollarSign, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
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

export default function FinanceHistoryPage() {
  const [datePreset, setDatePreset] = useState<DatePreset>('12m');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const queryParams = useMemo(
    () => ({
      preset: datePreset !== 'custom' ? datePreset : undefined,
      startDate: datePreset === 'custom' ? customStartDate : undefined,
      endDate: datePreset === 'custom' ? customEndDate : undefined,
    }),
    [datePreset, customStartDate, customEndDate]
  );

  const { data: response, isLoading } = useHistoryQuery('finance', queryParams);
  const ledger = response?.data || [];
  const summary = response?.summary || {};
  const chartData = response?.charts?.profitTrend || [];

  const stats = [
    {
      title: 'Revenue',
      value: formatCurrency(summary.revenue || 0),
      trend: summary.revenueTrend,
      icon: DollarSign,
    },
    {
      title: 'Expenses',
      value: formatCurrency(summary.expenses || 0),
      icon: TrendingDown,
    },
    {
      title: 'Net Profit',
      value: formatCurrency(summary.profit || 0),
      icon: TrendingUp,
    },
    {
      title: 'GST/Tax',
      value: formatCurrency(summary.taxes || 0),
      icon: Receipt,
    },
  ];

  return (
    <HistoryPageLayout
      title="Finance History"
      subtitle="Revenue, expenses, payroll, profit, GST, and branch profitability from database."
      stats={stats}
      isLoading={isLoading}
      searchTerm=""
      onSearchChange={() => {}}
      datePreset={datePreset}
      onDatePresetChange={setDatePreset}
      customStartDate={customStartDate}
      customEndDate={customEndDate}
      onCustomStartChange={setCustomStartDate}
      onCustomEndChange={setCustomEndDate}
      exportFilename="finance-history"
      chartSection={
        chartData.length > 0 ? (
          <div className="bg-slate-900/40 border border-border/20 rounded-xl p-6 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
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
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-border/10">
            <tr>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {ledger.map(
              (
                row: { type: string; category: string; amount: number },
                idx: number
              ) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        row.type === 'Revenue'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }
                    >
                      {row.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-white">{row.category}</td>
                  <td
                    className={`px-6 py-4 font-bold ${row.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {formatCurrency(Math.abs(row.amount))}
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
