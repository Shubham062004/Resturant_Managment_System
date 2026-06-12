import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { fetchPlatformDashboard } from '../store/platformSlice';
import { Card } from '../../../shared/components/ui/Card';
import { Globe, Building2, Store, DollarSign } from 'lucide-react';

export default function GlobalDashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboard, status } = useAppSelector((state) => state.platform);

  useEffect(() => {
    dispatch(fetchPlatformDashboard());
  }, [dispatch]);

  if (status === 'loading' || !dashboard) {
    return <div className="p-6 text-slate-300">Loading global analytics...</div>;
  }

  const metrics = [
    {
      label: 'Total Revenue',
      value: `₹${dashboard.globalRevenue.toLocaleString()}`,
      icon: <DollarSign size={24} className="text-emerald-400" />,
    },
    {
      label: 'Organizations',
      value: dashboard.totalOrganizations,
      icon: <Building2 size={24} className="text-blue-400" />,
    },
    {
      label: 'Active Branches',
      value: dashboard.totalBranches,
      icon: <Store size={24} className="text-indigo-400" />,
    },
    {
      label: 'Platform Orders',
      value: dashboard.totalOrders,
      icon: <Globe size={24} className="text-purple-400" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Global Metrics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <Card
            key={idx}
            className="p-6 bg-slate-800 border-slate-700 flex flex-col justify-center items-start"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-slate-900 rounded-lg">{m.icon}</div>
              <h3 className="text-slate-400 text-sm font-medium">{m.label}</h3>
            </div>
            <p className="text-3xl font-bold text-white">{m.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="p-6 h-96 flex items-center justify-center bg-slate-800 border-slate-700">
          <p className="text-slate-500">Global Revenue Map (Coming Soon)</p>
        </Card>
        <Card className="p-6 h-96 flex items-center justify-center bg-slate-800 border-slate-700">
          <p className="text-slate-500">Tenant Usage Metrics</p>
        </Card>
      </div>
    </div>
  );
}
