import React, { useState } from 'react';
import { Menu, X, Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../theme/theme-provider';
import { useToast } from '../components/ui/Toast';
import { slideRight, fadeIn } from '../theme/animations';

export interface SidebarLink {
  label: string;
  icon: React.ReactNode;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
}

export interface DashboardLayoutProps {
  sidebarLinks: SidebarLink[];
  logo?: React.ReactNode;
  userAvatar?: React.ReactNode;
  userName?: string;
  userRole?: string;
  topBarActions?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebarLinks,
  logo,
  userAvatar,
  userName = 'Staff Member',
  userRole = 'Manager',
  topBarActions,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const handleThemeCycle = () => {
    if (theme === 'light') {
      setTheme('dark');
      toast.info('Switched to Dark mode');
    } else if (theme === 'dark') {
      setTheme('system');
      toast.info('Switched to System theme');
    } else {
      setTheme('light');
      toast.info('Switched to Light mode');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun size={18} />;
    if (theme === 'dark') return <Moon size={18} />;
    return <Monitor size={18} />;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card border-r border-border/80 text-foreground w-64 select-none">
      {/* Brand logo header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border/40 flex-shrink-0">
        {logo || (
          <div className="flex items-center gap-2.5 font-display font-extrabold text-xl tracking-tight">
            <span className="text-primary text-2xl font-black">🔥</span>
            <span>Oven Xpress</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden p-1.5 hover:bg-secondary/60 rounded-lg text-muted-foreground hover:text-foreground focus:outline-none"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
        {sidebarLinks.map((link, idx) => (
          <a
            key={idx}
            href={link.href}
            onClick={(e) => {
              if (link.onClick) {
                e.preventDefault();
                link.onClick();
              }
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-display font-bold text-sm tracking-wide transition-all duration-200
              ${
                link.isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }
            `}
          >
            <span className="flex-shrink-0">{link.icon}</span>
            <span>{link.label}</span>
          </a>
        ))}
      </nav>

      {/* User identity & Theme options footer */}
      <div className="p-4 border-t border-border/40 flex flex-col gap-4 flex-shrink-0 bg-secondary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userAvatar || (
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-display font-extrabold text-sm shadow-inner">
                {userName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold font-display tracking-tight text-foreground/95 truncate">
                {userName}
              </span>
              <span className="text-xs font-sans text-muted-foreground leading-none">
                {userRole}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleThemeCycle}
            className="p-2 bg-secondary border border-border hover:bg-secondary-foreground/10 text-muted-foreground hover:text-foreground rounded-xl transition-all duration-200 focus:outline-none"
            aria-label="Toggle theme mode"
          >
            {getThemeIcon()}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      {/* Desktop sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile drawer menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop */}
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Sidebar drawer content */}
            <motion.div
              variants={slideRight}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative h-full z-10 flex"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-card/60 backdrop-blur-md border-b border-border/80 sticky top-0 z-40 select-none">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-secondary/60 rounded-xl text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div className="font-display font-bold text-lg tracking-tight hidden lg:block">
              Terminal Workspace
            </div>
          </div>

          {topBarActions && <div className="flex items-center gap-4">{topBarActions}</div>}
        </header>

        {/* Workspace body */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
