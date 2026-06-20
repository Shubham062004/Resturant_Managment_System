import { format } from 'date-fns';
import { Users, UserCheck, UserX, DollarSign } from 'lucide-react';
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
import { DatePreset } from '../../../shared/utils/exportData';
import HistoryPageLayout from '../components/HistoryPageLayout';

export default function StaffHistoryPage() {
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

  const { data: response, isLoading } = useHistoryQuery('staff', queryParams);
  const records = response?.data || [];
  const summary = response?.summary || {};
  const chartData = response?.charts?.monthlyPayroll || [];
  const totalPages = Math.ceil((response?.total || 0) / 20);

  const stats = [
    { title: 'Active Staff', value: summary.activeStaff || 0, icon: UserCheck },
    { title: 'Former Staff', value: summary.formerStaff || 0, icon: UserX },
    {
      title: 'Total Payroll',
      value: formatCurrency(summary.totalPayroll || 0),
      icon: DollarSign,
    },
    {
      title: 'Attendance Logs',
      value: summary.attendanceLogs || 0,
      icon: Users,
    },
  ];

  return (
    <HistoryPageLayout
      title="Staff History"
      subtitle="Active and former staff, roles, branches, attendance, salary, and performance."
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
      exportFilename="staff-history"
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
                <Bar dataKey="payroll" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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
          No staff records found.
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-border/10">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Branch</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {records.map(
              (row: {
                id: string;
                firstName: string;
                lastName: string;
                role: string;
                isActive: boolean;
                createdAt: string;
                workAssignments?: { branch?: { name: string } }[];
              }) => (
                <tr key={row.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-white">
                    {row.firstName} {row.lastName}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-slate-800 text-slate-300">
                      {row.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {row.workAssignments?.[0]?.branch?.name || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        row.isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }
                    >
                      {row.isActive ? 'Active' : 'Former'}
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
