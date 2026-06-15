import React, { useState } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import {
  Clock,
  Calendar,
  Coffee,
  LogOut,
  UserCheck,
  AlertTriangle,
  History,
  CheckCircle,
  FileX,
} from 'lucide-react';
import { useToast } from '../../../shared/components/ui/Toast';

export default function StaffAttendancePage() {
  const toast = useToast();

  // Simulated state for today's attendance
  const [status, setStatus] = useState<'OFF_DUTY' | 'ON_DUTY' | 'ON_BREAK'>('OFF_DUTY');
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  const handleClockIn = () => {
    setStatus('ON_DUTY');
    setClockInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    toast.success('Successfully clocked in for your shift.');
  };

  const handleClockOut = () => {
    setStatus('OFF_DUTY');
    toast.success('Successfully clocked out. Have a good day!');
  };

  const handleBreakToggle = () => {
    if (status === 'ON_DUTY') {
      setStatus('ON_BREAK');
      toast.info('Break started. Enjoy your time off.');
    } else if (status === 'ON_BREAK') {
      setStatus('ON_DUTY');
      toast.success('Break ended. Welcome back!');
    }
  };

  // Mock History
  const history = [
    {
      date: 'Today',
      checkIn: clockInTime || '--:--',
      checkOut: '--:--',
      status: 'Present',
      late: false,
    },
    {
      date: 'Yesterday',
      checkIn: '09:05 AM',
      checkOut: '05:30 PM',
      status: 'Present',
      late: false,
    },
    {
      date: '2 days ago',
      checkIn: '09:15 AM',
      checkOut: '05:40 PM',
      status: 'Present',
      late: true,
    },
    { date: '3 days ago', checkIn: '--:--', checkOut: '--:--', status: 'Leave', late: false },
    {
      date: '4 days ago',
      checkIn: '08:55 AM',
      checkOut: '05:05 PM',
      status: 'Present',
      late: false,
    },
  ];

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto custom-scrollbar pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-white tracking-tight">
          Time & Attendance
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your shifts, breaks, and view attendance history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Clock Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-slate-900/60 border-border/20 text-center">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
              Current Status
            </h2>

            <div className="flex justify-center mb-6">
              {status === 'OFF_DUTY' && (
                <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50">
                  <LogOut size={32} className="mb-2" />
                  <span className="font-bold">Off Duty</span>
                </div>
              )}
              {status === 'ON_DUTY' && (
                <div className="w-32 h-32 rounded-full border-4 border-emerald-500/50 flex flex-col items-center justify-center text-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
                  <UserCheck size={32} className="mb-2" />
                  <span className="font-bold">On Duty</span>
                </div>
              )}
              {status === 'ON_BREAK' && (
                <div className="w-32 h-32 rounded-full border-4 border-amber-500/50 flex flex-col items-center justify-center text-amber-500 bg-amber-500/10 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]">
                  <Coffee size={32} className="mb-2 animate-bounce" />
                  <span className="font-bold">On Break</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {status === 'OFF_DUTY' ? (
                <Button
                  onClick={handleClockIn}
                  className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Clock size={18} className="mr-2" /> Clock In Now
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleBreakToggle}
                    variant="outline"
                    className={`h-12 text-sm font-bold border-transparent ${status === 'ON_BREAK' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-amber-500'}`}
                  >
                    <Coffee size={16} className="mr-2" />
                    {status === 'ON_BREAK' ? 'End Break' : 'Start Break'}
                  </Button>
                  <Button
                    onClick={handleClockOut}
                    className="h-12 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white border-none"
                  >
                    <LogOut size={16} className="mr-2" /> Clock Out
                  </Button>
                </div>
              )}
            </div>

            {status !== 'OFF_DUTY' && (
              <p className="text-xs text-slate-500 mt-4">
                Clocked in at <span className="font-bold text-slate-300">{clockInTime}</span>
              </p>
            )}
          </Card>

          <Card className="p-5 bg-slate-900/60 border-border/20">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={16} className="text-sky-500" /> Monthly Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-border/10">
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span className="text-sm text-slate-300 font-semibold">Days Present</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">22</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-border/10">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span className="text-sm text-slate-300 font-semibold">Late Marks</span>
                </div>
                <span className="font-mono font-bold text-amber-400">2</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-border/10">
                <div className="flex items-center gap-3">
                  <FileX size={16} className="text-rose-500" />
                  <span className="text-sm text-slate-300 font-semibold">Leaves Taken</span>
                </div>
                <span className="font-mono font-bold text-rose-400">1 / 2</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Attendance History */}
        <Card className="lg:col-span-2 p-0 bg-slate-900/40 border-border/20 overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-border/20 bg-slate-900/80 backdrop-blur-md shrink-0 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={20} className="text-primary" /> Attendance Log
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border/30 text-xs text-slate-300"
            >
              Request Leave
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/50">
                  <th className="p-4 rounded-tl-xl">Date</th>
                  <th className="p-4">Clock In</th>
                  <th className="p-4">Clock Out</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 rounded-tr-xl text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {history.map((record, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/5 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4 font-semibold text-slate-200">{record.date}</td>
                    <td className="p-4 font-mono text-slate-400">{record.checkIn}</td>
                    <td className="p-4 font-mono text-slate-400">{record.checkOut}</td>
                    <td className="p-4">
                      {record.status === 'Present' ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-none px-2 py-0.5 text-[10px]">
                          Present
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/10 text-rose-400 border-none px-2 py-0.5 text-[10px]">
                          Leave
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {record.late ? (
                        <span className="text-xs text-amber-500 flex items-center justify-end gap-1">
                          <AlertTriangle size={12} /> Late Entry
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
