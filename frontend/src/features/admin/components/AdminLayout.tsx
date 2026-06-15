import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  Settings,
  BarChart2,
  Briefcase,
  Box,
  MapPin,
  ClipboardList,
  Truck,
  BookOpen,
  Activity,
  Calendar,
  Bell,
  Brain,
  DollarSign,
  Shield,
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../../app/store';
import apiClient from '../../../services/apiClient';
import { logout } from '../../auth/store/authSlice';
import NotificationCenter from '../../notifications/components/NotificationCenter';

interface SidebarLink {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarGroup {
  name: string;
  icon: React.ReactNode;
  links: SidebarLink[];
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.role;
  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Shubham';

  // Sidebar States
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  // Accordion active groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Operations: true,
    Management: false,
    Analytics: false,
    Finance: false,
    Settings: false,
  });

  const isOwner =
    role === 'ORGANIZATION_OWNER' || role === 'FRANCHISE_OWNER' || role === 'SUPER_ADMIN';

  // Fetch branches for dropdown selector
  useEffect(() => {
    apiClient
      .get('/admin/branches')
      .then((res) => {
        const branchList = res.data.data || [];
        setBranches(branchList.map((b: any) => ({ id: b.id, name: b.name.replace('ABC - ', '') })));
      })
      .catch((err) => console.error('Error loading branches in sidebar selector:', err));
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logout() as any);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Define sidebar menu groups
  const sidebarGroups: SidebarGroup[] = isOwner
    ? [
        {
          name: 'Operations',
          icon: <LayoutGrid size={18} />,
          links: [
            { name: 'Branch Management', path: '/admin/branches', icon: <MapPin size={18} /> },
            { name: 'Menu Management', path: '/admin/menu', icon: <BookOpen size={18} /> },
            { name: 'Orders', path: '/admin/orders', icon: <ClipboardList size={18} /> },
            { name: 'Kitchen Operations', path: '/admin/kitchen', icon: <Activity size={18} /> },
            { name: 'Inventory', path: '/admin/inventory', icon: <Box size={18} /> },
            { name: 'Suppliers', path: '/admin/suppliers', icon: <Truck size={18} /> },
          ],
        },
        {
          name: 'Management',
          icon: <Users size={18} />,
          links: [
            { name: 'Staff Management', path: '/admin/staff', icon: <Briefcase size={18} /> },
            { name: 'Customer Database', path: '/admin/customers', icon: <Users size={18} /> },
          ],
        },
        {
          name: 'Analytics',
          icon: <BarChart2 size={18} />,
          links: [
            { name: 'Sales & BI Reports', path: '/admin/analytics', icon: <BarChart2 size={18} /> },
            { name: 'AI Forecasting', path: '/admin/ai-insights', icon: <Brain size={18} /> },
          ],
        },
        {
          name: 'History',
          icon: <Calendar size={18} />,
          links: [
            {
              name: 'Order History',
              path: '/admin/history/orders',
              icon: <ClipboardList size={18} />,
            },
            { name: 'Staff History', path: '/admin/history/staff', icon: <Briefcase size={18} /> },
            {
              name: 'Inventory History',
              path: '/admin/history/inventory',
              icon: <Box size={18} />,
            },
            {
              name: 'Ingredient History',
              path: '/admin/history/ingredients',
              icon: <ClipboardList size={18} />,
            },
            {
              name: 'Supplier History',
              path: '/admin/history/suppliers',
              icon: <Truck size={18} />,
            },
            { name: 'Branch History', path: '/admin/history/branches', icon: <MapPin size={18} /> },
            {
              name: 'Customer Activity History',
              path: '/admin/history/customers',
              icon: <Users size={18} />,
            },
            {
              name: 'Finance History',
              path: '/admin/history/finance',
              icon: <DollarSign size={18} />,
            },
            {
              name: 'Attendance History',
              path: '/admin/history/attendance',
              icon: <Briefcase size={18} />,
            },
            {
              name: 'Salary & Bonus History',
              path: '/admin/history/salary',
              icon: <DollarSign size={18} />,
            },
            { name: 'Audit Logs', path: '/admin/history/audit', icon: <Shield size={18} /> },
            {
              name: 'System Activity Logs',
              path: '/admin/history/system',
              icon: <Activity size={18} />,
            },
          ],
        },
        {
          name: 'Finance',
          icon: <DollarSign size={18} />,
          links: [
            { name: 'Finance Control', path: '/admin/finance', icon: <DollarSign size={18} /> },
            { name: 'P&L', path: '/admin/finance/pl', icon: <BarChart2 size={18} /> },
            {
              name: 'Tax Management',
              path: '/admin/finance/taxes',
              icon: <DollarSign size={18} />,
            },
          ],
        },
        {
          name: 'Settings',
          icon: <Settings size={18} />,
          links: [
            { name: 'Audit & Security', path: '/admin/audit', icon: <Shield size={18} /> },
            { name: 'System Settings', path: '/admin/settings', icon: <Settings size={18} /> },
          ],
        },
      ]
    : [
        {
          name: 'Operations',
          icon: <LayoutGrid size={18} />,
          links: [
            { name: 'Dashboard', path: '/admin', icon: <Home size={18} /> },
            { name: 'Orders Queue', path: '/admin/orders', icon: <Box size={18} /> },
          ],
        },
        {
          name: 'Analytics',
          icon: <BarChart2 size={18} />,
          links: [{ name: 'Analytics', path: '/admin/analytics', icon: <BarChart2 size={18} /> }],
        },
        {
          name: 'History',
          icon: <Calendar size={18} />,
          links: [
            { name: 'Order History', path: '/admin/history/orders', icon: <ClipboardList size={18} /> },
            { name: 'Staff History', path: '/admin/history/staff', icon: <Briefcase size={18} /> },
            { name: 'Inventory History', path: '/admin/history/inventory', icon: <Box size={18} /> },
            { name: 'Ingredient History', path: '/admin/history/ingredients', icon: <ClipboardList size={18} /> },
            { name: 'Supplier History', path: '/admin/history/suppliers', icon: <Truck size={18} /> },
            { name: 'Branch History', path: '/admin/history/branches', icon: <MapPin size={18} /> },
            { name: 'Customer Activity History', path: '/admin/history/customers', icon: <Users size={18} /> },
            { name: 'Finance History', path: '/admin/history/finance', icon: <DollarSign size={18} /> },
            { name: 'Attendance History', path: '/admin/history/attendance', icon: <Briefcase size={18} /> },
            { name: 'Salary & Bonus History', path: '/admin/history/salary', icon: <DollarSign size={18} /> },
            { name: 'Audit Logs', path: '/admin/history/audit', icon: <Shield size={18} /> },
            { name: 'System Activity Logs', path: '/admin/history/system', icon: <Activity size={18} /> },
          ],
        },
        {
          name: 'Management',
          icon: <Users size={18} />,
          links: [
            { name: 'Staff Log', path: '/admin/staff', icon: <Briefcase size={18} /> },
            { name: 'Customers list', path: '/admin/customers', icon: <Users size={18} /> },
          ],
        },
        {
          name: 'Settings',
          icon: <Settings size={18} />,
          links: [{ name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> }],
        },
      ];

  // Filter links dynamically based on sidebar search input
  const getFilteredGroups = () => {
    if (!searchQuery) return sidebarGroups;
    return sidebarGroups
      .map((group) => {
        const filteredLinks = group.links.filter((link) =>
          link.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        return {
          ...group,
          links: filteredLinks,
        };
      })
      .filter((group) => group.links.length > 0);
  };

  const filteredGroups = getFilteredGroups();

  return (
    <div className="flex h-screen bg-[#0F172A] text-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside
        className={`hidden md:flex flex-col bg-[#111827] border-r border-slate-800/80 transition-all duration-300 z-20 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header / Brand Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/60 shrink-0">
          {!isCollapsed && (
            <Link to="/admin" className="flex items-center gap-2">
              <div className="p-1.5 bg-[#2563EB] text-white rounded-lg">
                <Shield size={16} />
              </div>
              <span className="font-display font-bold text-sm tracking-tight text-white uppercase">
                ABC
              </span>
            </Link>
          )}
          {isCollapsed && (
            <div className="mx-auto p-1.5 bg-[#2563EB] text-white rounded-lg">
              <Shield size={16} />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors hidden md:block"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Branch Selector dropdown & Search inside expanded sidebar */}
        {!isCollapsed && (
          <div className="px-4 py-3.5 border-b border-slate-800/60 space-y-3 shrink-0">
            {/* Branch selector */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Active Franchise
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
              >
                <option value="ALL">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sidebar search input */}
            <div className="relative flex items-center bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-lg text-xs hover:border-slate-750">
              <Search size={14} className="text-slate-500 mr-2" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent focus:outline-none text-slate-200 placeholder-slate-550 w-full text-[11px]"
              />
            </div>
          </div>
        )}

        {/* Grouped Accordions navigation links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Dashboard Home Quick Link */}
          <div className="mb-2">
            <Link
              to="/admin"
              className={`flex items-center px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                location.pathname === '/admin'
                  ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/15'
                  : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              <Home size={18} className="mr-3" />
              {!isCollapsed && <span>Dashboard Home</span>}
            </Link>
          </div>

          {/* Expandable Sidebar groups accordion */}
          {filteredGroups.map((group) => {
            const isGroupOpen = openGroups[group.name];
            const isGroupActive = group.links.some((l) => location.pathname === l.path);

            return (
              <div key={group.name} className="space-y-1">
                {/* Header group row */}
                {!isCollapsed ? (
                  <button
                    onClick={() => toggleGroup(group.name)}
                    className={`flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors`}
                  >
                    <span className="flex items-center gap-2">
                      {group.icon}
                      {group.name}
                    </span>
                    {isGroupOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                ) : (
                  <div className="w-full border-t border-slate-800/60 my-2 pt-2 flex justify-center text-slate-600">
                    {group.icon}
                  </div>
                )}

                {/* Sub-links */}
                <AnimatePresence initial={false}>
                  {(isGroupOpen || isCollapsed || searchQuery) && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-1 pl-2 md:pl-0"
                    >
                      {group.links.map((link) => {
                        const active = location.pathname === link.path;
                        return (
                          <li key={link.path}>
                            <Link
                              to={link.path}
                              title={isCollapsed ? link.name : ''}
                              className={`flex items-center px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                                active
                                  ? 'bg-[#2563EB]/10 text-white border-l-2 border-[#2563EB]'
                                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                              }`}
                            >
                              <span className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
                                {link.icon}
                              </span>
                              {!isCollapsed && <span>{link.name}</span>}
                            </Link>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer User Profile card */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/40 shrink-0">
          <div className="flex items-center justify-between gap-3 overflow-hidden">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-[#06B6D4] shrink-0 border border-[#06B6D4]/20 shadow-sm uppercase">
                {userName.slice(0, 2)}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-200 truncate leading-snug">
                    {userName}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium block truncate uppercase">
                    {role?.replace(/_/g, ' ') || 'Owner'}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="text-slate-450 hover:text-red-400 p-1.5 hover:bg-slate-850 rounded-lg transition-colors"
                title="Log Out"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Sticky Executive Header */}
        <header className="h-16 bg-[#111827] border-b border-slate-800/80 flex items-center px-4 md:px-6 justify-between shadow-sm shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-slate-300 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-300 hidden sm:block">
              ABC Group Management
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <span className="h-4 w-px bg-slate-800" />
            <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl uppercase">
              {role ? role.replace(/_/g, ' ') : 'Franchise Owner'}
            </span>
          </div>
        </header>

        {/* Content Render Outlet */}
        <div className="flex-1 overflow-auto bg-[#0F172A]">
          <Outlet />
        </div>

        {/* Mobile Sticky Bottom Navigation menu */}
        <div className="md:hidden bg-[#111827] border-t border-slate-800/80 h-14 shrink-0 flex items-center justify-around z-20">
          <Link
            to="/admin"
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#2563EB] transition-colors"
          >
            <Home size={18} />
            <span className="text-[9px] font-bold">Home</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#2563EB] transition-colors"
          >
            <Box size={18} />
            <span className="text-[9px] font-bold">Orders</span>
          </Link>
          <Link
            to="/admin/kitchen"
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#2563EB] transition-colors"
          >
            <Activity size={18} />
            <span className="text-[9px] font-bold">Kitchen</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#2563EB] transition-colors"
          >
            <Menu size={18} />
            <span className="text-[9px] font-bold">Menu</span>
          </button>
        </div>
      </main>

      {/* Mobile Sidebar overlay Drawer slider */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#111827] z-45 flex flex-col md:hidden border-r border-slate-800"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="p-1.5 bg-[#2563EB] text-white rounded-lg">
                    <Shield size={16} />
                  </div>
                  <span className="font-display font-bold text-sm tracking-tight text-white uppercase">
                    ABC
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>

              {/* Branch Selector mobile */}
              <div className="px-4 py-3 border-b border-slate-800">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg p-2 focus:outline-none"
                >
                  <option value="ALL">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Links list in mobile menu */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {sidebarGroups.map((group) => (
                  <div key={group.name} className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-2.5 mb-1.5">
                      {group.name}
                    </span>
                    <ul className="space-y-0.5">
                      {group.links.map((link) => (
                        <li key={link.path}>
                          <Link
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/50 hover:text-white"
                          >
                            <span className="mr-3 text-slate-500">{link.icon}</span>
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Footer logout profile mobile */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-850 flex items-center justify-center font-bold text-xs text-[#06B6D4] uppercase">
                    {userName.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 leading-snug">{userName}</h4>
                    <span className="text-[10px] text-slate-550 uppercase">Owner</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-450 hover:text-red-400 p-1.5 hover:bg-slate-850 rounded-lg"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
