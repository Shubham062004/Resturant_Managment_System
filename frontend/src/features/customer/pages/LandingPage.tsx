import { motion } from 'framer-motion';
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
  Flame,
  ShieldCheck,
  Truck,
  Zap,
  ChefHat,
  Copy,
  Tag,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import Card, { CardContent } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import SkeletonCard from '../../../shared/components/ui/SkeletonCard';
import { useToast } from '../../../shared/components/ui/Toast';
import mockCategories from '../../../shared/data/categories';
import mockRestaurants from '../../../shared/data/restaurants';
import mockTestimonials from '../../../shared/data/testimonials';
import { fadeUp, scaleIn } from '../../../shared/theme/animations';
import { useActiveCoupons } from '../../cart/store/cartQueries';
import CategoryPill from '../components/CategoryPill';
import FoodCard from '../components/FoodCard';
import { useFeaturedProducts, useRestaurants } from '../store/catalogQueries';
import { addRecentSearch } from '../store/customerSlice';

export const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { selectedBranch } = useAppSelector((state) => state.customer);

  // API data
  const { data: featuredRes, isLoading: featuredLoading } = useFeaturedProducts();
  const featuredProducts = featuredRes?.data ?? [];
  const { data: restaurantsRes, isLoading: restaurantsLoading } = useRestaurants({
    page: 1,
    limit: 6,
  });
  const restaurants = restaurantsRes?.data ?? [];
  const { data: coupons = [] } = useActiveCoupons();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    dispatch(addRecentSearch(query));
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast.success('Thank you for subscribing to ABC updates!');
    setNewsletterEmail('');
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon "${code}" copied!`);
  };

  const heroImages = [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
  ];

  const stats = [
    { icon: Flame, label: 'Fresh Dishes', value: '500+' },
    { icon: MapPin, label: 'Branches', value: '20+' },
    { icon: Star, label: 'Avg Rating', value: '4.8★' },
    { icon: Truck, label: 'Delivery', value: '30 min' },
  ];

  return (
    <>
      <SEO
        title="ABC Restaurant — Order Food Online | Pizza, Burgers & More"
        description="Order delicious food from ABC Restaurant. Fire-baked pizzas, gourmet burgers, and authentic cuisines. Fast delivery in 30 minutes."
        keywords="ABC restaurant, food delivery, pizza order online, burger delivery, restaurant near me"
      />

      <div className="flex flex-col w-full overflow-hidden">
        {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
        <section className="relative min-h-[88vh] flex items-center bg-[#08070F] py-16 px-6 overflow-hidden">
          {/* Background gradient effects */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left: Content */}
            <div className="lg:col-span-6 space-y-7 text-center lg:text-left">
              {/* Delivery badge */}
              {selectedBranch ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full"
                >
                  <MapPin size={14} />
                  <span>Delivering from: {selectedBranch.name}</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-4 py-2 rounded-full"
                >
                  <Zap size={14} className="animate-pulse" />
                  <span>Order & get delivered in 30 minutes</span>
                </motion.div>
              )}

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.1]"
              >
                Delicious Food,{' '}
                <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                  Delivered Fast
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-neutral-400 text-base sm:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed"
              >
                From fire-baked pizzas to gourmet burgers — browse our menu, customize your order,
                and track it live to your doorstep.
              </motion.p>

              {/* Search bar */}
              <motion.form
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                onSubmit={handleSearchSubmit}
                className="max-w-lg mx-auto lg:mx-0"
              >
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Search for pizza, burgers, biryani..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      prefixIcon={<Search size={18} />}
                      className="bg-white/[0.06] border-white/10 text-white placeholder-neutral-500 h-13 focus:border-primary/50 shadow-xl"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="h-13 px-6 shadow-lg shadow-primary/20 font-semibold"
                  >
                    Search
                  </Button>
                </div>
              </motion.form>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3"
              >
                <Link to="/restaurants">
                  <Button
                    variant="primary"
                    size="lg"
                    className="shadow-lg shadow-primary/20 font-semibold flex items-center gap-2"
                  >
                    <span>Order Now</span>
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link to="/branches">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/10 text-white hover:bg-white/5 font-semibold flex items-center gap-2"
                  >
                    <MapPin size={16} />
                    <span>Find Branch</span>
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right: Hero image grid */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <motion.div
                variants={scaleIn}
                initial="initial"
                animate="animate"
                className="relative w-full max-w-[520px]"
              >
                {/* Main image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
                  <img
                    src={heroImages[0]}
                    alt="Delicious food from ABC Restaurant"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-lg rounded-xl p-3 border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">Today's Special</p>
                        <p className="text-neutral-400 text-xs">Fire-Baked Pepperoni Pizza</p>
                      </div>
                      <span className="text-primary font-bold text-lg">₹299</span>
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -left-6 top-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl hidden lg:flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">Fresh Ingredients</p>
                    <p className="text-neutral-500 text-[10px]">100% Quality Checked</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -right-4 bottom-20 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl hidden lg:flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">4.8 Rating</p>
                    <p className="text-neutral-500 text-[10px]">10,000+ Happy Customers</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ STATS BAR ═══════════════════════ */}
        <section className="bg-white/[0.02] border-y border-white/5 py-6 px-6">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 select-none"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{stat.value}</p>
                  <p className="text-neutral-500 text-xs">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════ POPULAR CATEGORIES ═══════════════════════ */}
        <section className="py-16 px-6 max-w-7xl mx-auto w-full">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              What are you craving?
            </h2>
            <p className="text-neutral-500 text-sm">Explore our most popular food categories</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide justify-center flex-wrap">
            {mockCategories.map((cat) => (
              <CategoryPill key={cat.id} name={cat.name} slug={cat.slug} image={cat.image} />
            ))}
          </div>
        </section>

        {/* ═══════════════════════ TRENDING DISHES ═══════════════════════ */}
        <section className="py-16 px-6 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-primary" />
                <span className="text-primary text-xs font-bold uppercase tracking-wider">
                  Trending
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Popular Right Now</h2>
              <p className="text-neutral-500 text-sm mt-1">Our most ordered dishes this week</p>
            </div>
            <Link to="/restaurants">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/5 font-semibold hidden sm:flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} variant="food" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts.slice(0, 8).map((product) => (
                <FoodCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* ═══════════════════════ FEATURED RESTAURANTS ═══════════════════════ */}
        <section className="py-16 px-6 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Top Restaurants</h2>
              <p className="text-neutral-500 text-sm mt-1">
                Hand-picked restaurants with top ratings
              </p>
            </div>
            <Link to="/restaurants">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/5 font-semibold hidden sm:flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          {restaurantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} variant="restaurant" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(restaurants.length > 0 ? restaurants : mockRestaurants)
                .slice(0, 3)
                .map((res: any) => (
                  <Link key={res.id} to={`/restaurants/${res.slug}`}>
                    <Card className="bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden group h-full">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            res.coverImage ||
                            res.image ||
                            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80'
                          }
                          alt={res.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#08070F] to-transparent opacity-70" />
                        {(res.featured || res.rating > 4.3) && (
                          <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                            <Award size={10} /> Top Rated
                          </span>
                        )}
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-white text-xs font-bold">
                            {typeof res.rating === 'number' ? res.rating.toFixed(1) : res.rating}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-5 space-y-3">
                        <h3 className="font-bold text-white text-base group-hover:text-primary transition-colors">
                          {res.name}
                        </h3>
                        <p className="text-xs text-neutral-400 line-clamp-2">
                          {res.description || (res.categories ? res.categories.join(' • ') : '')}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-primary" /> 30-45 min
                          </span>
                          <span className="text-primary font-semibold flex items-center gap-1">
                            View Menu <ArrowRight size={12} />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          )}
        </section>

        {/* ═══════════════════════ TODAY'S OFFERS ═══════════════════════ */}
        {coupons.length > 0 && (
          <section className="py-16 px-6 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} className="text-amber-400" />
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                      Deals
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Today's Offers</h2>
                  <p className="text-neutral-500 text-sm mt-1">
                    Save more with exclusive coupon codes
                  </p>
                </div>
                <Link to="/offers">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-white hover:bg-white/5 font-semibold hidden sm:flex items-center gap-1"
                  >
                    All Offers <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {coupons.slice(0, 3).map((coupon) => (
                  <div
                    key={coupon.id}
                    className="relative rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] p-6 space-y-3 hover:bg-primary/[0.06] transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                          <Tag size={12} />
                          {coupon.discountType === 'PERCENTAGE'
                            ? `${coupon.discountValue}% OFF`
                            : coupon.discountType === 'FIXED_AMOUNT'
                              ? `₹${parseFloat(coupon.discountValue).toFixed(0)} OFF`
                              : 'FREE DELIVERY'}
                        </span>
                        <h3 className="text-white font-bold text-xl mt-1">{coupon.code}</h3>
                        {coupon.description && (
                          <p className="text-neutral-400 text-xs mt-1">{coupon.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopyCoupon(coupon.code)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-primary/20 border border-white/10 text-neutral-400 hover:text-primary transition-colors"
                        aria-label={`Copy code ${coupon.code}`}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    {parseFloat(coupon.minimumAmount) > 0 && (
                      <p className="text-neutral-500 text-xs">
                        Min order: ₹{parseFloat(coupon.minimumAmount).toFixed(0)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
        <section className="py-20 px-6 max-w-6xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">How It Works</h2>
            <p className="text-neutral-500 text-sm">Get your favorite meal in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                icon: MapPin,
                title: 'Choose Your Branch',
                desc: 'Select the nearest ABC branch or let us auto-detect your location for fastest delivery.',
              },
              {
                step: '02',
                icon: ChefHat,
                title: 'Browse & Order',
                desc: 'Explore our menu, customize your meal, add items to cart, and apply coupons at checkout.',
              },
              {
                step: '03',
                icon: Truck,
                title: 'Track & Enjoy',
                desc: 'Watch your order being prepared live and get it delivered hot to your doorstep.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center space-y-4"
              >
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg ${
                    i === 2
                      ? 'bg-primary text-white shadow-primary/20'
                      : 'bg-white/[0.05] text-white border border-white/10'
                  }`}
                >
                  <item.icon size={28} />
                </div>
                <h3 className="font-bold text-white text-lg">{item.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
        <section className="py-20 px-6 bg-white/[0.01]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                What Our Customers Say
              </h2>
              <p className="text-neutral-500 text-sm">Loved by thousands of food enthusiasts</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockTestimonials.map((t) => (
                <Card
                  key={t.id}
                  className="bg-white/[0.03] border-white/[0.06] p-6 flex flex-col justify-between space-y-5"
                >
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={
                          s <= Math.round(t.rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-700'
                        }
                      />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed flex-1">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-[10px] text-neutral-500">{t.role}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════ APP DOWNLOAD CTA ═══════════════════════ */}
        <section className="py-20 px-6 max-w-6xl mx-auto w-full">
          <div className="relative rounded-3xl bg-gradient-to-r from-primary/15 to-amber-500/10 border border-white/10 p-8 md:p-14 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_var(--tw-gradient-stops))] from-primary/10 to-transparent pointer-events-none" />
            <div className="space-y-5 max-w-lg text-center md:text-left z-10">
              <h2 className="text-3xl font-bold text-white">
                Order Faster on the <span className="text-primary">ABC App</span>
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Get exclusive app-only deals, save your favorite addresses, reorder with one tap,
                and track your delivery live.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Button
                  variant="primary"
                  className="flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  <Smartphone size={16} /> App Store
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 text-white flex items-center gap-2 hover:bg-white/5"
                >
                  <Play size={14} fill="currentColor" /> Google Play
                </Button>
              </div>
            </div>
            <div className="relative w-44 h-64 border-4 border-white/20 rounded-[2rem] bg-black overflow-hidden flex-shrink-0 shadow-2xl z-10 hidden md:block">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black rounded-b-xl z-20 border-b border-white/10" />
              <div className="w-full h-full flex flex-col justify-center items-center p-4 bg-gradient-to-b from-neutral-900 to-black text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
                  <Flame size={20} className="text-primary" />
                </div>
                <p className="text-[10px] font-bold text-white uppercase tracking-wider">
                  ABC Restaurant
                </p>
                <p className="text-[8px] text-neutral-500 mt-1">Order • Track • Enjoy</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ NEWSLETTER ═══════════════════════ */}
        <section className="py-16 px-6 max-w-md mx-auto w-full text-center">
          <div className="space-y-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto border border-primary/20">
              <Mail size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Stay Updated</h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Get weekly deals, new menu launches, and exclusive offers straight to your inbox.
            </p>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full">
            <Input
              type="email"
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="bg-white/[0.05] border-white/10 text-xs h-11"
              required
            />
            <Button
              type="submit"
              variant="primary"
              className="h-11 text-xs px-5 shadow-lg shadow-primary/20"
            >
              Subscribe
            </Button>
          </form>
        </section>
      </div>
    </>
  );
};

export default LandingPage;
