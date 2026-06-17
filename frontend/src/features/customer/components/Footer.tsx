import {
  Flame,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Github,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useToast } from '../../../shared/components/ui/Toast';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const toast = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    toast.success('Successfully subscribed to ABC newsletters!');
    setEmail('');
  };

  return (
    <footer className="bg-[#08070F] border-t border-white/5 pt-20 pb-10 text-neutral-400 select-none font-sans relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-lg h-48 bg-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        {/* Brand identity column */}
        <div className="space-y-6 lg:pr-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display font-bold text-2xl tracking-tight text-white group w-max"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span>ABC</span>
          </Link>
          <p className="text-sm leading-relaxed text-neutral-400">
            Premium food delivery service bringing fire-baked pizzas, gourmet
            burgers, and authentic cuisines directly to your door in 30 minutes.
          </p>
          <div className="flex gap-4 pt-2">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all"
            >
              <Facebook size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all"
            >
              <Twitter size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all"
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>

        {/* Categories Directory column */}
        <div className="space-y-6">
          <h3 className="text-white font-display font-bold text-base tracking-wide uppercase">
            Top Cuisines
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/search?category=pizza"
                className="hover:text-primary transition-colors flex items-center gap-2"
              >
                <span>🍕</span> Wood-fired Pizza
              </Link>
            </li>
            <li>
              <Link
                to="/search?category=burgers"
                className="hover:text-primary transition-colors flex items-center gap-2"
              >
                <span>🍔</span> Gourmet Burgers
              </Link>
            </li>
            <li>
              <Link
                to="/search?category=chinese"
                className="hover:text-primary transition-colors flex items-center gap-2"
              >
                <span>🍜</span> Asian Fusion
              </Link>
            </li>
            <li>
              <Link
                to="/search?category=desserts"
                className="hover:text-primary transition-colors flex items-center gap-2"
              >
                <span>🍰</span> Sweet Desserts
              </Link>
            </li>
            <li>
              <Link
                to="/search?category=healthy"
                className="hover:text-primary transition-colors flex items-center gap-2"
              >
                <span>🥗</span> Healthy Salads
              </Link>
            </li>
          </ul>
        </div>

        {/* Company information column */}
        <div className="space-y-6">
          <h3 className="text-white font-display font-bold text-base tracking-wide uppercase">
            Company
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/about"
                className="hover:text-primary transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/branches"
                className="hover:text-primary transition-colors"
              >
                Find a Restaurant
              </Link>
            </li>
            <li>
              <Link
                to="/offers"
                className="hover:text-primary transition-colors"
              >
                Deals & Offers
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-primary transition-colors"
              >
                Help & Support
              </Link>
            </li>
            <li>
              <Link
                to="/rider-signup"
                className="hover:text-primary transition-colors"
              >
                Become a Rider
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter subscription column */}
        <div className="space-y-6">
          <h3 className="text-white font-display font-bold text-base tracking-wide uppercase">
            Newsletter
          </h3>
          <p className="text-sm leading-relaxed text-neutral-400">
            Subscribe to get exclusive promo codes, special offers, and updates
            on new menu items.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2 relative">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-primary/50 transition-colors pr-12"
              required
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 w-10 bg-primary hover:bg-primary-hover text-white rounded-lg flex items-center justify-center transition-all shadow-md shadow-primary/20"
              aria-label="Subscribe"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <span>
          © {new Date().getFullYear()} ABC Restaurant Group. All rights
          reserved.
        </span>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <a href="#" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Cookie Policy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Refund Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
