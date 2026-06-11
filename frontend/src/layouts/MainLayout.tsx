import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAppDispatch, useAppSelector } from '../app/store';
import { logout } from '../features/auth/store/authSlice';
import Avatar from '../shared/components/ui/Avatar';
import AIRestaurantAssistant from '../features/ai/components/AIRestaurantAssistant';
import {
  LayoutDashboard,
  TableProperties,
  LogOut,
  Menu,
  X,
  Flame,
  Sparkles,
  User as UserIcon,
  BarChart3,
} from 'lucide-react';

export const MainLayout = ({ children }: { children?: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tables Plan', path: '/tables', icon: TableProperties },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'My Profile', path: '/profile', icon: UserIcon },
    { name: 'Design System', path: '/design-system', icon: Sparkles },
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const apiBaseUrl = import.meta.env.VITE_API_URL;
  const getAvatarSrc = () => {
    if (!user || !user.avatar) return undefined;
    if (user.avatar.startsWith('http')) return user.avatar;
    return `${apiBaseUrl}${user.avatar}`;
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground overflow-hidden">
      <Helmet>
        <title>ABC - Restaurant Management System</title>
        <meta name="description" content="Enterprise-grade Restaurant Management System featuring AI insights, live kitchen displays, and seamless delivery integration." />
        <html lang="en" />
      </Helmet>
      
      {/* Side Navigation Panel */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="hidden md:flex flex-col bg-card border-r border-border shrink-0"
          >
            {/* Branding Header */}
            <div className="h-20 flex items-center gap-3 px-6 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-white">
                ABC
              </span>
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.name} to={item.path}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/15'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-display">{item.name}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Logout Panel Footer */}
            <div className="p-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 font-medium transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-display">Logout Client</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Workspace Top Header */}
        <header className="h-20 bg-card/60 backdrop-blur-md border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold bg-secondary px-3 py-1.5 rounded-md border border-border">
              Station #01 - FOH Desk
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <Link
                to="/profile"
                className="flex items-center gap-3.5 hover:opacity-85 transition-all select-none"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white">{`${user.firstName} ${user.lastName}`}</p>
                  <p className="text-xs text-muted-foreground font-medium capitalize">
                    {user.role.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
                <Avatar
                  src={getAvatarSrc()}
                  name={`${user.firstName} ${user.lastName}`}
                  size="sm"
                  className="border border-border/80"
                />
              </Link>
            )}
          </div>
        </header>

        {/* Dynamic Outlet Area */}
        <main className="flex-1 overflow-y-auto bg-background/50 p-6 md:p-10">
          {children || <Outlet />}
        </main>
        <AIRestaurantAssistant />
      </div>
    </div>
  );
};

export default MainLayout;
