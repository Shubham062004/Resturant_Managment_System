import { motion } from 'framer-motion';
import { Star, Clock, Heart, Plus, Minus, Flame, Leaf } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { useAppSelector } from '../../../app/store';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  useAddToCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useCart,
} from '../../cart/store/cartQueries';
import type { Product } from '../store/catalogQueries';

import HeartButton from './HeartButton';
import QuantityStepper from './QuantityStepper';

interface FoodCardProps {
  product: Product;
  showAddToCart?: boolean;
  className?: string;
  rank?: number;
  totalOrders?: number;
  isTrending?: boolean;
  badgeText?: string;
}

const FoodCard: React.FC<FoodCardProps> = ({
  product,
  showAddToCart = true,
  className = '',
  rank,
  totalOrders,
  isTrending,
  badgeText,
}) => {
  const toast = useToast();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: cart } = useCart();
  const addToCart = useAddToCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  // Find this product in the cart
  const cartItem = cart?.items.find((i: any) => i.productId === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: 1,
        product,
      });
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error('Failed to add item');
    }
  };

  const handleIncrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      await updateItem.mutateAsync({ id: cartItem.id, quantity: quantity + 1 });
    }
  };

  const handleDecrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem && quantity > 1) {
      await updateItem.mutateAsync({ id: cartItem.id, quantity: quantity - 1 });
    } else if (cartItem) {
      await removeItem.mutateAsync(cartItem.id);
    }
  };

  const originalPrice = parseFloat(product.basePrice);
  const discountPct = product.discountPercentage || 0;
  const discountedPrice =
    discountPct > 0 ? originalPrice * (1 - discountPct / 100) : originalPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group ${className}`}
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl">
          {/* Image */}
          <div className="relative h-44 overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                <Flame className="w-10 h-10 text-neutral-700" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {rank && (
                <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg border border-amber-400/20">
                  <Star size={8} fill="currentColor" /> #{rank} Bestseller
                </span>
              )}
              {isTrending && (
                <span className="bg-gradient-to-r from-red-600 to-rose-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg border border-red-500/20 animate-pulse">
                  🔥 Trending
                </span>
              )}
              {badgeText && (
                <span className="bg-blue-600/90 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg border border-blue-500/20">
                  {badgeText}
                </span>
              )}
              {!rank && product.featured && (
                <span className="bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg">
                  <Star size={8} fill="currentColor" /> Bestseller
                </span>
              )}
              <div className="flex gap-1">
                {product.isVeg ? (
                  <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Leaf size={8} /> Veg
                  </span>
                ) : (
                  <span className="bg-red-500/90 backdrop-blur-sm text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded">
                    Non-Veg
                  </span>
                )}
              </div>
            </div>

            {/* Favorite button */}
            <HeartButton productId={product.id} />

            {/* Rating + Prep time bottom overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-white text-xs font-bold">
                  {product.rating?.toFixed(1) || '4.0'}
                </span>
              </div>
              {product.preparationTime && (
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  <Clock size={12} className="text-white/70" />
                  <span className="text-white text-xs font-medium">
                    {product.preparationTime} min
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {product.shortDescription && (
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col">
                {discountPct > 0 ? (
                  <div className="flex items-center gap-1">
                    <span className="text-primary font-bold text-base">
                      ₹{discountedPrice.toFixed(0)}
                    </span>
                    <span className="text-neutral-500 line-through text-[11px] font-normal">
                      ₹{originalPrice.toFixed(0)}
                    </span>
                    <span className="text-emerald-500 text-[10px] font-bold">
                      {discountPct}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-primary font-bold text-base">
                    ₹{originalPrice.toFixed(0)}
                  </span>
                )}
                {totalOrders && totalOrders > 0 ? (
                  <span className="text-[10px] text-neutral-400 mt-0.5 font-medium">
                    {totalOrders}+ ordered this week
                  </span>
                ) : null}
              </div>

              {/* Add to Cart / Quantity stepper */}
              {showAddToCart && (
                <div className="relative z-10">
                  {quantity > 0 ? (
                    <QuantityStepper
                      quantity={quantity}
                      onIncrease={handleIncrease}
                      onDecrease={handleDecrease}
                      isLoading={updateItem.isPending || removeItem.isPending}
                      size="sm"
                    />
                  ) : (
                    <button
                      onClick={handleAdd}
                      className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-primary border border-white/10 hover:border-primary text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200"
                    >
                      <Plus size={14} />
                      <span>ADD</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default FoodCard;
