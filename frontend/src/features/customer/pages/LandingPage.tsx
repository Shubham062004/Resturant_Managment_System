import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch } from '../../../app/store';
import { addRecentSearch } from '../store/customerSlice';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import Card, { CardContent } from '../../../shared/components/ui/Card';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  Search,
  ArrowRight,
  Star,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  Sparkles,
  Smartphone,
  Play,
  Mail,
  Flame
} from 'lucide-react';
import mockCategories from '../../../shared/data/categories';
import mockRestaurants from '../../../shared/data/restaurants';
import mockTestimonials from '../../../shared/data/testimonials';
import { fadeUp, scaleIn } from '../../../shared/theme/animations';

export const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Save search query to Redux customer slice
    dispatch(addRecentSearch(query));
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    toast.success('Thank you for subscribing to Oven Xpress updates!');
    setNewsletterEmail('');
  };

  return (
    <>
      <SEO
        title="Fire-Baked Pizza & Crafted Gourmet Burgers"
        description="Experience the peak of restaurant automation and culinary delight. Order from Oven Xpress outposts, track live counter progress, and savor fire-baked pizzas."
        keywords="Oven Xpress, pizza delivery, gourmet burgers, local food outposts, smart kitchen order tracker"
      />

      <div className="flex flex-col w-full overflow-hidden">
        {/* HERO SECTION */}
        <section className="relative min-h-[85vh] flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background py-20 px-6 border-b border-border/40">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Branding & Value Proposition */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left z-10">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-primary/15 border border-primary/20 text-primary text-xs font-bold px-4 py-1.5 rounded-full select-none"
              >
                <Sparkles size={14} className="animate-pulse" />
                <span>Next-Gen Dining Experience</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1]"
              >
                Craving Fire-baked <span className="text-primary bg-clip-text">Pizza</span> or Gourmet <span className="text-primary bg-clip-text">Burgers</span>?
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans"
              >
                Order from local Oven Xpress outposts with lightning fast delivery, real-time smart kitchen tracking, and customizable meal modifications.
              </motion.p>

              {/* Global Search Entry Point */}
              <motion.form
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                onSubmit={handleSearchSubmit}
                className="max-w-md mx-auto lg:mx-0"
              >
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full">
                    <Input
                      type="text"
                      placeholder="Search dishes, burgers, cuisines..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      prefixIcon={<Search size={18} />}
                      className="bg-card/90 border-border/80 text-white placeholder-muted-foreground shadow-lg h-12 focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full sm:w-auto h-12 px-6 shadow-md hover:shadow-primary/20 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <span>Search</span>
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.form>

              {/* CTAs & Stat highlights */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <Link to="/branches">
                  <Button variant="outline" size="sm" className="border-border/60 hover:bg-secondary/40 font-semibold text-white">
                    Select Outpost
                  </Button>
                </Link>
                <Link to="/offers">
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5 flex items-center gap-1">
                    View Promotion Coupons
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Hero Image Mockup (Aesthetic visual element) */}
            <div className="lg:col-span-5 flex justify-center z-10">
              <motion.div
                variants={scaleIn}
                initial="initial"
                animate="animate"
                className="relative w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-border/60"
              >
                <img
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80"
                  alt="Delicious Fire-Baked Pepperoni Pizza"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 select-none">
                  <div className="bg-primary/95 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full self-start mb-2 flex items-center gap-1 shadow">
                    <Flame size={12} className="animate-bounce" />
                    <span>Freshly Baked</span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-white">Gourmet Pepperoni Double Crust</h3>
                  <p className="text-xs text-foreground/80 font-sans mt-1">Baked in our smart stone ovens at 800°F</p>
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* POPULAR CATEGORIES CAROUSEL/GRID */}
        <section className="py-20 px-6 max-w-6xl mx-auto w-full border-b border-border/40">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-display font-extrabold tracking-tight text-white">Popular Categories</h2>
            <p className="text-muted-foreground text-sm font-sans max-w-md mx-auto">
              Skip search and jump straight into our chef-curated selections.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {mockCategories.map((category, index) => (
              <motion.div
                key={category.id}
                variants={fadeUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: '-50px' }}
                custom={index}
                className="group"
              >
                <Link to={`/search?category=${category.slug}`} className="block">
                  <Card variant="interactive" className="h-full bg-card/60 hover:bg-card border-border/60 hover:border-primary/30 flex flex-col items-center p-5 text-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border/60 group-hover:border-primary/50 transition-colors mb-4 shadow">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-display font-bold text-sm text-white group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FEATURED OUTPOSTS / RESTAURANTS */}
        <section className="py-20 px-6 max-w-6xl mx-auto w-full border-b border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
            <div className="space-y-3 text-left">
              <h2 className="text-3xl font-display font-extrabold tracking-tight text-white">Featured Restaurants & Outposts</h2>
              <p className="text-muted-foreground text-sm font-sans max-w-md">
                Pre-selected and audited kitchen nodes maintaining peak delivery speed and high-level sanitization ratings.
              </p>
            </div>
            <Link to="/branches">
              <Button variant="outline" size="sm" className="text-xs border-border/60 text-white font-semibold flex items-center gap-1">
                <span>View All Outposts</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockRestaurants.slice(0, 3).map((res) => (
              <Card key={res.id} variant="default" className="flex flex-col bg-card/50 border-border/80 shadow-md">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={res.image}
                    alt={res.name}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {res.featured && (
                    <span className="absolute top-3.5 left-3.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                      <Award size={10} />
                      <span>Top Rated</span>
                    </span>
                  )}
                  <span className="absolute bottom-3.5 right-3.5 bg-background/90 backdrop-blur text-foreground text-[10px] font-bold px-2 py-1 rounded-md">
                    {res.deliveryTime}
                  </span>
                </div>

                <CardContent className="flex-grow flex flex-col justify-between p-5 space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-white tracking-tight leading-tight">{res.name}</h3>
                    <p className="text-xs text-muted-foreground font-sans mt-1.5 flex flex-wrap gap-1">
                      {res.categories.join(' • ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/40 pt-4 text-xs font-sans">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={14} fill="currentColor" />
                      <span className="font-semibold text-white">{res.rating}</span>
                      <span className="text-muted-foreground">({res.reviewsCount})</span>
                    </div>

                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {res.distance}
                      </span>
                      <span>Min: ${res.minOrder.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="py-20 px-6 max-w-6xl mx-auto w-full border-b border-border/40">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-display font-extrabold tracking-tight text-white">Why Oven Xpress?</h2>
            <p className="text-muted-foreground text-sm font-sans max-w-md mx-auto">
              Combining ancient culinary baking secrets with cutting-edge kitchen logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="glass-panel p-6 rounded-xl border border-border/40 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto md:mx-0 shadow-sm border border-primary/20">
                <Flame size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-white">800°F Stone Hearth</h3>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                Our proprietary stone ovens bake each custom pizza in less than 3 minutes, locked under supreme temperature controls for the perfect crust.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-border/40 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto md:mx-0 shadow-sm border border-primary/20">
                <Clock size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-white">Smart Kitchen Tracking</h3>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                Watch your order progress through prep, baking, packing, and dispatch with our live-updating digital kitchen ticket dashboards.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-border/40 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto md:mx-0 shadow-sm border border-primary/20">
                <TrendingUp size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-white">Eco-friendly Delivery</h3>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                All outposts utilize optimized electric courier routes, delivering food hot in thermally sealed containers with minimum carbon impact.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 px-6 max-w-6xl mx-auto w-full border-b border-border/40">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl font-display font-extrabold tracking-tight text-white">How It Works</h2>
            <p className="text-muted-foreground text-sm font-sans max-w-md mx-auto">
              Get premium gourmet meals delivered directly to your doorstep in 3 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative select-none">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4 relative">
              <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center font-display font-extrabold text-lg text-white relative z-10 shadow">
                01
              </div>
              <h3 className="font-display font-bold text-base text-white">Pick Nearest Outpost</h3>
              <p className="text-xs text-muted-foreground font-sans max-w-xs leading-relaxed">
                Check our branches map. Select the closest Oven Xpress outpost to unlock its customized food catalog.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4 relative">
              <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center font-display font-extrabold text-lg text-white relative z-10 shadow">
                02
              </div>
              <h3 className="font-display font-bold text-base text-white">Customize & Order</h3>
              <p className="text-xs text-muted-foreground font-sans max-w-xs leading-relaxed">
                Build your perfect pizzas or burgers. Modify toppings, apply checkout coupons, and pay securely.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4 relative">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center font-display font-extrabold text-lg text-white relative z-10 shadow shadow-primary/20">
                03
              </div>
              <h3 className="font-display font-bold text-base text-white">Live Tracking & Savor</h3>
              <p className="text-xs text-muted-foreground font-sans max-w-xs leading-relaxed">
                Watch the prep dashboard live. Savor delicious fire-baked culinary creations delivered blazing hot.
              </p>
            </div>
          </div>
        </section>

        {/* CUSTOMER TESTIMONIALS */}
        <section className="py-20 px-6 max-w-6xl mx-auto w-full border-b border-border/40">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-display font-extrabold tracking-tight text-white">What Our Foodies Say</h2>
            <p className="text-muted-foreground text-sm font-sans max-w-md mx-auto">
              Hear directly from some of our verified customers and active food critics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockTestimonials.map((t) => (
              <Card key={t.id} className="bg-card/45 border-border/60 p-6 flex flex-col justify-between space-y-6">
                <p className="text-sm text-foreground/80 font-sans italic leading-relaxed">
                  &ldquo;{t.comment}&rdquo;
                </p>
                <div className="flex items-center gap-3.5 border-t border-border/40 pt-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-border/60"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white leading-none">{t.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 font-semibold">{t.role}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-0.5 text-yellow-500">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs text-white font-bold">{t.rating}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* APP DOWNLOAD CTA */}
        <section className="py-20 px-6 max-w-6xl mx-auto w-full border-b border-border/40">
          <div className="relative rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/35 border border-border/60 p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-6 max-w-xl text-center md:text-left z-10">
              <h2 className="text-3xl font-display font-extrabold tracking-tight text-white">Order Faster on the Oven Xpress App</h2>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                Download our companion mobile application for iOS and Android. Save favorite addresses, manage payment cards, receive local deals, and unlock one-tap reorders.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Button variant="primary" size="sm" className="flex items-center gap-2">
                  <Smartphone size={16} />
                  <span>Download App Store</span>
                </Button>
                <Button variant="outline" size="sm" className="border-border/60 text-white flex items-center gap-2 hover:bg-secondary/40">
                  <Play size={14} fill="currentColor" />
                  <span>Google Play Store</span>
                </Button>
              </div>
            </div>
            {/* Visual Phone Mockup */}
            <div className="relative w-48 h-64 md:h-80 border-4 border-border/80 rounded-3xl bg-black overflow-hidden flex-shrink-0 shadow-2xl flex items-center justify-center select-none">
              <div className="absolute top-0 w-24 h-4 bg-border/80 rounded-b-xl z-20" />
              <div className="w-full h-full flex flex-col justify-between p-4 bg-gradient-to-b from-card to-background text-center relative">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mx-auto mt-4">
                  <Flame size={12} className="text-primary" />
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider block mt-2">Oven Xpress Mobile</span>
                <span className="text-[8px] text-muted-foreground block font-sans">Active Location: Midtown</span>
                <div className="bg-primary hover:bg-primary-hover text-[8px] text-white py-1.5 px-3 rounded-md mt-auto font-display font-bold">
                  Quick Track #7209
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NEWSLETTER SECTION */}
        <section className="py-20 px-6 max-w-md mx-auto w-full text-center">
          <div className="space-y-4 mb-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto border border-primary/20 shadow-sm">
              <Mail size={22} />
            </div>
            <h2 className="text-2xl font-display font-extrabold tracking-tight text-white">Join the Newsletter</h2>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Stay in the loop with weekly discounts, new chef recipes, and upcoming branch openings.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="bg-card/90 border-border/80 text-xs py-2.5 h-11"
              required
            />
            <Button type="submit" variant="primary" className="h-11 text-xs px-5 shadow">
              Subscribe
            </Button>
          </form>
        </section>
      </div>
    </>
  );
};

export default LandingPage;
