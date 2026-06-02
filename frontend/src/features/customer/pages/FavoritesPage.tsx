import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../../shared/components/SEO';
import EmptyState from '../../../shared/components/ui/EmptyState';
import { Heart } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="My Favorites"
        description="Check your saved fire-baked pizzas, custom burgers, and preferred restaurant outposts."
        keywords="Oven Xpress favorites, saved dishes, wishlist"
      />

      <div className="space-y-6">
        <div className="border-b border-border/40 pb-4">
          <h1 className="text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            <Heart className="text-primary fill-primary" size={22} />
            <span>My Favorite Selections</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Gourmet modifier setups and dishes saved for rapid checkout.</p>
        </div>

        {/* Empty state simulation */}
        <div className="py-12">
          <EmptyState
            type="products"
            title="Your Favorites List is Empty"
            description="Browse outposts, customize recipes, and tap the heart icon on any product to save it here for swift access."
            actionLabel="Discover Outposts"
            onAction={() => navigate('/branches')}
          />
        </div>
      </div>
    </>
  );
};

export default FavoritesPage;
