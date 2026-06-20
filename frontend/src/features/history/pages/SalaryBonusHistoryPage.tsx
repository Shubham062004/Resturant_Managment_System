import { format } from 'date-fns';
import { DollarSign, Gift, Minus, Clock } from 'lucide-react';
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

export default function SalaryBonusHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('12m');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 25,
      search: searchTerm || undefined,
      preset: datePreset,
    }),
    [page, searchTerm, datePreset]
  );

  const { data: response, isLoading } = useHistoryQuery('salary', queryParams);
  const records = response?.data || [];
  const summary = response?.summary || {};
  const chartData = response?.charts?.monthlyPayroll || [];
  const totalPages = Math.ceil((response?.total || 0) / 25);

  const stats = [
    {
      title: 'Net Pay',
      value: formatCurrency(summary.netPay || 0),
      icon: DollarSign,
    },
    {
      title: 'Total Bonus',
      value: formatCurrency(summary.totalBonus || 0),
      icon: Gift,
    },
    {
      title: 'Deductions',
      value: formatCurrency(summary.totalDeductions || 0),
      icon: Minus,
    },
    {
      title: 'Overtime/Incentives',
      value: formatCurrency(summary.totalOvertime || 0),
      icon: Clock,
    },
  ];

  return (
    <HistoryPageLayout
      title="Salary & Bonus History"
      subtitle="Payroll records with salary, bonus, deductions, overtime, and payment status."
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
      exportFilename="salary-history"
      chartSection={
        chartData.length > 0 ? (
          <div className="bg-slate-900/40 border border-border/20 rounded-xl p-6 h-[280px]">
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
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="base"
                  name="Base Salary"
                  fill="#3b82f6"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="bonus"
                  name="Bonus"
                  fill="#10b981"
                  radius={[2, 2, 0, 0]}
                />
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
          No payroll records found.
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-border/10">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Base Salary</th>
              <th className="px-6 py-4">Bonus</th>
              <th className="px-6 py-4">Deductions</th>
              <th className="px-6 py-4">Net Pay</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {records.map(
              (row: {
                id: string;
                user?: { firstName: string; lastName: string; role: string };
                baseSalary: string;
                bonusPaid: string;
                deductions: string;
                netPaid: string;
                status: string;
                payrollDate: string;
              }) => (
                <tr key={row.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-white">
                    {row.user
                      ? `${row.user.firstName} ${row.user.lastName}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {row.user?.role || '—'}
                  </td>
                  <td className="px-6 py-4">
                    {formatCurrency(Number(row.baseSalary))}
                  </td>
                  <td className="px-6 py-4 text-emerald-400">
                    {formatCurrency(Number(row.bonusPaid))}
                  </td>
                  <td className="px-6 py-4 text-red-400">
                    {formatCurrency(Number(row.deductions))}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {formatCurrency(Number(row.netPaid))}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        row.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {format(new Date(row.payrollDate), 'dd MMM yyyy')}
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
