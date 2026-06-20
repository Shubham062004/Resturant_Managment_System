import { format } from 'date-fns';
import { Server, AlertTriangle, Activity, Clock } from 'lucide-react';
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
import type { DatePreset } from '../../../shared/utils/exportData';
import HistoryPageLayout from '../components/HistoryPageLayout';

const LEVEL_COLORS: Record<string, string> = {
  INFO: 'bg-blue-500/10 text-blue-400',
  WARN: 'bg-amber-500/10 text-amber-400',
  ERROR: 'bg-red-500/10 text-red-400',
};

export default function SystemActivityLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('7d');
  const [moduleFilter, setModuleFilter] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 50,
      search: searchTerm || undefined,
      preset: datePreset,
      module: moduleFilter || undefined,
    }),
    [page, searchTerm, datePreset, moduleFilter]
  );

  const { data: response, isLoading } = useHistoryQuery(
    'system-logs',
    queryParams
  );
  const records = response?.data || [];
  const summary = response?.summary || {};
  const chartData = response?.charts?.moduleBreakdown || [];
  const totalPages = Math.ceil((response?.total || 0) / 50);

  const stats = [
    {
      title: 'Total Events',
      value: (summary.totalEvents || 0).toLocaleString(),
      icon: Server,
    },
    { title: 'Errors', value: summary.errors || 0, icon: AlertTriangle },
    {
      title: 'Avg Response',
      value: `${summary.avgResponseMs || 0}ms`,
      icon: Clock,
    },
    { title: 'Modules Tracked', value: chartData.length, icon: Activity },
  ];

  const exportHeaders = [
    'Timestamp',
    'Level',
    'Module',
    'Message',
    'IP',
    'Duration',
  ];
  const exportRows = records.map(
    (r: {
      timestamp: string;
      level: string;
      module: string;
      message: string;
      ipAddress?: string;
      duration?: number;
    }) => [
      format(new Date(r.timestamp), 'dd MMM yyyy HH:mm'),
      r.level,
      r.module,
      r.message,
      r.ipAddress || '—',
      r.duration ? `${r.duration}ms` : '—',
    ]
  );

  return (
    <HistoryPageLayout
      title="System Activity Logs"
      subtitle="API events, authentication, orders, inventory, payments, and system errors."
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
      exportHeaders={exportHeaders}
      exportRows={exportRows}
      exportFilename="system-logs"
      filters={
        <select
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setPage(1);
          }}
          className="bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Modules</option>
          {['API', 'AUTH', 'ORDER', 'INVENTORY', 'PAYMENT', 'SYSTEM'].map(
            (m) => (
              <option key={m} value={m}>
                {m}
              </option>
            )
          )}
        </select>
      }
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
                <XAxis dataKey="module" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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
          No system logs found.
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-border/10">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Level</th>
              <th className="px-6 py-4">Module</th>
              <th className="px-6 py-4">Message</th>
              <th className="px-6 py-4">IP</th>
              <th className="px-6 py-4">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {records.map(
              (row: {
                id: string;
                timestamp: string;
                level: string;
                module: string;
                message: string;
                ipAddress?: string;
                duration?: number;
              }) => (
                <tr key={row.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-slate-400">
                    {format(new Date(row.timestamp), 'dd MMM yyyy HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={LEVEL_COLORS[row.level] || 'bg-slate-800'}
                    >
                      {row.level}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">
                    {row.module}
                  </td>
                  <td className="px-6 py-4 text-slate-300 max-w-xs truncate">
                    {row.message}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                    {row.ipAddress || '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {row.duration ? `${row.duration}ms` : '—'}
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
