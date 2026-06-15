import { motion } from 'framer-motion';
import {
  Banknote,
  ShoppingBag,
  Clock,
  LayoutGrid,
  CalendarCheck,
  Star,
  ChefHat,
  AlertTriangle,
  Users,
  TrendingUp,
  Store,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useAppSelector } from '../../../app/store';
import apiClient from '../../../services/apiClient';
import { Badge } from '../../../shared/components/ui/Badge';
import { Card, CardContent } from '../../../shared/components/ui/Card';

export default function ManagerDashboardPage() {
  const { user: _user } = useAppSelector((state) => state.auth);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Mocked KPI Data (To be replaced with real analytics endpoint)
  const [kpiData, _setKpiData] = useState({
    revenue: 45200,
    ordersToday: 86,
    pendingOrders: 12,
    activeTables: 8,
    activeReservations: 3,
    rating: 4.8,
    kitchenLoad: 'High',
    inventoryAlerts: 4,
    staffPresent: 14,
  });

  const [recentActivities] = useState([
    {
      id: 1,
      type: 'order',
      message: 'New order #1042 received via Delivery',
      time: 'Just now',
      icon: ShoppingBag,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      id: 2,
      type: 'table',
      message: 'Table T-4 marked as Occupied',
      time: '5m ago',
      icon: LayoutGrid,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      id: 3,
      type: 'inventory',
      message: 'Low stock alert: Fresh Cream (2L left)',
      time: '12m ago',
      icon: AlertTriangle,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
    {
      id: 4,
      type: 'kitchen',
      message: 'Pizza Station delay reported (+5m avg)',
      time: '20m ago',
      icon: ChefHat,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await apiClient.get('/catalog/branches');
        const fetchedBranches = res.data.data.branches || [];
        setBranches(fetchedBranches);

        // Match user branch or pick first
        if (fetchedBranches.length > 0) {
          setSelectedBranchId(fetchedBranches[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch branches', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, trendUp, colorClass, delay }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-border/30 bg-slate-900/60 backdrop-blur-xl rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors">
        <CardContent className="p-5 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-2.5 rounded-xl ${colorClass.bg}`}>
              <Icon className={`w-5 h-5 ${colorClass.text}`} />
            </div>
            {trend && (
              <Badge
                variant={trendUp ? 'success' : 'error'}
                className="text-[10px] font-bold px-1.5 py-0"
              >
                {trendUp ? '↑' : '↓'} {trend}
              </Badge>
            )}
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold font-display text-white mb-1">{value}</h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time pulse of your restaurant operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-48 h-10 bg-slate-800 animate-pulse rounded-xl" />
          ) : (
            <div className="flex items-center gap-2 bg-slate-900 border border-border/30 rounded-xl px-4 py-2 hover:border-primary/50 transition-colors cursor-pointer">
              <Store size={16} className="text-primary" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer appearance-none"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="bg-primary/10 text-primary px-3 py-2 rounded-xl border border-primary/20 text-sm font-bold flex items-center gap-2">
            <Clock size={16} /> Live Sync
          </div>
        </div>
      </div>

      {/* Primary KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`₹${kpiData.revenue.toLocaleString()}`}
          icon={Banknote}
          trend="12.5%"
          trendUp={true}
          colorClass={{ bg: 'bg-emerald-500/10', text: 'text-emerald-500' }}
          delay={0.1}
        />
        <StatCard
          title="Orders Today"
          value={kpiData.ordersToday}
          icon={ShoppingBag}
          trend="8.2%"
          trendUp={true}
          colorClass={{ bg: 'bg-blue-500/10', text: 'text-blue-500' }}
          delay={0.2}
        />
        <StatCard
          title="Pending Orders"
          value={kpiData.pendingOrders}
          icon={Clock}
          colorClass={{ bg: 'bg-rose-500/10', text: 'text-rose-500' }}
          delay={0.3}
        />
        <StatCard
          title="Active Tables"
          value={`${kpiData.activeTables}/20`}
          icon={LayoutGrid}
          colorClass={{ bg: 'bg-purple-500/10', text: 'text-purple-500' }}
          delay={0.4}
        />
      </div>

      {/* Secondary Metrics & Activity Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: More KPIs */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-min">
          <StatCard
            title="Active Reservations"
            value={kpiData.activeReservations}
            icon={CalendarCheck}
            colorClass={{ bg: 'bg-sky-500/10', text: 'text-sky-500' }}
            delay={0.5}
          />
          <StatCard
            title="Customer Rating"
            value={kpiData.rating}
            icon={Star}
            trend="+0.1"
            trendUp={true}
            colorClass={{ bg: 'bg-amber-500/10', text: 'text-amber-500' }}
            delay={0.6}
          />
          <StatCard
            title="Kitchen Load"
            value={kpiData.kitchenLoad}
            icon={ChefHat}
            colorClass={{ bg: 'bg-orange-500/10', text: 'text-orange-500' }}
            delay={0.7}
          />
          <StatCard
            title="Staff Shift"
            value={`${kpiData.staffPresent} Present`}
            icon={Users}
            colorClass={{ bg: 'bg-indigo-500/10', text: 'text-indigo-500' }}
            delay={0.8}
          />
        </div>

        {/* Right Column: Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="xl:col-span-1"
        >
          <Card className="h-full border-border/30 bg-slate-900/60 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border/20 flex items-center justify-between shrink-0">
              <h3 className="font-display font-bold text-lg text-white">Live Activity</h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="p-5 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              {recentActivities.map((activity, idx) => {
                const ActivityIcon = activity.icon;
                return (
                  <div key={activity.id} className="relative flex gap-4">
                    {/* Timeline Line */}
                    {idx !== recentActivities.length - 1 && (
                      <div className="absolute top-8 left-4 bottom-[-24px] w-[1px] bg-border/20" />
                    )}

                    <div
                      className={`w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center shrink-0 border border-border/10 z-10`}
                    >
                      <ActivityIcon className={`w-4 h-4 ${activity.color}`} />
                    </div>

                    <div className="flex-1 min-w-0 pt-1.5">
                      <p className="text-sm font-medium text-slate-200">{activity.message}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-border/20 bg-slate-950/30 shrink-0">
              <button className="w-full text-xs font-bold text-primary hover:text-primary-hover transition-colors">
                View All Activity
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
