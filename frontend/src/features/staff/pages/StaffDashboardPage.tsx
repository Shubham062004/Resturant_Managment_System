import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  CalendarDays, 
  Star, 
  Wallet, 
  Gift,
  ArrowRight,
  UserCircle
} from 'lucide-react';
import apiClient from '../../../services/apiClient';

export default function StaffDashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    todayTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    attendanceStatus: 'Checked In',
    currentShift: 'Morning (9AM - 5PM)',
    performanceScore: 4.8,
    todayEarnings: 600,
    bonusEarned: 25
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would fetch a dedicated staff summary endpoint here.
    // For now, we simulate fetching real dashboard data tailored to the logged-in staff member.
    const fetchDashboardData = async () => {
      try {
        // Fetch active orders to get task count (mock calculation)
        const res = await apiClient.get('/orders/active');
        const activeOrders = res.data.data || [];
        
        // This is where category assignment logic would filter activeOrders 
        // to count only tasks assigned to THIS staff member.
        // Assuming 15 tasks for the day, 10 completed, 5 pending based on live queue.
        setMetrics(prev => ({
          ...prev,
          todayTasks: 15,
          completedTasks: 10,
          pendingTasks: activeOrders.length,
          performanceScore: user?.rating || 4.8
        }));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  const quickActions = [
    { label: 'Mark Attendance', icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', path: '/staff/attendance' },
    { label: 'Open Work Queue', icon: ClipboardList, color: 'text-orange-500', bg: 'bg-orange-500/10', path: '/staff/work' },
    { label: 'View Schedule', icon: CalendarDays, color: 'text-sky-500', bg: 'bg-sky-500/10', path: '/staff/attendance' },
    { label: 'View Profile', icon: UserCircle, color: 'text-purple-500', bg: 'bg-purple-500/10', path: '/staff/profile' },
  ];

  if (loading) {
    return <div className="h-full flex items-center justify-center text-slate-500 animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="flex flex-col space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here's what's happening with your shift today.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-border/20 rounded-xl px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{metrics.attendanceStatus}</span>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="p-5 bg-slate-900/60 border-border/20 backdrop-blur-xl group hover:border-orange-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-orange-500/10">
              <ClipboardList className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-mono text-white mb-1">{metrics.todayTasks}</h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Tasks</p>
        </Card>
        
        <Card className="p-5 bg-slate-900/60 border-border/20 backdrop-blur-xl group hover:border-emerald-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[10px]">Good pace</Badge>
          </div>
          <h3 className="text-2xl font-bold font-mono text-white mb-1">{metrics.completedTasks}</h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-border/20 backdrop-blur-xl group hover:border-rose-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-rose-500/10">
              <Clock className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-mono text-white mb-1">{metrics.pendingTasks}</h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Tasks</p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-border/20 backdrop-blur-xl group hover:border-amber-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            </div>
            <Badge className="bg-slate-800 text-slate-300 border-none text-[10px]">Avg Rating</Badge>
          </div>
          <h3 className="text-2xl font-bold font-mono text-white mb-1">{metrics.performanceScore} / 5.0</h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Performance Score</p>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Earnings & Shift Status */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900/40 border-border/20 overflow-hidden">
            <div className="p-5 border-b border-border/10 bg-slate-900/80">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-500" /> Current Shift
              </h3>
            </div>
            <div className="p-5">
              <p className="text-xl font-bold text-slate-200">{metrics.currentShift}</p>
              <p className="text-sm text-slate-500 mt-1">Branch: ABC Downtown</p>
            </div>
          </Card>

          <Card className="bg-slate-900/40 border-border/20 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            <div className="p-5 border-b border-border/10 bg-slate-900/80 relative">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-500" /> Today's Earnings
              </h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 relative">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Base Wage</p>
                <p className="text-2xl font-bold text-slate-200 font-mono">₹{metrics.todayEarnings}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Bonus</p>
                <p className="text-2xl font-bold text-emerald-400 font-mono">+₹{metrics.bonusEarned}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions Panel */}
        <Card className="lg:col-span-2 bg-slate-900/40 border-border/20 flex flex-col h-full">
          <div className="p-5 border-b border-border/10 bg-slate-900/80">
            <h3 className="font-bold text-white">Quick Actions</h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className="p-5 rounded-2xl border border-border/10 bg-slate-950/50 hover:bg-slate-900 hover:border-slate-700 flex flex-col items-start gap-4 transition-all group text-left"
                >
                  <div className={`p-3 rounded-xl ${action.bg}`}>
                    <Icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 group-hover:text-white transition-colors">{action.label}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 group-hover:text-orange-400 transition-colors">
                      Proceed <ArrowRight size={12} />
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

    </div>
  );
}
