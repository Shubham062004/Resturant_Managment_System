import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { logout } from '../../auth/store/authSlice';
import {
  LayoutDashboard,
  ShoppingBag,
  MonitorSmartphone,
  LayoutGrid,
  CalendarCheck,
  ChefHat,
  Users,
  Package,
  MessageSquare,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Bell,
  Store
} from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge';

const NAV_LINKS = [
  { path: '/manager', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/manager/orders', label: 'Live Orders', icon: ShoppingBag, badge: '5' },
  { path: '/manager/pos', label: 'POS Billing', icon: MonitorSmartphone },
  { path: '/manager/tables', label: 'Floor Plan', icon: LayoutGrid },
  { path: '/manager/reservations', label: 'Reservations', icon: CalendarCheck, badge: '2' },
  { path: '/manager/kitchen', label: 'Kitchen KDS', icon: ChefHat },
  { path: '/manager/staff', label: 'Staff Shift', icon: Users },
  { path: '/manager/inventory', label: 'Stock Requests', icon: Package },
  { path: '/manager/customers', label: 'Customers', icon: MessageSquare },
  { path: '/manager/analytics', label: 'Analytics', icon: TrendingUp },
];

export default function BranchManagerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Branch Context */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Store className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-sm tracking-wide">ABC RESTAURANT</h1>
              <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">Branch Manager</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={closeSidebar}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Operations Center</p>
          
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact 
              ? location.pathname === link.path 
              : location.pathname.startsWith(link.path);

            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeSidebar}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'} />
                  <span className="text-sm">{link.label}</span>
                </div>
                {link.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-slate-300">{user?.firstName?.[0] || 'M'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-900 bg-slate-950/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">Live System: Connected</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-slate-950" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
