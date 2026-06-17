import {
  Star,
  Clock,
  MapPin,
  Phone,
  Info,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { useAppSelector } from '../../../app/store';
import SkeletonCard from '../../../shared/components/ui/SkeletonCard';
import FoodCard from '../components/FoodCard';
import { useRestaurantBySlug } from '../store/catalogQueries';

export const RestaurantDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    data: response,
    isLoading,
    isError,
  } = useRestaurantBySlug(slug || '');
  const { selectedBranch } = useAppSelector((state) => state.customer);
  const [activeTab, setActiveTab] = useState<'menu' | 'info'>('menu');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08070F] pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="h-[400px] w-full bg-white/5 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !response || !response.data) {
    return (
      <div className="min-h-screen bg-[#08070F] text-white pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="bg-red-500/[0.02] border border-red-500/10 rounded-2xl p-10 text-center max-w-md w-full">
          <p className="text-red-400 font-bold text-xl mb-3">
            Restaurant Not Found
          </p>
          <p className="text-neutral-400 text-sm mb-6">
            We couldn't find the restaurant you were looking for. It may be
            currently inactive.
          </p>
          <Link
            to="/restaurants"
            className="inline-block py-2.5 px-6 bg-primary text-white rounded-xl text-sm font-semibold transition-all hover:bg-primary-hover shadow-lg shadow-primary/20"
          >
            Browse Other Restaurants
          </Link>
        </div>
      </div>
    );
  }

  const restaurant = response.data;
  const { categories, products, branches } = restaurant;
  const primaryBranch = branches[0];

  const productsByCategory = categories.reduce<Record<string, typeof products>>(
    (acc, cat) => {
      acc[cat.id] = products.filter((p) => p.categoryId === cat.id);
      return acc;
    },
    {}
  );

  const handleScrollToCategory = (catId: string) => {
    const element = document.getElementById(`category-${catId}`);
    if (element) {
      const headerOffset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#08070F] text-white pb-24 font-sans">
      {/* 1. Hero Cover Banner */}
      <div className="relative h-80 md:h-[480px] overflow-hidden">
        <img
          src={
            restaurant.coverImage ||
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop'
          }
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08070F] via-[#08070F]/60 to-transparent" />

        <div className="absolute bottom-0 inset-x-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {selectedBranch ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-1.5 px-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Delivering to{' '}
                    {selectedBranch.name}
                  </span>
                ) : (
                  <span className="bg-primary/20 text-primary border border-primary/30 py-1.5 px-3 rounded-full text-xs font-bold uppercase tracking-wider">
                    Accepting Orders
                  </span>
                )}
                <div className="flex items-center gap-1 text-amber-400 font-bold text-sm bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
                  <Star className="h-4 w-4 fill-current" />{' '}
                  {restaurant.rating.toFixed(1)}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight text-white drop-shadow-lg">
                {restaurant.name}
              </h1>
              <p className="text-neutral-300 text-sm md:text-base max-w-2xl leading-relaxed">
                {restaurant.description}
              </p>
            </div>

            {restaurant.logo && (
              <img
                src={restaurant.logo}
                alt={`${restaurant.name} logo`}
                className="h-24 w-24 rounded-2xl border-4 border-white/10 object-cover shadow-2xl bg-[#08070F] hidden md:block"
              />
            )}
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="border-b border-white/5 bg-[#08070F]/90 sticky top-[72px] z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('menu')}
              className={`h-16 font-bold text-sm transition-all border-b-2 px-1 flex items-center gap-2 ${
                activeTab === 'menu'
                  ? 'border-primary text-white'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Order Online
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`h-16 font-bold text-sm transition-all border-b-2 px-1 flex items-center gap-2 ${
                activeTab === 'info'
                  ? 'border-primary text-white'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Restaurant Info
            </button>
          </div>
        </div>
      </div>

      {/* 2. Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {activeTab === 'menu' ? (
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Sticky categories sidebar navigation */}
            <aside className="w-full lg:w-64 shrink-0 rounded-2xl border border-white/5 bg-white/[0.02] sticky top-40 z-20 hidden lg:block p-3">
              <p className="text-xs font-bold text-neutral-500 tracking-wider uppercase mb-3 px-3 pt-2">
                Categories
              </p>
              <div className="space-y-1">
                {categories.map((cat) => {
                  const count = (productsByCategory[cat.id] || []).length;
                  if (count === 0) return null;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleScrollToCategory(cat.id)}
                      className="w-full text-left py-2.5 px-3 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all flex justify-between items-center group font-medium"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {cat.name}
                      </span>
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Food items listings */}
            <div className="flex-1 space-y-16 w-full">
              {categories.map((cat) => {
                const catProducts = productsByCategory[cat.id] || [];
                if (catProducts.length === 0) return null;

                return (
                  <section
                    key={cat.id}
                    id={`category-${cat.id}`}
                    className="scroll-mt-40"
                  >
                    <div className="mb-6 flex items-baseline gap-3">
                      <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                        {cat.name}
                      </h2>
                      <span className="text-sm font-semibold text-neutral-500">
                        {catProducts.length} items
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {catProducts.map((product) => (
                        <FoodCard key={product.id} product={product} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        ) : (
          /* Info / Branch Location Page */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-4xl">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
              <h2 className="text-2xl font-bold font-display text-white mb-6 flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" /> About this Restaurant
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">
                      {primaryBranch?.name}
                    </p>
                    <p className="text-neutral-400 text-sm mt-1 leading-relaxed">
                      {primaryBranch?.address}
                      <br />
                      {primaryBranch?.city}, {primaryBranch?.state}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">
                      Opening Hours
                    </p>
                    <p className="text-neutral-400 text-sm mt-1">
                      {primaryBranch?.openingTime} -{' '}
                      {primaryBranch?.closingTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">Contact</p>
                    <p className="text-neutral-400 text-sm mt-1">
                      {'+1 (555) 123-4567'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
              <h2 className="text-2xl font-bold font-display text-white mb-6">
                Location Map
              </h2>
              <div className="aspect-square sm:aspect-video md:aspect-square bg-neutral-900 border border-white/10 rounded-xl overflow-hidden flex flex-col justify-center items-center text-center p-6 relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
                <MapPin className="h-12 w-12 text-primary mb-3 animate-bounce z-10" />
                <p className="font-bold text-white z-10">
                  {primaryBranch?.name}
                </p>
                <p className="text-neutral-500 text-xs mt-2 z-10 max-w-[200px] mx-auto">
                  Map integration would be displayed here using coordinates (
                  {primaryBranch?.latitude}, {primaryBranch?.longitude}).
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
