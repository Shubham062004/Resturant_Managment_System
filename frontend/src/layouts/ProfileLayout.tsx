import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { User, ClipboardList, Heart } from 'lucide-react';

export const ProfileLayout: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Profile Overview', path: '/profile', icon: User },
    { name: 'Order History', path: '/orders', icon: ClipboardList },
    { name: 'My Favorites', path: '/favorites', icon: Heart },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1">
          <div className="glass-panel p-5 rounded-xl border border-border/60 shadow-lg space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-display px-3">
              Account settings
            </h2>
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.name} to={item.path}>
                    <div
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium font-sans transition-all duration-150 select-none cursor-pointer ${
                        isActive
                          ? 'bg-primary text-white shadow-md shadow-primary/10'
                          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                      }`}
                    >
                      <item.icon size={16} className="flex-shrink-0" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content detail panel */}
        <section className="lg:col-span-3">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default ProfileLayout;
