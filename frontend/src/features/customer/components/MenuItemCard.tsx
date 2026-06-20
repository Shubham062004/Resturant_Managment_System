import { motion } from 'framer-motion';
import { Clock, Star, Plus } from 'lucide-react';
import React, { useState } from 'react';

import { useAppSelector } from '../../../app/store';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  useAddToCart,
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
} from '../../cart/store/cartQueries';
import { Product } from '../store/catalogQueries';
import QuantityStepper from './QuantityStepper';
import HeartButton from './HeartButton';

interface MenuItemCardProps {
  product: Product;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ product }) => {
  const toast = useToast();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { mutate: addToCart, isPending: isAdding } = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const { data: cart } = useCart(isAuthenticated);

  // Find if this product is in the cart
  const cartItem = cart?.items.find((item) => item.productId === product.id);
  const cartQty = cartItem?.quantity || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your cart.');
      return;
    }

    addToCart(
      {
        productId: product.id,
        quantity: 1,
      },
      {
        onSuccess: () => {
          toast.success(`${product.name} added to cart!`);
        },
        onError: () => {
          toast.error('Failed to add item. Please try again.');
        },
      }
    );
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateCartItem.mutate({ id: cartItem.id, quantity: cartQty + 1 });
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      if (cartQty > 1) {
        updateCartItem.mutate({ id: cartItem.id, quantity: cartQty - 1 });
      } else {
        removeCartItem.mutate(cartItem.id);
      }
    }
  };

  const getVegBadgeColor = () => {
    return product.isVeg ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500';
  };

  const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#110E1C]/80 border border-white/5 hover:border-white/10 hover:bg-[#151224] transition-all duration-300 rounded-3xl p-5 flex flex-col sm:flex-row gap-5 shadow-lg group relative overflow-hidden"
    >
      {/* Product Image Panel */}
      <div className="relative w-full sm:w-36 h-36 shrink-0 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
        <HeartButton productId={product.id} />
        <img
          src={product.image || defaultImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Details Panel */}
      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Veg/Non-Veg tag */}
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 border-2 flex items-center justify-center rounded-sm shrink-0 ${getVegBadgeColor()}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${product.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>
            {product.featured && (
              <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                Bestseller
              </span>
            )}
          </div>

          <h3 className="font-bold text-white text-base group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-normal">
            {product.description || 'Delicately prepared with fresh ingredients, spices, and baked to perfection.'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          {/* Price & Badges */}
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-base">
              ₹{parseFloat(product.basePrice).toFixed(0)}
            </span>
            <div className="flex items-center gap-2.5 mt-1 text-[10px] text-neutral-500">
              <span className="flex items-center gap-0.5">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="text-neutral-300 font-bold">{product.rating.toFixed(1)}</span>
              </span>
              <span className="w-1 h-1 bg-neutral-700 rounded-full" />
              <span className="flex items-center gap-0.5">
                <Clock size={11} className="text-neutral-400" />
                <span className="text-neutral-400">{product.preparationTime || 20} mins</span>
              </span>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="shrink-0 z-10">
            {product.isAvailable ? (
              cartQty > 0 ? (
                <QuantityStepper
                  quantity={cartQty}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                  isLoading={updateCartItem.isPending || removeCartItem.isPending}
                  size="sm"
                />
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={isAdding}
                  className="bg-primary hover:bg-primary-hover disabled:bg-neutral-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center gap-1 active:scale-95 border border-primary/20"
                >
                  <Plus size={13} />
                  <span>{isAdding ? 'Adding...' : 'ADD'}</span>
                </button>
              )
            ) : (
              <button
                disabled
                className="bg-neutral-900 border border-white/5 text-neutral-500 px-4 py-2 rounded-xl text-xs font-bold uppercase cursor-not-allowed"
              >
                Unavailable
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;
