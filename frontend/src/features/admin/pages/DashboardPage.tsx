import { Activity, DollarSign, ShoppingBag, Users, Clock } from 'lucide-react';
import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import { Card } from '../../../shared/components/ui/Card';
import { fetchDashboardOverview } from '../store/adminSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboard, status } = useAppSelector((state) => state.admin);
  const branchId = 'default-branch-id'; // Using a default branch context

  useEffect(() => {
    dispatch(fetchDashboardOverview(branchId));

    const socket = io(API_BASE_URL, { withCredentials: true });
    socket.emit('join-branch', branchId);

    // Refresh dashboard on key events
    socket.on('order-updated', () =>
      dispatch(fetchDashboardOverview(branchId))
    );
    socket.on('reservation-created', () =>
      dispatch(fetchDashboardOverview(branchId))
    );

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  if (status === 'loading' || !dashboard) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  const kpis = [
    {
      title: "Today's Revenue",
      value: `₹${dashboard.revenueToday.toFixed(2)}`,
      icon: <DollarSign size={24} className="text-emerald-500" />,
    },
    {
      title: "Today's Orders",
      value: dashboard.ordersTodayCount,
      icon: <ShoppingBag size={24} className="text-blue-500" />,
    },
    {
      title: 'Active Deliveries',
      value: dashboard.activeDeliveries,
      icon: <Activity size={24} className="text-indigo-500" />,
    },
    {
      title: 'Kitchen Queue',
      value: dashboard.activeKitchenOrders,
      icon: <Clock size={24} className="text-orange-500" />,
    },
    {
      title: 'Reservations',
      value: dashboard.activeReservations,
      icon: <Users size={24} className="text-purple-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {kpis.map((kpi, idx) => (
          <Card
            key={idx}
            className="p-6 flex flex-col justify-center items-start"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-slate-100 rounded-lg">{kpi.icon}</div>
              <h3 className="text-slate-500 text-sm font-medium">
                {kpi.title}
              </h3>
            </div>
            <p className="text-3xl font-bold text-slate-800">{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Add charts/tables here for a full view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 h-96 flex items-center justify-center bg-slate-50">
          <p className="text-slate-400">Sales Trends Chart (Placeholder)</p>
        </Card>
        <Card className="p-6 h-96 flex items-center justify-center bg-slate-50">
          <p className="text-slate-400">Recent Audit Logs (Placeholder)</p>
        </Card>
      </div>
    </div>
  );
}
