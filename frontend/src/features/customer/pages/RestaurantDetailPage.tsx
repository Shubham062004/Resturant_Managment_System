import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRestaurantBySlug, useToggleFavorite } from '../store/catalogQueries';
import { useAppSelector } from '../../../app/store';
import { Star, Heart, Clock, Flame, ChevronRight, MapPin, Phone, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export const RestaurantDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: response, isLoading, isError, refetch } = useRestaurantBySlug(slug || '');
  const toggleFavoriteMutation = useToggleFavorite();
  const favoritedIds = useAppSelector((state) => state.favorite.favoritedIds);

  const [activeTab, setActiveTab] = useState<'menu' | 'info'>('menu');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08070F] text-white pt-32 pb-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !response || !response.data) {
    return (
      <div className="min-h-screen bg-[#08070F] text-white pt-32 pb-20 px-4">
        <div className="glass-card max-w-lg mx-auto p-10 border border-red-500/10 bg-red-500/[0.02] text-center">
          <p className="text-red-400 font-semibold mb-4 font-display text-2xl">Outlet Not Found</p>
          <p className="text-neutral-400 text-sm mb-6">
            The requested outlet details could not be retrieved.
          </p>
          <Link
            to="/menu"
            className="btn-primary py-2.5 px-6 rounded-lg text-sm font-medium inline-block transition-all"
          >
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  const restaurant = response.data;
  const { categories, products, branches } = restaurant;
  const primaryBranch = branches[0];

  // Group products by category ID
  const productsByCategory = categories.reduce<Record<string, typeof products>>((acc, cat) => {
    acc[cat.id] = products.filter((p) => p.categoryId === cat.id);
    return acc;
  }, {});

  const handleScrollToCategory = (catId: string) => {
    const element = document.getElementById(`category-${catId}`);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleFavoriteToggle = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteMutation.mutate(productId);
  };

  return (
    <div className="min-h-screen bg-[#08070F] text-white pb-24 font-sans">
      {/* 1. Hero Cover Banner */}
      <div className="relative h-80 md:h-[450px] overflow-hidden">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08070F] via-[#08070F]/50 to-transparent" />

        {/* Banner Details Overlay */}
        <div className="absolute bottom-0 inset-x-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="bg-primary/20 text-primary-light border border-primary/30 py-1 px-3 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Outpost Active
                </span>
                <div className="flex items-center gap-1 text-amber-400 font-bold text-sm bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/5">
                  <Star className="h-3.5 w-3.5 fill-current" /> {restaurant.rating.toFixed(1)}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight text-white drop-shadow-md">
                {restaurant.name}
              </h1>
              <p className="text-neutral-300 text-sm md:text-base max-w-3xl font-light">
                {restaurant.description}
              </p>
            </div>

            {restaurant.logo && (
              <img
                src={restaurant.logo}
                alt={`${restaurant.name} logo`}
                className="h-20 w-20 rounded-2xl border-2 border-white/10 object-cover shadow-2xl bg-[#08070F] hidden md:block"
              />
            )}
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="border-y border-white/5 bg-[#0b0a14] sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-14">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('menu')}
              className={`h-14 font-semibold text-sm transition-all border-b-2 px-1 ${
                activeTab === 'menu'
                  ? 'border-primary text-white'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Browse Menu
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`h-14 font-semibold text-sm transition-all border-b-2 px-1 ${
                activeTab === 'info'
                  ? 'border-primary text-white'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Outpost Info
            </button>
          </div>
        </div>
      </div>

      {/* 2. Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {activeTab === 'menu' ? (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sticky categories sidebar navigation */}
            <aside className="w-full lg:w-64 glass-panel p-4 rounded-xl border border-white/5 bg-white/[0.01] sticky top-36 z-20 hidden lg:block">
              <p className="text-xs font-bold text-primary tracking-widest uppercase mb-4 px-2">
                Menu Sections
              </p>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleScrollToCategory(cat.id)}
                    className="w-full text-left py-2.5 px-3 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/[0.03] transition-all flex justify-between items-center group font-medium"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 text-primary transition-all" />
                  </button>
                ))}
              </div>
            </aside>

            {/* Food items listings */}
            <div className="flex-1 space-y-12 w-full">
              {categories.map((cat) => {
                const catProducts = productsByCategory[cat.id] || [];
                if (catProducts.length === 0) return null;

                return (
                  <section key={cat.id} id={`category-${cat.id}`} className="scroll-mt-36">
                    <div className="border-b border-white/5 pb-4 mb-6">
                      <h2 className="text-2xl font-bold font-display text-white flex items-center gap-3">
                        {cat.name}
                        <span className="text-sm font-normal text-neutral-500 bg-white/5 py-1 px-2.5 rounded-lg border border-white/5">
                          {catProducts.length} items
                        </span>
                      </h2>
                      {cat.description && (
                        <p className="text-neutral-400 text-xs mt-1.5 font-light">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {catProducts.map((product) => {
                        const isFavorited = !!favoritedIds[product.id];
                        return (
                          <div
                            key={product.id}
                            className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 shadow-lg flex gap-4 overflow-hidden relative group"
                          >
                            {/* Product Thumb */}
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden relative shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />

                              {/* Veg / Non-Veg Indicator */}
                              <div className="absolute top-2 left-2 p-0.5 bg-black/60 rounded border border-white/10 backdrop-blur-md">
                                <div
                                  className={`w-3 h-3 border flex items-center justify-center p-0.5 ${
                                    product.isVeg ? 'border-green-500' : 'border-red-500'
                                  }`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      product.isVeg ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="space-y-1">
                                <div className="flex items-start justify-between gap-4">
                                  <Link
                                    to={`/product/${product.slug}`}
                                    className="font-bold text-lg text-white hover:text-primary transition-colors font-display line-clamp-1"
                                  >
                                    {product.name}
                                  </Link>

                                  {/* Favorite Button */}
                                  <button
                                    onClick={(e) => handleFavoriteToggle(product.id, e)}
                                    className="text-neutral-500 hover:text-red-500 p-1 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                  >
                                    <Heart
                                      className={`h-4.5 w-4.5 transition-colors ${
                                        isFavorited ? 'fill-red-500 text-red-500' : ''
                                      }`}
                                    />
                                  </button>
                                </div>

                                <p className="text-neutral-400 text-xs font-light line-clamp-2 leading-relaxed">
                                  {product.description}
                                </p>
                              </div>

                              {/* Metadata footer */}
                              <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
                                <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                                  {product.calories && (
                                    <span className="flex items-center gap-0.5">
                                      <Flame className="h-3 w-3 text-amber-500" />{' '}
                                      {product.calories} kcal
                                    </span>
                                  )}
                                  {product.preparationTime && (
                                    <span className="flex items-center gap-0.5">
                                      <Clock className="h-3 w-3 text-primary" />{' '}
                                      {product.preparationTime} mins
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-primary font-bold text-base">
                                    ${parseFloat(product.basePrice).toFixed(2)}
                                  </span>
                                  <Link
                                    to={`/product/${product.slug}`}
                                    className="py-1 px-3 bg-white/5 hover:bg-primary text-white text-xs font-medium rounded-lg border border-white/5 hover:border-transparent transition-all active:scale-95"
                                  >
                                    Customize
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        ) : (
          /* Info / Branch Location Page */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Box: Branch Info */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
              <h2 className="text-2xl font-bold font-display text-white mb-6 flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" /> Outpost Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">{primaryBranch?.name}</p>
                    <p className="text-neutral-400 text-sm mt-0.5">
                      {primaryBranch?.address}, {primaryBranch?.city}, {primaryBranch?.state}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Opening Hours</p>
                    <p className="text-neutral-400 text-sm mt-0.5">
                      {primaryBranch?.openingTime} - {primaryBranch?.closingTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Contact Info</p>
                    <p className="text-neutral-400 text-sm mt-0.5">+1 (800) OVEN-XPR</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Geo coordinates metadata */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
              <h2 className="text-2xl font-bold font-display text-white mb-6">Location Mapping</h2>
              <div className="aspect-video bg-neutral-900 border border-white/10 rounded-xl overflow-hidden flex flex-col justify-center items-center text-center p-6">
                <MapPin className="h-10 w-10 text-neutral-500 mb-2 animate-bounce" />
                <p className="font-semibold text-sm text-neutral-400">Map View Placeholder</p>
                <p className="text-neutral-600 text-xs mt-1">
                  Coordinates: Lat {primaryBranch?.latitude}, Lng {primaryBranch?.longitude}
                </p>
                <p className="text-neutral-600 text-xs">
                  Delivery Radius: Up to {primaryBranch?.deliveryRadius} miles
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetailPage;
