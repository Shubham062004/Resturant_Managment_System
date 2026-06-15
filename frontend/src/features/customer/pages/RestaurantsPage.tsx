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
import { Star, Search, Filter, RotateCcw, Compass, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SkeletonCard from '../../../shared/components/ui/SkeletonCard';

export const RestaurantsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters, sortBy, sortOrder } = useAppSelector((state) => state.restaurant);
  const { selectedBranch } = useAppSelector((state) => state.customer);

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
        
        {/* Header section with Location */}
        <div className="relative mb-10 flex flex-col items-center text-center sm:text-left sm:flex-row sm:justify-between sm:items-end gap-6">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
          
          <div className="space-y-2">
            {selectedBranch && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold mb-2">
                <MapPin size={16} />
                <span>Delivering near {selectedBranch.name}</span>
              </motion.div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white">
              Restaurants Near You
            </h1>
            <p className="text-neutral-400 text-sm max-w-xl">
              Explore top-rated restaurants, exclusive deals, and popular dishes ready to be delivered hot to your door.
            </p>
          </div>
          
        </div>

        {/* Filters Panel */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl mb-10 p-5 shadow-lg space-y-5">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Search */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                value={filters.search}
                onChange={handleSearchChange}
                placeholder="Search restaurants or cuisines..."
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Sorting */}
            <div className="w-full md:w-56">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full py-2.5 px-4 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary/50 transition-colors cursor-pointer appearance-none"
              >
                <option value="popularity">Sort By: Popularity</option>
                <option value="rating">Sort By: Rating</option>
                <option value="name">Sort By: Alphabetical</option>
              </select>
            </div>

            {/* Reset */}
            {(filters.search || filters.rating || filters.veg || filters.openNow) && (
              <button
                onClick={handleClearFilters}
                className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 w-full md:w-auto"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
            <span className="text-xs text-neutral-500 flex items-center gap-1 mr-1 uppercase tracking-wider font-semibold">
              <Filter className="h-3.5 w-3.5" /> Filters
            </span>

            <button
              onClick={() => dispatch(toggleVeg())}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                filters.veg
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              🌱 Pure Veg
            </button>

            <button
              onClick={() => dispatch(toggleOpenNow())}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                filters.openNow
                  ? 'bg-primary/20 border-primary/50 text-primary'
                  : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              🟢 Open Now
            </button>

            <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2">
              {[4.5, 4.0, 3.5].map((val) => (
                <button
                  key={val}
                  onClick={() => handleRatingChange(filters.rating === val ? null : val)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1 ${
                    filters.rating === val
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Star className="h-3 w-3 fill-current" /> {val}+
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* States */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} variant="restaurant" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center max-w-lg mx-auto">
            <p className="text-red-400 font-semibold mb-2">Oops! Something went wrong.</p>
            <p className="text-neutral-400 text-sm mb-6">
              We couldn't load the restaurants near you. Please check your connection.
            </p>
            <button
              onClick={() => refetch()}
              className="py-2.5 px-6 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {data?.data.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-white/5 bg-white/[0.02] max-w-xl mx-auto">
                <Compass className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-white mb-1">No restaurants found</p>
                <p className="text-neutral-500 text-sm mb-6">
                  Try tweaking your filters or expanding your search.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="py-2.5 px-6 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {data?.data.map((restaurant) => (
                    <motion.div
                      key={restaurant.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link to={`/restaurants/${restaurant.slug}`} className="block h-full group">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 overflow-hidden flex flex-col h-full">
                          
                          {/* Image area */}
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={restaurant.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80'}
                              alt={restaurant.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <div className="absolute top-3 left-3 flex gap-2">
                              {restaurant.rating >= 4.5 && (
                                <span className="bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-lg">
                                  Popular
                                </span>
                              )}
                            </div>
                            
                            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-amber-400 font-bold text-xs border border-white/10">
                              <Star className="h-3 w-3 fill-current" /> {restaurant.rating.toFixed(1)}
                            </div>
                          </div>

                          {/* Content area */}
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-3 mb-1">
                                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors truncate">
                                  {restaurant.name}
                                </h3>
                                {restaurant.logo && (
                                  <img
                                    src={restaurant.logo}
                                    alt="logo"
                                    className="h-8 w-8 rounded-lg object-cover border border-white/10 shrink-0"
                                  />
                                )}
                              </div>
                              <p className="text-neutral-400 text-xs line-clamp-2 leading-relaxed mb-4">
                                {restaurant.description || 'Enjoy our delicious meals crafted with love and fresh ingredients.'}
                              </p>
                            </div>

                            <div className="border-t border-white/5 pt-3 flex items-center justify-between text-xs text-neutral-500 font-medium">
                              <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                                <Clock className="h-3.5 w-3.5 text-primary" /> 30-45 min
                              </span>
                              {selectedBranch && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} className="text-primary" />
                                  Available
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
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
