import {
  Search as SearchIcon,
  Clock,
  Trash2,
  X,
  TrendingUp,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../../app/store';
import useDebounce from '../../../hooks/useDebounce';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import { Input } from '../../../shared/components/ui/Input';
import SkeletonCard from '../../../shared/components/ui/SkeletonCard';
import PersonalizedRecommendations from '../../ai/components/PersonalizedRecommendations';
import FoodCard from '../components/FoodCard';
import { useProducts, useCustomerMenu } from '../store/catalogQueries';
import { addRecentSearch, clearRecentSearches } from '../store/customerSlice';
import { useMemo } from 'react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { recentSearches } = useAppSelector((state) => state.customer);

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [inputVal, setInputVal] = useState(queryParam || categoryParam);
  const debouncedSearch = useDebounce(inputVal, 400);

  const popularSearches = [
    'Pizza',
    'Burgers',
    'Biryani',
    'Desserts',
    'Cold Drinks',
  ];

  useEffect(() => {
    setInputVal(queryParam || categoryParam);
  }, [queryParam, categoryParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputVal.trim();
    if (!query) return;

    dispatch(addRecentSearch(query));
    setSearchParams({ q: query });
  };

  const handleSelectSearchTag = (tag: string) => {
    setInputVal(tag);
    dispatch(addRecentSearch(tag));
    setSearchParams({ q: tag });
  };

  const handleClearSearches = () => {
    dispatch(clearRecentSearches());
  };

  const searchTerm = debouncedSearch.trim();
  const { selectedBranch } = useAppSelector((state) => state.customer);
  const { data: menuData } = useCustomerMenu(selectedBranch?.id || '');
  const { data: productsResponse, isLoading: isSearchLoading } = useProducts({
    search: searchTerm || undefined,
    page: 1,
    limit: 24,
  });

  const branchProductIds = useMemo(() => {
    const list = menuData?.data?.menu || [];
    return new Set(list.map((p) => p.id));
  }, [menuData]);

  const searchProducts = useMemo(() => {
    const list = productsResponse?.data ?? [];
    if (!selectedBranch) return list;
    return list.filter((prod) => branchProductIds.has(prod.id));
  }, [productsResponse, selectedBranch, branchProductIds]);

  return (
    <>
      <SEO
        title="Search Food & Restaurants — ABC Restaurant"
        description="Search for your favorite dishes, cuisines, or restaurants. Fast delivery in 30 minutes."
        keywords="Search ABC, food finder, order food online, fast food delivery"
      />

      <div className="min-h-screen bg-[#08070F] pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-bold font-display text-white">
              What are you craving?
            </h1>
            <p className="text-neutral-400 text-sm md:text-base max-w-lg">
              Search for dishes, cuisines, or even specific restaurants near
              you.
            </p>
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-3xl">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search for pizza, burgers, biryani..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                prefixIcon={
                  <SearchIcon size={18} className="text-neutral-400" />
                }
                className="bg-white/[0.04] border-white/10 text-white placeholder-neutral-500 h-14 text-sm focus:border-primary/50 shadow-xl"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => {
                    setInputVal('');
                    setSearchParams({});
                  }}
                  className="absolute right-4 top-4 text-neutral-500 hover:text-white transition-colors"
                  aria-label="Clear input query"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              className="h-14 px-8 shrink-0 font-bold shadow-lg shadow-primary/20"
            >
              Search
            </Button>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-6">
            {/* Sidebar tags & logs */}
            <div className="lg:col-span-4 space-y-8">
              {!searchTerm && <PersonalizedRecommendations />}

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                      <Clock size={14} />
                      <span>Recent Searches</span>
                    </h3>
                    <button
                      onClick={handleClearSearches}
                      className="text-xs text-neutral-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSearchTag(term)}
                        className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 text-xs font-medium rounded-xl border border-white/5 transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2 mb-4">
                  <TrendingUp size={14} className="text-primary" />
                  <span>Popular Choices</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSelectSearchTag(term)}
                      className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-xl border border-primary/20 transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search results catalog */}
            <div className="lg:col-span-8">
              <div className="flex justify-between items-center text-xs text-neutral-400 mb-6">
                <span>
                  {isSearchLoading
                    ? 'Searching...'
                    : `Showing ${searchProducts.length} results`}
                </span>
                {debouncedSearch && (
                  <span>
                    Results for{' '}
                    <strong className="text-white">
                      &quot;{debouncedSearch}&quot;
                    </strong>
                  </span>
                )}
              </div>

              {!searchTerm ? (
                <EmptyState
                  type="search"
                  title="What are you in the mood for?"
                  description="Search for your favorite dishes or discover new restaurants."
                />
              ) : isSearchLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : searchProducts.length === 0 ? (
                <EmptyState
                  type="search"
                  title="No matches found"
                  description={`We couldn't find anything matching "${debouncedSearch}". Try a different keyword.`}
                  actionLabel="Clear Search"
                  onAction={() => {
                    setInputVal('');
                    setSearchParams({});
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchProducts.map((product) => (
                    <FoodCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
