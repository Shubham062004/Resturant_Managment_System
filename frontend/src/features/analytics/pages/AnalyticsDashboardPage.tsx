import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
  fetchExecutiveSummary,
  fetchSalesTrends,
  fetchCustomerAnalytics,
  fetchProductAnalytics,
  fetchDeliveryAnalytics,
} from '../store/analyticsSlice';
import { Card } from '../../../shared/components/ui/Card';
import Tabs from '../../../shared/components/ui/Tabs';
import { Button } from '../../../shared/components/ui/Button';
import {
  Calendar,
  Download,
  TrendingUp,
  Briefcase
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function AnalyticsDashboardPage() {
  const dispatch = useAppDispatch();
  const { executive, status } = useAppSelector((state) => state.analytics);
  const [activeTab, setActiveTab] = useState('executive');

  // Filters
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days' | 'may2026' | 'june2026'>('7days');

  useEffect(() => {
    dispatch(fetchExecutiveSummary());
    dispatch(fetchSalesTrends());
    dispatch(fetchCustomerAnalytics());
    dispatch(fetchProductAnalytics());
    dispatch(fetchDeliveryAnalytics());
  }, [dispatch, dateFilter]);

  // CSV Exporter Simulation
  const exportToCSV = (type: 'sales' | 'inventory') => {
    let headers = '';
    let rows = [];
    let filename = '';

    if (type === 'sales') {
      filename = `sales_report_${dateFilter}.csv`;
      headers = 'Transaction ID,Date,Branch,Order Type,Payment Method,Subtotal,Tax,Total,Status\n';
      rows = [
        ['TX-1001', '2026-06-01', 'Downtown Hub', 'DINE_IN', 'CARD', '45.00', '2.25', '47.25', 'PAID'],
        ['TX-1002', '2026-06-02', 'West End Grill', 'WALK_IN', 'UPI', '24.50', '1.23', '25.73', 'PAID'],
        ['TX-1003', '2026-06-03', 'Uptown Bistro', 'TAKEAWAY', 'CASH', '89.00', '4.45', '93.45', 'PAID'],
        ['TX-1004', '2026-06-04', 'Airport Food Court', 'DINE_IN', 'CARD', '125.00', '6.25', '131.25', 'PAID'],
        ['TX-1005', '2026-06-05', 'Suburban Outlet', 'WALK_IN', 'UPI', '65.20', '3.26', '68.46', 'PAID'],
      ];
    } else {
      filename = `inventory_waste_${dateFilter}.csv`;
      headers = 'Ingredient Name,SKU,Branch,Consumed Qty,Wasted Qty,Unit,Estimated Waste Cost\n';
      rows = [
        ['Chicken Breast', 'CH-BRE-102', 'Downtown Hub', '450.0', '12.4', 'kg', '74.40'],
        ['Mozzarella Cheese', 'CHZ-MOZ-501', 'West End Grill', '320.0', '5.2', 'kg', '41.60'],
        ['Tomato Paste', 'PST-TOM-302', 'Uptown Bistro', '180.0', '8.0', 'liters', '24.00'],
        ['Lettuce Leaves', 'VEG-LET-001', 'Airport Food Court', '140.0', '15.5', 'heads', '31.00'],
        ['Burger Buns', 'BAK-BUN-202', 'Suburban Outlet', '1200', '45', 'pieces', '22.50'],
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + headers 
      + rows.map(e => e.join(',')).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock Multi-branch sales comparison data
  const branchComparisonData = [
    { name: 'Downtown Hub', sales: 45200, orders: 1240, rating: 4.8 },
    { name: 'West End Grill', sales: 38900, orders: 1050, rating: 4.6 },
    { name: 'Uptown Bistro', sales: 52100, orders: 1410, rating: 4.9 },
    { name: 'Airport Food Court', sales: 29400, orders: 890, rating: 4.2 },
    { name: 'Suburban Outlet', sales: 34200, orders: 950, rating: 4.5 },
  ];

  // Mock Inventory stock levels & waste data
  const inventoryWasteData = [
    { name: 'Chicken Breast', consumed: 520, waste: 24 },
    { name: 'Mozzarella', consumed: 380, waste: 14 },
    { name: 'Tomato Paste', consumed: 210, waste: 8 },
    { name: 'Lettuce Heads', consumed: 160, waste: 22 },
    { name: 'Burger Buns', consumed: 950, waste: 40 },
  ];

  // Mock Kitchen station efficiency (minutes to complete order)
  const kitchenEfficiencyData = [
    { station: 'Grill Station', prepTime: 12.4, peakLoad: 85 },
    { station: 'Salad Bar', prepTime: 6.2, peakLoad: 45 },
    { station: 'Pizza Stone', prepTime: 14.8, peakLoad: 90 },
    { station: 'Beverage Tap', prepTime: 2.1, peakLoad: 30 },
    { station: 'Bakery Oven', prepTime: 8.5, peakLoad: 60 },
  ];

  // Mock Staff performance vs payout comparison
  const staffPayoutData = [
    { role: 'Head Chef', avgSalary: 4500, rating: 4.9 },
    { role: 'Kitchen Staff', avgSalary: 2800, rating: 4.5 },
    { role: 'Cashier', avgSalary: 2500, rating: 4.7 },
    { role: 'Delivery Partner', avgSalary: 3200, rating: 4.6 },
    { role: 'Inventory Manager', avgSalary: 3500, rating: 4.4 },
  ];

  const tabs = [
    {
      id: 'executive',
      label: 'Executive Summary',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-900 border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Today&apos;s Total Revenue</p>
                <h3 className="text-3xl font-extrabold text-white">
                  ${executive?.revenueToday ? parseFloat(executive.revenueToday).toLocaleString() : '1,450.00'}
                </h3>
              </div>
              <div className="text-emerald-450 font-bold text-xs mt-3 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3.5 h-3.5" /> +14.2% from yesterday
              </div>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Orders Processed Today</p>
                <h3 className="text-3xl font-extrabold text-white">
                  {executive?.totalOrdersToday || 128}
                </h3>
              </div>
              <div className="text-indigo-400 font-bold text-xs mt-3 flex items-center gap-1 font-mono">
                <span>⚡</span> Average fulfillment: 18m
              </div>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Active Staff Members</p>
                <h3 className="text-3xl font-extrabold text-white">
                  {executive?.activeStaffCount || 34}
                </h3>
              </div>
              <div className="text-slate-400 text-xs mt-3 flex items-center gap-1 font-mono">
                <Briefcase className="w-3.5 h-3.5" /> Across 5 locations
              </div>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Active Customers Today</p>
                <h3 className="text-3xl font-extrabold text-white">{executive?.activeCustomers || 542}</h3>
              </div>
              <div className="text-amber-500 font-bold text-xs mt-3 flex items-center gap-1 font-mono font-bold">
                <span>★</span> Net NPS Rating: 4.8
              </div>
            </Card>
          </div>

          {/* Quick Exports Section */}
          <Card className="bg-slate-900 border-slate-800 p-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-white font-bold text-sm">Download Data Sheets</h3>
              <p className="text-slate-400 text-xs mt-0.5">Generate spreadsheet formatted logs for direct audit inspection.</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 flex items-center gap-1.5 font-bold"
                onClick={() => exportToCSV('sales')}
              >
                <Download className="w-3.5 h-3.5" /> Export Sales Ledger
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 flex items-center gap-1.5 font-bold"
                onClick={() => exportToCSV('inventory')}
              >
                <Download className="w-3.5 h-3.5" /> Export Stock Audit
              </Button>
            </div>
          </Card>

          {/* Multi-Branch Performance Comparison Bar Chart */}
          <Card className="bg-slate-900 border-slate-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Multi-Branch Sales Performance ($)</h3>
            <div className="h-80 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="sales" name="Gross Revenue ($)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" name="Order count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 'branches',
      label: 'Branch Comparison',
      content: (
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Comparative Multi-Branch Audit Grid</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900 text-white text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Branch Outlet</th>
                  <th className="px-6 py-4">Monthly Revenue</th>
                  <th className="px-6 py-4">Orders Settled</th>
                  <th className="px-6 py-4">Average Order Value</th>
                  <th className="px-6 py-4">Customer Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {branchComparisonData.map((branch, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="px-6 py-4 font-bold text-white">{branch.name}</td>
                    <td className="px-6 py-4 font-mono text-white">${branch.sales.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono">{branch.orders}</td>
                    <td className="px-6 py-4 font-mono">${(branch.sales / branch.orders).toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono text-amber-500 font-bold">★ {branch.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ),
    },
    {
      id: 'inventory',
      label: 'Inventory & Waste',
      content: (
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Ingredient Consumption vs Waste Analysis</h3>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryWasteData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="consumed" name="Consumed Units (kg)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="waste" name="Wasted Units (kg)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ),
    },
    {
      id: 'kitchen',
      label: 'Kitchen Efficiency',
      content: (
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Prep Duration logs by Station</h3>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kitchenEfficiencyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis dataKey="station" type="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="prepTime" name="Avg Prep Speed (minutes)" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ),
    },
    {
      id: 'staff',
      label: 'Staff Payouts',
      content: (
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Salary Payout base vs Performance Ratings</h3>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffPayoutData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="role" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="avgSalary" name="Avg Contract Salary ($)" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 text-slate-100 p-4">
      {/* Date filter & branch action bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Business Intelligence Center</h1>
          <p className="text-slate-400 mt-1">Multi-branch financial graphs, kitchen prep logs, and payroll analytics.</p>
        </div>

        {/* Date Filters controls */}
        <div className="flex flex-wrap gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-xs">
          <span className="self-center px-2 text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Range:
          </span>
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7days', label: '7 Days' },
            { id: 'may2026', label: 'May 26' },
            { id: 'june2026', label: 'June 26' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDateFilter(item.id as any)}
              className={`px-3 py-1.5 rounded transition font-bold uppercase text-[10px] tracking-wider ${
                dateFilter === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {status === 'loading' && !executive ? (
        <div className="flex justify-center items-center py-20 text-slate-500 animate-pulse text-lg">
          Compiling business intelligence reports...
        </div>
      ) : (
        <Tabs tabs={tabs} activeTabId={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}
