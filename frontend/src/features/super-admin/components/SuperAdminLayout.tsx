import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Globe, Building2, Store, Activity, Settings } from 'lucide-react';

export default function SuperAdminLayout() {
  const location = useLocation();

  const links = [
    { name: 'Platform Dashboard', path: '/super-admin', icon: <Globe size={20} /> },
    { name: 'Organizations', path: '/super-admin/organizations', icon: <Building2 size={20} /> },
    { name: 'Franchises', path: '/super-admin/franchises', icon: <Store size={20} /> },
    { name: 'Platform Health', path: '/super-admin/health', icon: <Activity size={20} /> },
    { name: 'Global Settings', path: '/super-admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-black flex flex-col border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-white font-bold text-lg">Oven Xpress Global</span>
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
                      active ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 hover:text-white text-slate-400'
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
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center px-6 justify-between shadow-sm z-10">
          <h1 className="text-xl font-bold text-white">Super Admin Control Center</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-400">Platform Admin</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-slate-900 text-slate-200">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
