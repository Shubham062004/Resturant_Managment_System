import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCategoryBySlug, useToggleFavorite } from '../store/catalogQueries';
import { useAppSelector } from '../../../app/store';
import { Star, Heart, Clock, Flame, ArrowLeft, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: response, isLoading, isError, refetch } = useCategoryBySlug(slug || '');
  const toggleFavoriteMutation = useToggleFavorite();
  const favoritedIds = useAppSelector((state) => state.favorite.favoritedIds);

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
          <Layers className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 font-bold mb-4 font-display text-2xl">Category Not Found</p>
          <p className="text-neutral-400 text-sm mb-6">
            The requested category menu details could not be retrieved.
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

  const category = response.data;
  const products = category.products || [];

  const handleFavoriteToggle = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteMutation.mutate(productId);
  };

  return (
    <div className="min-h-screen bg-[#08070F] text-white pt-24 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/menu"
            className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-primary" /> Back to Directory
          </Link>
        </div>

        {/* Page Header */}
        <div className="relative mb-12 text-center md:text-left">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
          <span className="text-xs font-semibold text-primary uppercase tracking-widest block mb-2">
            Category Section
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">
            {category.name} Catalog
          </h1>
          {category.description && (
            <p className="mt-3 text-neutral-400 text-lg max-w-2xl font-light">
              {category.description}
            </p>
          )}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl border border-white/5 bg-white/[0.01] max-w-xl mx-auto">
            <Layers className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
            <p className="text-xl font-medium text-neutral-300">
              No items available in this category
            </p>
            <p className="text-neutral-500 text-sm mt-2">
              Please check back later for updates to our menu catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const isFavorited = !!favoritedIds[product.id];
              return (
                <div
                  key={product.id}
                  className="glass-card rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 overflow-hidden shadow-xl flex flex-col group"
                >
                  {/* Product image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08070F] to-transparent opacity-60" />

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => handleFavoriteToggle(product.id, e)}
                      className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-xl text-neutral-400 hover:text-red-500 border border-white/15 transition-all"
                    >
                      <Heart
                        className={`h-4.5 w-4.5 transition-colors ${
                          isFavorited ? 'fill-red-500 text-red-500 text-red-500' : ''
                        }`}
                      />
                    </button>

                    {/* Veg Badge */}
                    <div className="absolute top-4 left-4 p-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/15">
                      <div
                        className={`w-2.5 h-2.5 border flex items-center justify-center ${product.isVeg ? 'border-green-500' : 'border-red-500'}`}
                      >
                        <div
                          className={`w-1 h-1 rounded-full ${product.isVeg ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <Link
                          to={`/product/${product.slug}`}
                          className="text-xl font-bold font-display text-white group-hover:text-primary transition-colors line-clamp-1"
                        >
                          {product.name}
                        </Link>
                      </div>

                      {product.restaurant && (
                        <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-3">
                          Served by {product.restaurant.name}
                        </p>
                      )}

                      <p className="text-neutral-400 text-sm line-clamp-2 font-sans font-light leading-relaxed mb-4">
                        {product.description}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="border-t border-white/5 pt-4 mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-neutral-500">
                        {product.calories && (
                          <span className="flex items-center gap-0.5">
                            <Flame className="h-3.5 w-3.5 text-amber-500" /> {product.calories} kcal
                          </span>
                        )}
                        {product.preparationTime && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3.5 w-3.5 text-primary" /> {product.preparationTime}{' '}
                            mins
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-base">
                          ${parseFloat(product.basePrice).toFixed(2)}
                        </span>
                        <Link
                          to={`/product/${product.slug}`}
                          className="py-1.5 px-3.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetailPage;
