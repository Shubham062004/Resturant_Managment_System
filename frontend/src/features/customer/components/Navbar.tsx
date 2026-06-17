import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Flame,
  Search,
  MapPin,
  Tag,
  Home,
  LogOut,
  User,
  ShoppingBag,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../../app/store';
import Avatar from '../../../shared/components/ui/Avatar';
import { useToast } from '../../../shared/components/ui/Toast';
import { slideLeft } from '../../../shared/theme/animations';
import { logout } from '../../auth/store/authSlice';
import { useCart } from '../../cart/store/cartQueries';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { selectedBranch } = useAppSelector((state) => state.customer);
  const { data: cart } = useCart(isAuthenticated);

  const cartItemCount = cart?.items?.length || 0;

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Menu', path: '/restaurants', icon: Flame },
    { name: 'Offers', path: '/offers', icon: Tag },
    { name: 'Branches', path: '/branches', icon: MapPin },
    { name: 'Search', path: '/search', icon: Search },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
          ? 'bg-[#08070F]/90 backdrop-blur-md border-b border-white/5 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      {/* Brand logo & branch indicator */}
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display font-bold text-xl tracking-tight text-white select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl">ABC</span>
        </Link>

        {selectedBranch && (
          <Link
            to="/branches"
            className="hidden lg:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-emerald-500/20 transition-all duration-200"
          >
            <MapPin size={12} />
            <span>
              Delivering to: {selectedBranch.name.replace('ABC - ', '')}
            </span>
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
              className={`font-semibold text-sm transition-colors relative ${
                isActive ? 'text-primary' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {link.name}
              {isActive && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Call to Actions / User profile */}
      <div className="hidden md:flex items-center gap-5">
        {/* Cart Icon */}
        <Link
          to="/cart"
          className="relative p-2 text-neutral-400 hover:text-white transition-colors"
        >
          <ShoppingBag size={22} />
          {cartItemCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md border border-[#08070F]">
              {cartItemCount}
            </span>
          )}
        </Link>

        <div className="w-[1px] h-6 bg-white/10 mx-1" />

        {user ? (
          <div className="flex items-center gap-4 select-none">
            <Link
              to="/profile"
              className="flex items-center gap-3 hover:bg-white/5 px-2 py-1.5 rounded-lg transition-colors"
            >
              <div className="text-right">
                <p className="text-sm font-bold text-white leading-none">{`${user.firstName}`}</p>
                <p className="text-[10px] text-primary font-semibold mt-1 uppercase tracking-widest">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
              <Avatar
                src={getAvatarSrc()}
                name={`${user.firstName} ${user.lastName}`}
                size="sm"
                className="border-2 border-white/10"
              />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login">
              <button className="text-white hover:text-primary font-bold text-sm px-4 py-2 transition-colors">
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-primary hover:bg-primary-hover text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Hamburger drawer trigger */}
      <div className="flex md:hidden items-center gap-4">
        <Link to="/cart" className="relative text-neutral-300">
          <ShoppingBag size={22} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-[#08070F]">
              {cartItemCount}
            </span>
          )}
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg bg-white/5 text-neutral-300 hover:text-white transition-all"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 top-20 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            />
            <motion.div
              variants={slideLeft}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed right-0 top-20 bottom-0 w-[280px] bg-[#111019] border-l border-white/5 shadow-2xl z-30 md:hidden flex flex-col p-6 space-y-6"
            >
              {selectedBranch && (
                <Link
                  to="/branches"
                  className="flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold py-2.5 rounded-xl border border-emerald-500/20"
                >
                  <MapPin size={14} />
                  Delivering to: {selectedBranch.name.split(' ')[0]}
                </Link>
              )}

              <nav className="flex flex-col gap-2 flex-grow">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link key={link.name} to={link.path}>
                      <div
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                          isActive
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <link.icon size={18} />
                        <span>{link.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-white/5 my-2" />

              <div className="flex flex-col justify-end">
                {user ? (
                  <div className="space-y-4">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10"
                    >
                      <Avatar
                        src={getAvatarSrc()}
                        name={`${user.firstName} ${user.lastName}`}
                        size="sm"
                      />
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{`${user.firstName} ${user.lastName}`}</p>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5">
                          {user.role}
                        </p>
                      </div>
                    </Link>
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/profile" className="w-full">
                        <button className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-3 rounded-xl transition-all">
                          <User size={14} /> Profile
                        </button>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold py-3 rounded-xl transition-all"
                      >
                        <LogOut size={14} /> Log Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/login" className="w-full">
                      <button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold text-sm py-3 rounded-xl border border-white/10 transition-all">
                        Sign In
                      </button>
                    </Link>
                    <Link to="/register" className="w-full">
                      <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-sm py-3 rounded-xl shadow-lg transition-all">
                        Create Account
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
