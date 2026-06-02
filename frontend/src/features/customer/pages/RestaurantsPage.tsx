import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { useRestaurants } from '../store/catalogQueries';
import {
  setSearch,
  setRating,
  toggleVeg,
  toggleOpenNow,
  setSorting,
  resetFilters,
} from '../store/restaurantSlice';
import { Link } from 'react-router-dom';
import { Star, Search, Filter, RotateCcw, Compass, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RestaurantsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters, sortBy, sortOrder } = useAppSelector((state) => state.restaurant);

  // TanStack Query to fetch filtered list of restaurants
  const { data, isLoading, isError, refetch } = useRestaurants({
    search: filters.search,
    rating: filters.rating,
    veg: filters.veg,
    openNow: filters.openNow,
    sortBy,
    sortOrder,
    page: 1,
    limit: 50,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearch(e.target.value));
  };

  const handleRatingChange = (val: number | null) => {
    dispatch(setRating(val));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'popularity' | 'rating' | 'name';
    dispatch(setSorting({ sortBy: val }));
  };

  const handleClearFilters = () => {
    dispatch(resetFilters());
  };

  return (
    <div className="min-h-screen bg-[#08070F] text-white pt-24 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="relative mb-12 text-center md:text-left">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-neutral-200 to-primary bg-clip-text text-transparent">
            Explore Restaurants
          </h1>
          <p className="mt-3 text-neutral-400 text-lg max-w-2xl font-light">
            Order premium dishes from our brick stone ovens, authentic woks, or gourmet patisseries.
          </p>
        </div>

        {/* Search & Filter Control Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl mb-10 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500" />
              <input
                type="text"
                value={filters.search}
                onChange={handleSearchChange}
                placeholder="Search restaurants, cuisines, or dishes..."
                className="w-full pl-12 pr-4 py-3 bg-[#111019] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Sorting */}
            <div className="w-full md:w-64">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full py-3 px-4 bg-[#111019] border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors cursor-pointer appearance-none"
              >
                <option value="popularity">Sort By: Popularity</option>
                <option value="rating">Sort By: Rating</option>
                <option value="name">Sort By: Alphabetical</option>
              </select>
            </div>

            {/* Reset Button */}
            {(filters.search || filters.rating || filters.veg || filters.openNow) && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 py-3 px-5 text-sm text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-5">
            <span className="text-sm text-neutral-400 flex items-center gap-1.5 mr-2">
              <Filter className="h-4 w-4 text-primary" /> Filter Outlets:
            </span>

            {/* Veg Filter */}
            <button
              onClick={() => dispatch(toggleVeg())}
              className={`py-2 px-4 rounded-xl text-sm font-medium border transition-all active:scale-95 ${
                filters.veg
                  ? 'bg-green-500/20 border-green-500 text-green-400 shadow-lg shadow-green-500/10'
                  : 'bg-[#111019] border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
              }`}
            >
              🌱 Vegetarian Only
            </button>

            {/* Open Now Filter */}
            <button
              onClick={() => dispatch(toggleOpenNow())}
              className={`py-2 px-4 rounded-xl text-sm font-medium border transition-all active:scale-95 ${
                filters.openNow
                  ? 'bg-primary/20 border-primary text-primary-light shadow-lg shadow-primary/10'
                  : 'bg-[#111019] border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
              }`}
            >
              🟢 Open Now
            </button>

            <div className="h-4 w-[1px] bg-white/10 mx-2 hidden sm:block" />

            {/* Star Rating Filters */}
            <span className="text-sm text-neutral-400 hidden sm:inline">Rating:</span>
            <div className="flex items-center gap-1">
              {[4.5, 4.0, 3.5].map((val) => (
                <button
                  key={val}
                  onClick={() => handleRatingChange(filters.rating === val ? null : val)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                    filters.rating === val
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-[#111019] border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <Star className="h-3 w-3 fill-current" /> {val}+
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="glass-card h-96 rounded-2xl border border-white/5 bg-white/[0.01] animate-pulse overflow-hidden"
              >
                <div className="h-48 bg-white/5" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-white/10 rounded w-2/3" />
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-5/6" />
                  <div className="flex justify-between pt-4">
                    <div className="h-4 bg-white/10 rounded w-1/4" />
                    <div className="h-4 bg-white/10 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="glass-card p-12 rounded-2xl border border-red-500/10 bg-red-500/[0.02] text-center max-w-lg mx-auto">
            <p className="text-red-400 font-semibold mb-4">Connection Error</p>
            <p className="text-neutral-400 text-sm mb-6">
              We failed to retrieve the restaurant list from our systems. Please check your network.
            </p>
            <button
              onClick={() => refetch()}
              className="btn-primary py-2.5 px-6 rounded-lg text-sm font-medium transition-all"
            >
              Retry Fetching
            </button>
          </div>
        )}

        {/* Restaurants Cards Grid */}
        {!isLoading && !isError && (
          <>
            {data?.data.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl border border-white/5 bg-white/[0.01] max-w-xl mx-auto">
                <Compass className="h-16 w-16 text-neutral-600 mx-auto mb-4 animate-bounce" />
                <p className="text-xl font-medium text-neutral-300">
                  No restaurants match your filters
                </p>
                <p className="text-neutral-500 text-sm mt-2 mb-6">
                  Try refining your search queries or clearing active toggles.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="py-2.5 px-6 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {data?.data.map((restaurant) => {
                    return (
                      <motion.div
                        key={restaurant.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="glass-card rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all duration-300 overflow-hidden shadow-xl flex flex-col group"
                      >
                        {/* Cover Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={restaurant.coverImage}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#08070F] to-transparent opacity-80" />

                          {/* Rating Badge */}
                          <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 py-1.5 px-2.5 rounded-lg text-amber-400 font-bold text-xs">
                            <Star className="h-3 w-3 fill-current" /> {restaurant.rating.toFixed(1)}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h3 className="text-xl font-bold font-display text-white group-hover:text-primary transition-colors">
                                {restaurant.name}
                              </h3>
                              {restaurant.logo && (
                                <img
                                  src={restaurant.logo}
                                  alt={`${restaurant.name} logo`}
                                  className="h-8 w-8 rounded-lg border border-white/10 object-cover"
                                />
                              )}
                            </div>

                            <p className="text-neutral-400 text-sm line-clamp-2 font-sans font-light leading-relaxed mb-4">
                              {restaurant.description}
                            </p>
                          </div>

                          {/* Footer details */}
                          <div className="border-t border-white/5 pt-4 mt-auto flex items-center justify-between text-xs text-neutral-500 font-sans">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-primary" /> Delivery: ~30-45 mins
                            </span>
                            <Link
                              to={`/restaurants/${restaurant.slug}`}
                              className="text-primary hover:text-white font-medium flex items-center gap-1 transition-colors"
                            >
                              View Menu &rarr;
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;
