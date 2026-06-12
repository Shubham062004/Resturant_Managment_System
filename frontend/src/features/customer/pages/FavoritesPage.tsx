import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../../../shared/components/SEO';
import EmptyState from '../../../shared/components/ui/EmptyState';
import { Heart } from 'lucide-react';
import { useFavorites } from '../store/catalogQueries';
import { useAppSelector } from '../../../app/store';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading, isError } = useFavorites(isAuthenticated);
  const products = data?.data ?? [];

  return (
    <>
      <SEO
        title="My Favorites"
        description="Check your saved fire-baked pizzas, custom burgers, and preferred restaurant outposts."
        keywords="ABC favorites, saved dishes, wishlist"
      />

      <div className="space-y-6">
        <div className="border-b border-border/40 pb-4">
          <h1 className="text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            <Heart className="text-primary fill-primary" size={22} />
            <span>My Favorite Selections</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Gourmet modifier setups and dishes saved for rapid checkout.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          </div>
        ) : isError ? (
          <EmptyState
            type="products"
            title="Could not load favorites"
            description="Please sign in and try again."
            actionLabel="Sign in"
            onAction={() => navigate('/login')}
          />
        ) : products.length === 0 ? (
          <div className="py-12">
            <EmptyState
              type="products"
              title="Your Favorites List is Empty"
              description="Browse outposts, customize recipes, and tap the heart icon on any product to save it here."
              actionLabel="Discover Restaurants"
              onAction={() => navigate('/restaurants')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="glass-card rounded-xl border border-white/5 overflow-hidden hover:border-primary/30 transition-colors"
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  <p className="text-primary font-bold mt-1">
                    ₹{parseFloat(product.basePrice).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default FavoritesPage;
