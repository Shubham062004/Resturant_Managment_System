import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Trash2,
  ShoppingCart,
  SlidersHorizontal,
  Flame,
  ArrowUpDown,
  Tag,
  Star,
  MapPin,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useWishlist,
  useClearWishlist,
  useRemoveWishlist,
  useAddAllWishlistToCart,
} from '../../../api/hooks/useWishlist';
import { useAppSelector, useAppDispatch } from '../../../app/store';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  useAddToCart,
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
} from '../../cart/store/cartQueries';
import HeartButton from '../components/HeartButton';
import QuantityStepper from '../components/QuantityStepper';
import { selectBranch } from '../store/customerSlice';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { selectedBranch, branches } = useAppSelector(
    (state) => state.customer
  );

  // States
  const [searchVal, setSearchVal] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // React Query Fetch Wishlist
  const { data: wishlistResponse, isLoading } = useWishlist({
    branchId: selectedBranch?.id || undefined,
    limit: 100, // get up to 100 items
  });

  const wishlistItems = wishlistResponse?.data?.data || [];

  // Mutations
  const clearWishlist = useClearWishlist();
  const removeWishlist = useRemoveWishlist();
  const addAllToCart = useAddAllWishlistToCart();
  const { mutate: addToCart } = useAddToCart();
  const { data: cart } = useCart(isAuthenticated);
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  // Filtered & Sorted items (client-side for instant UX)
  const processedItems = useMemo(() => {
    let result = [...wishlistItems];

    // Search
    if (searchVal) {
      const s = searchVal.toLowerCase();
      result = result.filter(
        (item) =>
          item.product.name.toLowerCase().includes(s) ||
          item.product.description?.toLowerCase().includes(s)
      );
    }

    // Veg/Non-Veg
    if (vegFilter === 'veg') {
      result = result.filter((item) => item.product.isVeg);
    } else if (vegFilter === 'non-veg') {
      result = result.filter((item) => !item.product.isVeg);
    }

    // Category
    if (activeCategory) {
      result = result.filter(
        (item) => item.product.category.name === activeCategory
      );
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'price_asc') {
      result.sort(
        (a, b) =>
          parseFloat(a.product.basePrice) - parseFloat(b.product.basePrice)
      );
    } else if (sortBy === 'price_desc') {
      result.sort(
        (a, b) =>
          parseFloat(b.product.basePrice) - parseFloat(a.product.basePrice)
      );
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.product.rating - a.product.rating);
    }

    return result;
  }, [wishlistItems, searchVal, vegFilter, activeCategory, sortBy]);

  // Unique categories list for filters
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    wishlistItems.forEach((item) => {
      if (item.product?.category?.name) set.add(item.product.category.name);
    });
    return Array.from(set);
  }, [wishlistItems]);

  const availableItemsCount = useMemo(() => {
    return wishlistItems.filter((item) => item.isAvailableInBranch).length;
  }, [wishlistItems]);

  // Handlers
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      clearWishlist.mutate(undefined, {
        onSuccess: () => {
          toast.success('Wishlist cleared successfully.');
        },
        onError: () => {
          toast.error('Failed to clear wishlist.');
        },
      });
    }
  };

  const handleAddAllToCart = () => {
    if (!selectedBranch?.id) return;
    addAllToCart.mutate(selectedBranch.id, {
      onSuccess: (data: any) => {
        if (data.success) {
          toast.success(data.message || 'All items added to cart!');
        } else {
          toast.error(data.message || 'Failed to add items to cart.');
        }
      },
    });
  };

  const handleAddSingleToCart = (item: any) => {
    addToCart(
      { productId: item.productId, quantity: 1 },
      {
        onSuccess: () => {
          toast.success(`${item.product.name} added to cart!`);
        },
        onError: () => {
          toast.error('Failed to add item to cart.');
        },
      }
    );
  };

  const handleSwitchBranch = (branchId: string) => {
    const targetBranch = branches.find((b) => b.id === branchId);
    if (targetBranch) {
      dispatch(selectBranch(targetBranch));
      toast.success(`Switched to branch: ${targetBranch.name}`);
    }
  };

  const defaultImage =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80';

  return (
    <>
      <SEO
        title="My Favorites — ABC Restaurant"
        description="View and order your favorite saved dishes from ABC Restaurant."
        keywords="favorites, wishlist, order food, ABC"
      />

      <div className="min-h-screen bg-[#08070F] pt-28 pb-20 text-white">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight">
                My Favorites ❤️
              </h1>
              <p className="text-sm text-neutral-400 mt-2">
                Manage your saved dishes and order them easily at{' '}
                {selectedBranch?.name || 'your local branch'}.
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleAddAllToCart}
                  disabled={availableItemsCount === 0 || addAllToCart.isPending}
                  className="bg-primary hover:bg-primary-hover text-white rounded-2xl py-3 px-5 text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform"
                >
                  <ShoppingCart size={16} /> Add Available to Cart (
                  {availableItemsCount})
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleClearAll}
                  disabled={clearWishlist.isPending}
                  className="bg-white/5 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold transition-all flex items-center gap-2"
                >
                  <Trash2 size={16} /> Clear Wishlist
                </Button>
              </div>
            )}
          </div>

          {isLoading ? (
            /* Loading Skeletons */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-[#110E1C]/80 border border-white/5 p-5 rounded-3xl h-44 animate-pulse"
                />
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center py-20 px-6 bg-[#110E1C]/40 border border-white/5 rounded-3xl max-w-2xl mx-auto space-y-6 shadow-xl"
            >
              <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shadow-inner">
                <Flame size={48} className="animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-display">
                  Save dishes you love
                </h3>
                <p className="text-neutral-400 text-sm max-w-sm">
                  Add your favorite items and order them anytime. Explore our
                  menu and offers.
                </p>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <Button
                  onClick={() => navigate('/menu')}
                  className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                >
                  Browse Menu
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/offers')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 font-bold px-6 py-3 rounded-2xl transition-all"
                >
                  View Offers
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Wishlist Dashboard & Grid view */
            <div className="space-y-6">
              {/* Filters toolbar */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#110E1C]/50 border border-white/5 p-4 rounded-3xl shadow-md">
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type="text"
                    placeholder="Search favorites..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="w-full bg-[#08070F] border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Filter chips & Sort */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                  {/* Veg / Non-Veg Toggle */}
                  <div className="bg-[#08070F] border border-white/5 p-1 rounded-2xl flex items-center">
                    <button
                      onClick={() => setVegFilter('all')}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                        vegFilter === 'all'
                          ? 'bg-primary text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setVegFilter('veg')}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                        vegFilter === 'veg'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Veg
                    </button>
                    <button
                      onClick={() => setVegFilter('non-veg')}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                        vegFilter === 'non-veg'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/10'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Non-Veg
                    </button>
                  </div>

                  {/* Categories chip list */}
                  {categoriesList.length > 0 && (
                    <div className="flex items-center gap-1.5 max-w-xs overflow-x-auto py-1">
                      <button
                        onClick={() => setActiveCategory('')}
                        className={`text-xs font-bold px-3.5 py-2 rounded-2xl border transition-all ${
                          !activeCategory
                            ? 'bg-white/10 text-white border-white/20'
                            : 'bg-transparent text-neutral-400 border-white/5 hover:text-white'
                        }`}
                      >
                        All Categories
                      </button>
                      {categoriesList.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`text-xs font-bold px-3.5 py-2 rounded-2xl border transition-all whitespace-nowrap ${
                            activeCategory === cat
                              ? 'bg-white/10 text-white border-white/20'
                              : 'bg-transparent text-neutral-400 border-white/5 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="w-[1px] h-6 bg-white/10" />

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2 bg-[#08070F] border border-white/5 px-3 py-2.5 rounded-2xl text-xs font-bold text-neutral-400">
                    <ArrowUpDown size={13} />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-white focus:outline-none cursor-pointer"
                    >
                      <option value="newest" className="bg-[#111019]">
                        Newest Added
                      </option>
                      <option value="price_asc" className="bg-[#111019]">
                        Price: Low to High
                      </option>
                      <option value="price_desc" className="bg-[#111019]">
                        Price: High to Low
                      </option>
                      <option value="rating" className="bg-[#111019]">
                        Highest Rated
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Wishlist Grid */}
              <AnimatePresence mode="popLayout">
                {processedItems.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400">
                    No favorites match your search or filter criteria.
                  </div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {processedItems.map((item) => {
                      const cartItem = cart?.items.find(
                        (c) => c.productId === item.productId
                      );
                      const cartQty = cartItem?.quantity || 0;

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="bg-[#110E1C]/80 border border-white/5 rounded-3xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-white/10 hover:bg-[#151224] transition-all duration-300 gap-4"
                        >
                          {/* Heart Button Positioned top-right of image */}
                          <HeartButton
                            productId={item.productId}
                            className="!top-3 !right-3"
                          />

                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border border-white/5">
                              <img
                                src={item.product.image || defaultImage}
                                alt={item.product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {!item.product.isAvailable && (
                                <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-red-400">
                                    Sold Out
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={`w-3.5 h-3.5 border flex items-center justify-center rounded-xs shrink-0 ${
                                    item.product.isVeg
                                      ? 'border-emerald-500'
                                      : 'border-red-500'
                                  }`}
                                >
                                  <div
                                    className={`w-1 h-1 rounded-full ${item.product.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-neutral-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  {item.product.category.name}
                                </span>
                              </div>
                              <h3 className="font-bold text-white text-sm leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                {item.product.name}
                              </h3>
                              <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                                <MapPin
                                  size={11}
                                  className="text-neutral-500"
                                />
                                Saved at:{' '}
                                <span className="text-neutral-300 font-medium">
                                  {item.savedBranch.name}
                                </span>
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-neutral-500 pt-1">
                                <span className="flex items-center gap-0.5 text-amber-400">
                                  <Star size={11} className="fill-amber-400" />
                                  <span className="text-neutral-300 font-bold">
                                    {item.product.rating.toFixed(1)}
                                  </span>
                                </span>
                                <span>•</span>
                                <span className="text-white font-extrabold text-sm">
                                  ₹
                                  {parseFloat(item.product.basePrice).toFixed(
                                    0
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Branch Availability Banner */}
                          {!item.isAvailableInBranch && (
                            <div className="bg-red-500/10 border border-red-500/15 p-3 rounded-2xl flex flex-col gap-2">
                              <div className="flex items-start gap-2 text-xs text-red-400">
                                <AlertTriangle
                                  size={14}
                                  className="shrink-0 mt-0.5"
                                />
                                <div>
                                  <p className="font-bold">
                                    Not available in this branch
                                  </p>
                                  <p className="text-[10px] text-neutral-400 leading-normal">
                                    This item is currently only served at the{' '}
                                    {item.savedBranch.name} branch.
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  handleSwitchBranch(item.branchId)
                                }
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold border border-white/5 active:scale-95 transition-all"
                              >
                                Switch to {item.savedBranch.name}{' '}
                                <ExternalLink size={10} />
                              </button>
                            </div>
                          )}

                          {/* Primary Stepper / Buy Action Panel */}
                          <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                            <button
                              onClick={() =>
                                removeWishlist.mutate(item.productId)
                              }
                              className="text-xs text-neutral-500 hover:text-red-400 font-semibold flex items-center gap-1 py-1.5 transition-colors"
                            >
                              <Trash2 size={13} /> Remove
                            </button>

                            {item.isAvailableInBranch && (
                              <div className="z-10">
                                {cartQty > 0 ? (
                                  <QuantityStepper
                                    quantity={cartQty}
                                    onIncrease={(e) => {
                                      e.preventDefault();
                                      updateCartItem.mutate({
                                        id: cartItem!.id,
                                        quantity: cartQty + 1,
                                      });
                                    }}
                                    onDecrease={(e) => {
                                      e.preventDefault();
                                      if (cartQty > 1) {
                                        updateCartItem.mutate({
                                          id: cartItem!.id,
                                          quantity: cartQty - 1,
                                        });
                                      } else {
                                        removeCartItem.mutate(cartItem!.id);
                                      }
                                    }}
                                    size="sm"
                                  />
                                ) : (
                                  <button
                                    onClick={() => handleAddSingleToCart(item)}
                                    className="bg-primary hover:bg-primary-hover text-white text-xs font-extrabold py-2 px-5 rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                                  >
                                    Move to Cart
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistPage;
