import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Settings, BarChart2, Briefcase, Box } from 'lucide-react';
import NotificationCenter from '../../notifications/components/NotificationCenter';

export default function AdminLayout() {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <Home size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <Box size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Staff', path: '/admin/staff', icon: <Briefcase size={20} /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <span className="text-white font-bold text-lg">Oven Xpress Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {links.map((link) => {
              const active = location.pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                      active ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="mr-3">{link.icon}</span>
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between shadow-sm z-10">
          <h1 className="text-xl font-bold text-slate-800">Admin Control Center</h1>
          <div className="flex items-center space-x-6">
            <NotificationCenter />
            <span className="text-sm font-medium text-slate-500">Branch Manager</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
