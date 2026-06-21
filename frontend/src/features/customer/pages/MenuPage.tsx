import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, MapPin, Search, Filter, RotateCcw, ShieldCheck, Heart } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import SEO from '../../../shared/components/SEO';
import SkeletonCard from '../../../shared/components/ui/SkeletonCard';
import MenuItemCard from '../components/MenuItemCard';
import MenuCategorySidebar from '../components/MenuCategorySidebar';
import OfferBanner from '../components/OfferBanner';
import { useCustomerMenu, useCustomerOffers } from '../store/catalogQueries';

export const MenuPage: React.FC = () => {
  const { selectedBranch } = useAppSelector((state) => state.customer);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState(false);
  const [nonVegFilter, setNonVegFilter] = useState(false);
  const [bestsellerFilter, setBestsellerFilter] = useState(false);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [activeCategory, setActiveCategory] = useState('Popular');

  // API Queries
  const { data: menuData, isLoading, isError, refetch } = useCustomerMenu(selectedBranch?.id || '');
  const { data: offersData } = useCustomerOffers(selectedBranch?.id || '');

  const branchDetails = menuData?.data?.branch;
  const products = menuData?.data?.menu || [];
  const offers = offersData?.data || [];

  // Reset active category on branch change
  useEffect(() => {
    setActiveCategory('Popular');
  }, [selectedBranch]);

  // Categories list
  const categories = ['Popular', 'Pizza', 'Burger', 'Chinese', 'Desserts', 'Drinks', 'Combos'];

  // Helper to map DB products to sidebar categories
  const getProductCategory = (prod: any) => {
    const catName = prod.category?.name?.toLowerCase() || '';
    if (catName.includes('pizza') || catName.includes('special')) return 'Pizza';
    if (catName.includes('burger')) return 'Burger';
    if (catName.includes('noodles') || catName.includes('rice')) return 'Chinese';
    if (catName.includes('dessert')) return 'Desserts';
    if (catName.includes('drinks') || catName.includes('beverage')) return 'Drinks';
    if (catName.includes('combo')) return 'Combos';
    return 'Popular';
  };

  // Filtered Products List
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(query);
        const matchesDesc = prod.description?.toLowerCase().includes(query) || false;
        if (!matchesName && !matchesDesc) return false;
      }

      // 2. Veg / Non-Veg Filters
      if (vegFilter && !prod.isVeg) return false;
      if (nonVegFilter && prod.isVeg) return false;

      // 3. Bestseller Filter
      if (bestsellerFilter && !prod.featured) return false;

      // 4. Price Range Filter
      const price = parseFloat(prod.basePrice);
      if (price > maxPrice) return false;

      return true;
    });
  }, [products, searchQuery, vegFilter, nonVegFilter, bestsellerFilter, maxPrice]);

  // Products grouped by Zomato Category for structured vertical rendering
  const groupedProducts = useMemo(() => {
    const groups: Record<string, any[]> = {
      Popular: [],
      Pizza: [],
      Burger: [],
      Chinese: [],
      Desserts: [],
      Drinks: [],
      Combos: [],
    };

    filteredProducts.forEach((prod) => {
      // Add to popular if featured or high rating
      if (prod.featured || prod.rating >= 4.5) {
        groups.Popular.push(prod);
      }
      const category = getProductCategory(prod);
      if (groups[category]) {
        groups[category].push(prod);
      }
    });

    return groups;
  }, [filteredProducts]);

  // Handle active scroll category highlighting
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const cat of categories) {
        const slug = cat.toLowerCase().replace(/ /g, '-');
        const element = document.getElementById(slug);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveCategory(cat);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleResetFilters = () => {
    setSearchQuery('');
    setVegFilter(false);
    setNonVegFilter(false);
    setBestsellerFilter(false);
    setMaxPrice(3000);
  };

  // loading skeleton container
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08070F] text-white pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-40 bg-white/[0.02] border border-white/5 rounded-3xl" />
          <div className="flex gap-6">
            <div className="hidden md:block w-64 h-96 bg-white/[0.02] border border-white/5 rounded-3xl" />
            <div className="flex-1 space-y-6">
              <div className="h-12 bg-white/[0.02] border border-white/5 rounded-2xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-44 bg-white/[0.02] border border-white/5 rounded-3xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Branch Selection empty state
  if (!selectedBranch) {
    return (
      <div className="min-h-screen bg-[#08070F] text-white flex items-center justify-center pt-24 pb-16 px-6">
        <div className="max-w-md w-full text-center space-y-6 bg-[#110E1C]/40 border border-white/5 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto animate-bounce">
            <MapPin size={32} />
          </div>
          <h2 className="text-xl font-bold font-display">Select Delivery Outlet</h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Welcome to ABC Restaurant! Please select a branch from the location selector in the top navbar to view the available menu items and deals at your nearest outlet.
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#08070F] text-white flex items-center justify-center pt-24 pb-16 px-6">
        <div className="max-w-md w-full text-center space-y-6 bg-red-500/5 border border-red-500/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-red-400 font-display">Failed to Load Menu</h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            We had trouble fetching the menu details for {selectedBranch.name}. Please check your connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-red-500/25"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`ABC Menu — ${selectedBranch.name} Outlet | Food Delivery`}
        description={`Order from ABC ${selectedBranch.name}. Browse branch-exclusive menus, apply active coupons, and enjoy rapid 30-minute delivery.`}
        keywords="ABC menu, food order online, branch menu, delivery outlet, fresh pizzas, burgers"
      />

      <div className="min-h-screen bg-[#08070F] text-white pt-24 pb-16 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* ═══════════════════════ BRANCH HEADER ═══════════════════════ */}
          <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#110E1C]/40 p-6 md:p-8 shadow-xl backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md">
                  {branchDetails?.isOpen ? 'Open Now' : 'Closed'}
                </span>
                <span className="text-neutral-500 text-xs font-semibold">ABC Outlet</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight">
                ABC • {branchDetails?.name}
              </h1>
              <p className="text-neutral-400 text-xs max-w-xl flex items-center gap-1.5 font-normal">
                <MapPin size={12} className="text-neutral-500 shrink-0" />
                {branchDetails?.address}, {branchDetails?.city}
              </p>
            </div>

            {/* Branch Stats Badge */}
            <div className="flex gap-4 sm:gap-6 border-t border-white/5 md:border-t-0 pt-4 md:pt-0 w-full md:w-auto">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 text-center shrink-0 min-w-[90px]">
                <div className="flex items-center justify-center gap-1 text-amber-400 font-extrabold text-lg">
                  <span>{branchDetails?.rating ? branchDetails.rating.toFixed(1) : '0.0'}</span>
                  <Star size={16} className="fill-current text-amber-400" />
                </div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">Rating</p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 text-center shrink-0 min-w-[90px]">
                <div className="flex items-center justify-center gap-1 text-primary font-extrabold text-lg">
                  <Clock size={16} />
                  <span>{branchDetails?.deliveryTime.split(' ')[0]}</span>
                </div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">Mins</p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 text-center shrink-0 min-w-[90px] hidden sm:block">
                <div className="flex items-center justify-center gap-1 text-emerald-400 font-extrabold text-lg">
                  <ShieldCheck size={18} />
                  <span>100%</span>
                </div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">Hygiene</p>
              </div>
            </div>
          </section>

          {/* ═══════════════════════ OFFERS INTEGRATION ═══════════════════════ */}
          {offers.length > 0 && (
            <section className="bg-white/[0.01] rounded-3xl border border-white/5 p-6 md:p-8">
              <OfferBanner offers={offers} />
            </section>
          )}

          {/* ═══════════════════════ DYNAMIC CONTENT SHELVES ═══════════════════════ */}
          {/* Recommended Section (First 4 available items) */}
          {filteredProducts.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-red-500 fill-red-500/20" />
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-neutral-400">
                  Recommended For You
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredProducts.slice(0, 4).map((product) => (
                  <MenuItemCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* ═══════════════════════ SEARCH & FILTERS PANEL ═══════════════════════ */}
          <section className="rounded-3xl border border-white/5 bg-[#110E1C]/30 p-5 shadow-lg space-y-4 backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Menu Items */}
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for dishes, desserts, categories..."
                  className="w-full pl-10 pr-4 py-3 bg-[#0D0B14]/80 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Price range */}
              <div className="w-full md:w-64 flex items-center gap-3 bg-[#0D0B14]/80 border border-white/10 px-4 py-2.5 rounded-xl">
                <span className="text-xs text-neutral-400 font-semibold shrink-0">Max Price:</span>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-primary h-1 bg-neutral-800 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-bold text-white shrink-0">₹{maxPrice}</span>
              </div>

              {/* Reset filter pills */}
              {(searchQuery || vegFilter || nonVegFilter || bestsellerFilter || maxPrice < 3000) && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 w-full md:w-auto font-bold"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
              <span className="text-xs text-neutral-500 flex items-center gap-1 mr-1 uppercase tracking-wider font-extrabold">
                <Filter className="h-3 w-3" /> Quick Filters
              </span>

              <button
                onClick={() => {
                  setVegFilter(!vegFilter);
                  setNonVegFilter(false);
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${
                  vegFilter
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                🌱 Pure Veg
              </button>

              <button
                onClick={() => {
                  setNonVegFilter(!nonVegFilter);
                  setVegFilter(false);
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${
                  nonVegFilter
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                🍖 Non-Veg
              </button>

              <button
                onClick={() => setBestsellerFilter(!bestsellerFilter)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${
                  bestsellerFilter
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                ⭐ Bestsellers
              </button>
            </div>
          </section>

          {/* ═══════════════════════ CATALOG BODY (SIDEBAR + PRODUCT SECTIONS) ═══════════════════════ */}
          <div className="flex flex-col md:flex-row gap-8 relative items-start">
            
            {/* Sidebar component */}
            <MenuCategorySidebar
              categories={categories}
              activeCategory={activeCategory}
              onCategorySelect={setActiveCategory}
            />

            {/* Catalog Grid */}
            <div className="flex-1 w-full space-y-12">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 rounded-3xl border border-white/5 bg-[#110E1C]/20 max-w-xl mx-auto backdrop-blur-md">
                  <Search className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-lg font-bold text-white mb-1">No items match your filters</p>
                  <p className="text-neutral-500 text-xs mb-6">
                    Try clearing search queries or quick filter pills to explore all dishes.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="py-2.5 px-5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                categories.map((category) => {
                  const sectionId = category.toLowerCase().replace(/ /g, '-');
                  const list = groupedProducts[category] || [];
                  if (list.length === 0) return null;

                  return (
                    <section key={category} id={sectionId} className="space-y-4 pt-4 scroll-mt-24">
                      <div className="border-b border-white/5 pb-2">
                        <h2 className="text-lg font-extrabold text-white font-display tracking-tight flex items-center gap-2">
                          {category}
                          <span className="text-xs text-neutral-500 font-bold bg-white/5 px-2 py-0.5 rounded-full">
                            {list.length}
                          </span>
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {list.map((prod) => (
                          <MenuItemCard key={prod.id} product={prod} />
                        ))}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuPage;
