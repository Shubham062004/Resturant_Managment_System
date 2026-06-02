import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../app/store';
import { addRecentSearch, clearRecentSearches } from '../store/customerSlice';
import useDebounce from '../../../hooks/useDebounce';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import Card, { CardContent } from '../../../shared/components/ui/Card';
import EmptyState from '../../../shared/components/ui/EmptyState';
import {
  Search as SearchIcon,
  Star,
  Clock,
  MapPin,
  Trash2,
  X,
  TrendingUp,
  Award
} from 'lucide-react';
import mockRestaurants from '../../../shared/data/restaurants';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { recentSearches } = useAppSelector((state) => state.customer);

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [inputVal, setInputVal] = useState(queryParam || categoryParam);
  const debouncedSearch = useDebounce(inputVal, 400);

  const popularSearches = ['Pizza', 'Burgers', 'Chinese', 'Desserts', 'Drinks'];

  // Sync state if search params change externally
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

  // Perform client-side filtering based on debounced search
  const filteredRestaurants = mockRestaurants.filter((res) => {
    const term = debouncedSearch.toLowerCase().trim();
    if (!term) return true;

    const matchesName = res.name.toLowerCase().includes(term);
    const matchesCategory = res.categories.some((c) => c.toLowerCase().includes(term));
    return matchesName || matchesCategory;
  });

  return (
    <>
      <SEO
        title="Global Culinary Search"
        description="Search active kitchen outposts, filter gourmet fire-baked pizzas, modifier configurations, and quick counter recipes."
        keywords="Search Oven Xpress, food finder, pizza customization, local restaurant menus"
      />

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-8 font-sans">
        
        {/* Page title */}
        <div className="space-y-2 border-b border-border/40 pb-6">
          <h1 className="text-3xl font-display font-extrabold tracking-tight text-white">Search Kitchens & Menu Catalogs</h1>
          <p className="text-muted-foreground text-sm">
            Type keywords, choose active categories, or select past query logs.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-2xl">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Search recipes, custom dishes, category tags..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              prefixIcon={<SearchIcon size={16} />}
              className="bg-card border-border/80 text-white text-xs py-2.5"
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => {
                  setInputVal('');
                  setSearchParams({});
                }}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-white"
                aria-label="Clear input query"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Button type="submit" variant="primary" className="text-xs px-5 h-11 shrink-0 font-bold">
            Search
          </Button>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar tags & logs */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Recent Searches */}
            <div className="bg-card/45 border border-border/60 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-display uppercase tracking-widest text-white flex items-center gap-1.5">
                  <Clock size={12} className="text-primary" />
                  <span>Recent searches</span>
                </h3>
                {recentSearches.length > 0 && (
                  <button
                    onClick={handleClearSearches}
                    className="text-[10px] text-muted-foreground hover:text-red-400 flex items-center gap-1 select-none transition-colors"
                  >
                    <Trash2 size={10} />
                    <span>Clear all</span>
                  </button>
                )}
              </div>

              {recentSearches.length === 0 ? (
                <p className="text-xs text-muted-foreground italic font-sans leading-relaxed">
                  No recent query logs cached in browser local storage.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSearchTag(term)}
                      className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-white text-xs font-semibold rounded-full border border-border/40 flex items-center gap-1.5 transition-all select-none"
                    >
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Searches */}
            <div className="bg-card/45 border border-border/60 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold font-display uppercase tracking-widest text-white flex items-center gap-1.5">
                <TrendingUp size={12} className="text-primary" />
                <span>Trending Choices</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSelectSearchTag(term)}
                    className="px-3 py-1.5 bg-secondary hover:bg-primary/10 hover:text-primary text-muted-foreground text-xs font-semibold rounded-full border border-border/40 hover:border-primary/20 transition-all select-none"
                  >
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Search results catalog */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Showing {filteredRestaurants.length} results</span>
              {debouncedSearch && (
                <span>
                  Query: <strong className="text-white">&ldquo;{debouncedSearch}&rdquo;</strong>
                </span>
              )}
            </div>

            {filteredRestaurants.length === 0 ? (
              <EmptyState
                type="search"
                title="No Kitchen Matches Found"
                description={`We couldn't match "${debouncedSearch}" with any local restaurants or menu categories. Please refine your query.`}
                actionLabel="Reset Search"
                onAction={() => {
                  setInputVal('');
                  setSearchParams({});
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredRestaurants.map((res) => (
                  <Card key={res.id} variant="default" className="bg-card/45 border-border/60 flex flex-col justify-between h-full">
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={res.image}
                        alt={res.name}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {res.featured && (
                        <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                          <Award size={10} />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>
                    
                    <CardContent className="p-4 flex-grow flex flex-col justify-between gap-4">
                      <div>
                        <h3 className="font-display font-bold text-sm md:text-base text-white tracking-tight leading-tight">
                          {res.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-sans mt-1">
                          {res.categories.join(' • ')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/40 pt-3 text-[10px] font-sans text-muted-foreground">
                        <span className="flex items-center gap-0.5 text-yellow-500 font-bold text-white">
                          <Star size={12} fill="currentColor" />
                          {res.rating}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock size={12} />
                          {res.deliveryTime}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MapPin size={12} />
                          {res.distance}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </>
  );
};

export default SearchPage;
