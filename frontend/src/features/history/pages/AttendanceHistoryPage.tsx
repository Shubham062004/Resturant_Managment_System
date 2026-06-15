import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { Download, Search, Clock, CalendarDays, UserX, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useHistoryQuery } from '../../../api/hooks/useHistory';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AttendanceHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: response, isLoading } = useHistoryQuery('attendance', { limit: 500 });
  const records = useMemo(() => response?.data || [], [response]);

  // Derived KPIs
  const stats = useMemo(() => {
    if (!records.length) return { present: 0, late: 0, absent: 0, avgHours: 0 };
    
    let present = 0;
    let late = 0;
    let absent = 0;
    let totalHours = 0;

    records.forEach((r: any) => {
      if (r.status === 'PRESENT') present++;
      if (r.status === 'LATE') late++;
      if (r.status === 'ABSENT' || r.status === 'LEAVE') absent++;
      totalHours += r.workingHours || 0;
    });

    const totalDays = records.length || 1;

    return {
      present: (present / totalDays) * 100,
      late,
      absent,
      avgHours: totalHours / (present + late || 1)
    };
  }, [records]);

  // Chart Data
  const chartData = useMemo(() => {
    // Mock daily attendance
    const dailyAttendance = [
      { day: 'Mon', present: 45, late: 3, absent: 2 },
      { day: 'Tue', present: 48, late: 1, absent: 1 },
      { day: 'Wed', present: 42, late: 4, absent: 4 },
      { day: 'Thu', present: 49, late: 0, absent: 1 },
      { day: 'Fri', present: 46, late: 2, absent: 2 },
      { day: 'Sat', present: 50, late: 0, absent: 0 },
    ];

    return { dailyAttendance };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r: any) => {
      const matchSearch = r.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.branch?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter ? r.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [records, searchTerm, statusFilter]);

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Attendance Tracking</h1>
          <p className="text-sm text-slate-400 mt-1">Shift logs, punctuality, and time tracking across branches.</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700">
          <Download size={16} />
          <span>Export Timesheets</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Average Punctuality" value={`${stats.present.toFixed(1)}%`} trend={2.4} icon={Clock} loading={isLoading} />
        <StatCard title="Total Late Arrivals" value={stats.late} trend={-1.2} icon={AlertCircle} loading={isLoading} />
        <StatCard title="Total Leaves/Absences" value={stats.absent} trend={0.5} icon={UserX} loading={isLoading} />
        <StatCard title="Avg Shift Duration" value={`${stats.avgHours.toFixed(1)}h`} trend={0.1} icon={CalendarDays} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="bg-slate-900/40 border-border/20">
          <CardHeader className="border-b border-border/10 pb-4">
            <h3 className="font-bold text-white text-sm">Weekly Attendance Distribution</h3>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-800/50 rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.dailyAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="present" name="Present" fill="#10b981" radius={[0, 0, 0, 0]} stackId="a" />
                  <Bar dataKey="late" name="Late" fill="#f59e0b" radius={[0, 0, 0, 0]} stackId="a" />
                  <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/40 border-border/20 flex-1 min-h-[400px]">
        <CardHeader className="border-b border-border/10 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Daily Timesheets</h3>
            <div className="flex items-center space-x-3">
               <div className="relative w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search employee..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full bg-slate-950 border border-slate-800 text-white rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50" 
                  />
               </div>
               <select 
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="bg-slate-950 border border-slate-800 text-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
               >
                 <option value="">All Statuses</option>
                 <option value="PRESENT">Present</option>
                 <option value="LATE">Late</option>
                 <option value="ABSENT">Absent</option>
               </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
             <div className="h-64 flex items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
             </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 sticky top-0 border-b border-border/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Branch</th>
                  <th className="px-6 py-4 font-medium">Check In</th>
                  <th className="px-6 py-4 font-medium">Check Out</th>
                  <th className="px-6 py-4 font-medium">Hours</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-500">No attendance logs found.</td></tr>
                ) : (
                  filteredRecords.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{row.user?.firstName} {row.user?.lastName}</td>
                      <td className="px-6 py-4 text-slate-400">{format(new Date(row.date), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4 text-slate-300">{row.branch?.name || 'HQ'}</td>
                      <td className="px-6 py-4 text-emerald-400">{row.checkIn ? format(new Date(row.checkIn), 'HH:mm') : '--:--'}</td>
                      <td className="px-6 py-4 text-amber-400">{row.checkOut ? format(new Date(row.checkOut), 'HH:mm') : '--:--'}</td>
                      <td className="px-6 py-4 text-blue-400 font-bold">{row.workingHours ? `${row.workingHours}h` : '-'}</td>
                      <td className="px-6 py-4">
                        <Badge className={
                          row.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          row.status === 'LATE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }>{row.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
