import { format } from 'date-fns';
import { Clock, AlertTriangle, Calendar, Users } from 'lucide-react';
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
import { DatePreset } from '../../../shared/utils/exportData';
import HistoryPageLayout from '../components/HistoryPageLayout';

export default function AttendanceHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('30d');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 30,
      search: searchTerm || undefined,
      preset: datePreset,
    }),
    [page, searchTerm, datePreset]
  );

  const { data: response, isLoading } = useHistoryQuery(
    'attendance',
    queryParams
  );
  const records = response?.data || [];
  const summary = response?.summary || {};
  const chartData = response?.charts?.dailyAttendance || [];
  const totalPages = Math.ceil((response?.total || 0) / 30);

  const stats = [
    { title: 'Total Records', value: summary.totalRecords || 0, icon: Users },
    {
      title: 'Total Hours',
      value: `${(summary.totalHours || 0).toFixed(1)}h`,
      icon: Clock,
    },
    { title: 'Late Marks', value: summary.lateMarks || 0, icon: AlertTriangle },
    { title: 'Leaves', value: summary.leaves || 0, icon: Calendar },
  ];

  return (
    <HistoryPageLayout
      title="Attendance History"
      subtitle="Employee check-in, check-out, hours worked, late marks, and leaves."
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
      exportFilename="attendance-history"
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
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#10b981"
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
          No attendance records found.
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-border/10">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Shift</th>
              <th className="px-6 py-4">Check-In</th>
              <th className="px-6 py-4">Check-Out</th>
              <th className="px-6 py-4">Hours</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {records.map(
              (row: {
                id: string;
                user?: { firstName: string; lastName: string };
                date: string;
                checkIn?: string;
                checkOut?: string;
                workingHours: number;
                isLate: boolean;
                status: string;
                branch?: { name: string };
              }) => (
                <tr key={row.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-white">
                    {row.user
                      ? `${row.user.firstName} ${row.user.lastName}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {format(new Date(row.date), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {row.branch?.name || '—'}
                  </td>
                  <td className="px-6 py-4">
                    {row.checkIn ? format(new Date(row.checkIn), 'HH:mm') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {row.checkOut
                      ? format(new Date(row.checkOut), 'HH:mm')
                      : '—'}
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-400">
                    {row.workingHours?.toFixed(1) || 0}h
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        row.isLate
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }
                    >
                      {row.isLate ? 'Late' : row.status}
                    </Badge>
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
