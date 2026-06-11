import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../../app/store';
import { logout } from '../../auth/store/authSlice';
import { useToast } from '../../../shared/components/ui/Toast';
import Avatar from '../../../shared/components/ui/Avatar';
import { Menu, X, Flame, Search, MapPin, Tag, Home, LogOut, User, ShoppingBag } from 'lucide-react';
import { slideLeft } from '../../../shared/theme/animations';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { selectedBranch } = useAppSelector((state) => state.customer);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Menu', path: '/restaurants', icon: Flame },
    { name: 'Offers', path: '/offers', icon: Tag },
    { name: 'Branches', path: '/branches', icon: MapPin },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Cart', path: '/cart', icon: ShoppingBag },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const getAvatarSrc = () => {
    if (!user || !user.avatar) return undefined;
    if (user.avatar.startsWith('http')) return user.avatar;
    const apiBaseUrl = import.meta.env.VITE_API_URL;
    return `${apiBaseUrl}${user.avatar}`;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-card/90 backdrop-blur-md border-b border-border/80 shadow-md'
          : 'bg-transparent'
      }`}
    >
      {/* Brand logo & branch indicator */}
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display font-extrabold text-xl tracking-tight text-white select-none"
        >
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/10">
            <Flame className="w-5.5 h-5.5 text-white" />
          </div>
          <span>ABC</span>
        </Link>

        {selectedBranch && (
          <Link
            to="/branches"
            className="hidden lg:flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all duration-200"
          >
            <MapPin size={12} />
            <span>Outpost: {selectedBranch.name.replace('ABC - ', '')}</span>
          </Link>
        )}
      </div>

      {/* Links navigation */}
      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`font-display text-sm font-semibold tracking-wide transition-colors ${
                isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Call to Actions / User profile node */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4 select-none">
            <Link
              to="/profile"
              className="flex items-center gap-3.5 hover:opacity-85 transition-opacity"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-white leading-tight">{`${user.firstName} ${user.lastName}`}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
              <Avatar
                src={getAvatarSrc()}
                name={`${user.firstName} ${user.lastName}`}
                size="sm"
                className="border border-border/80"
              />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
              title="Logout client"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login">
              <button className="bg-transparent hover:bg-secondary/45 text-white font-display font-semibold text-sm px-4 py-2.5 rounded-lg border border-border/60 transition-all duration-200">
                Unlock Node
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-primary hover:bg-primary-hover text-white font-display font-semibold text-sm px-4.5 py-2.5 rounded-lg shadow-md transition-all duration-200">
                Onboard
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Hamburger drawer trigger */}
      <div className="flex md:hidden items-center gap-3.5">
        {selectedBranch && (
          <Link
            to="/branches"
            className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full"
          >
            <MapPin size={10} />
            <span>{selectedBranch.name.replace('ABC - ', '').split(' ')[0]}</span>
          </Link>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-white transition-all"
          aria-expanded={isOpen}
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 top-20 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            />
            {/* Side Drawer */}
            <motion.div
              variants={slideLeft}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed right-0 top-20 bottom-0 w-72 bg-card border-l border-border/80 shadow-2xl z-30 md:hidden flex flex-col p-6 space-y-6"
            >
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link key={link.name} to={link.path}>
                      <div
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-primary text-white shadow-md shadow-primary/15'
                            : 'text-muted-foreground hover:bg-secondary/45 hover:text-foreground'
                        }`}
                      >
                        <link.icon size={18} />
                        <span>{link.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-border/40 my-2" />

              {/* Mobile Auth widgets */}
              <div className="flex-grow flex flex-col justify-end">
                {user ? (
                  <div className="space-y-4">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 bg-secondary/35 p-3 rounded-xl border border-border/50"
                    >
                      <Avatar
                        src={getAvatarSrc()}
                        name={`${user.firstName} ${user.lastName}`}
                        size="sm"
                      />
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{`${user.firstName} ${user.lastName}`}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                          {user.role}
                        </p>
                      </div>
                    </Link>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/profile" className="w-full">
                        <button className="w-full flex items-center justify-center gap-1.5 bg-secondary hover:bg-secondary/85 text-foreground text-xs font-semibold py-2.5 rounded-lg transition-all">
                          <User size={14} /> Profile
                        </button>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-1.5 border border-danger/40 hover:bg-danger/10 text-danger text-xs font-semibold py-2.5 rounded-lg transition-all"
                      >
                        <LogOut size={14} /> Log Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/login" className="w-full">
                      <button className="w-full bg-secondary hover:bg-secondary/80 text-white font-display font-semibold text-sm py-3 rounded-lg border border-border/60 transition-all">
                        Log In
                      </button>
                    </Link>
                    <Link to="/register" className="w-full">
                      <button className="w-full bg-primary hover:bg-primary-hover text-white font-display font-semibold text-sm py-3 rounded-lg shadow-md transition-all">
                        Onboard
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
