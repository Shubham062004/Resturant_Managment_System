import { Heart } from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../../app/store';
import SEO from '../../../shared/components/SEO';
import EmptyState from '../../../shared/components/ui/EmptyState';
import SkeletonCard from '../../../shared/components/ui/SkeletonCard';
import FoodCard from '../components/FoodCard';
import { useFavorites } from '../store/catalogQueries';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading, isError } = useFavorites(isAuthenticated);
  const products = data?.data ?? [];

  return (
    <>
      <SEO
        title="My Favorites — ABC Restaurant"
        description="Check your saved fire-baked pizzas, custom burgers, and preferred restaurant outposts."
        keywords="ABC favorites, saved dishes, wishlist"
      />

      <div className="space-y-8 font-sans">
        <div className="border-b border-white/5 pb-5">
          <h1 className="text-3xl font-display font-bold tracking-tight text-white flex items-center gap-3">
            <Heart className="text-primary fill-primary" size={28} />
            <span>My Favorites</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-2">
            Your saved dishes and preferred restaurant items for quick re-ordering.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-8 text-center">
            <p className="text-red-400 font-semibold mb-2">Could not load favorites</p>
            <p className="text-neutral-400 text-sm mb-4">Please sign in and try again.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold"
            >
              Sign In
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 bg-white/[0.02] border border-white/5 rounded-3xl text-center px-6">
            <Heart size={48} className="mx-auto text-neutral-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Your Favorites List is Empty</h3>
            <p className="text-neutral-400 text-sm mb-6 max-w-md mx-auto">
              Browse our menu, discover delicious items, and tap the heart icon on any product to
              save it here for later.
            </p>
            <button
              onClick={() => navigate('/restaurants')}
              className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold"
            >
              Discover Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <FoodCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default FavoritesPage;
