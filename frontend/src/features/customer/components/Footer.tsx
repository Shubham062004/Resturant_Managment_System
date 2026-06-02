import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../shared/components/ui/Toast';
import { Flame, Send, Facebook, Twitter, Instagram, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const toast = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    toast.success('Successfully subscribed to Oven Xpress newsletters!');
    setEmail('');
  };

  return (
    <footer className="bg-card border-t border-border/80 pt-16 pb-8 text-muted-foreground select-none">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand identity column */}
        <div className="space-y-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display font-extrabold text-xl tracking-tight text-white"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span>Oven Xpress</span>
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground/80">
            Enterprise restaurant systems serving premium fire-baked pizza catalogs, gourmet
            burgers, and quick counter orders.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">
              <Facebook size={18} />
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              <Twitter size={18} />
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              <Instagram size={18} />
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              <Github size={18} />
            </a>
          </div>
        </div>

        {/* Categories Directory column */}
        <div className="space-y-4">
          <h3 className="text-white font-display font-bold text-sm tracking-wide">
            Popular Choices
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/search?category=pizza" className="hover:text-primary transition-colors">
                Firebrick Pizzas
              </Link>
            </li>
            <li>
              <Link to="/search?category=burgers" className="hover:text-primary transition-colors">
                Craft Burgers
              </Link>
            </li>
            <li>
              <Link to="/search?category=chinese" className="hover:text-primary transition-colors">
                Chinese Bistro
              </Link>
            </li>
            <li>
              <Link to="/search?category=desserts" className="hover:text-primary transition-colors">
                Gourmet Desserts
              </Link>
            </li>
            <li>
              <Link to="/search?category=drinks" className="hover:text-primary transition-colors">
                Cold Drinks
              </Link>
            </li>
          </ul>
        </div>

        {/* Company information column */}
        <div className="space-y-4">
          <h3 className="text-white font-display font-bold text-sm tracking-wide">Oven Xpress</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:text-primary transition-colors">
                About Our Group
              </Link>
            </li>
            <li>
              <Link to="/branches" className="hover:text-primary transition-colors">
                Outposts & Branches
              </Link>
            </li>
            <li>
              <Link to="/offers" className="hover:text-primary transition-colors">
                Promotion Coupons
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary transition-colors">
                Contact Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter subscription column */}
        <div className="space-y-4">
          <h3 className="text-white font-display font-bold text-sm tracking-wide">Newsletter</h3>
          <p className="text-xs leading-relaxed text-muted-foreground/80">
            Subscribe to receive details on featured restaurant recipes, weekly discounts, and
            outpost schedules.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2 relative">
            <input
              type="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-colors pr-10"
              required
            />
            <button
              type="submit"
              className="absolute right-2.5 top-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Subscribe to newsletter"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-border/40 mt-12 pt-8 flex flex-col sm:flex-row justify-between text-xs text-muted-foreground/60 font-sans gap-4">
        <span>© {new Date().getFullYear()} Oven Xpress Group Inc. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
          <a href="#" className="hover:underline">
            POS API Clearances
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
