import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import React, { useState } from 'react';

import {
  useAddWishlist,
  useRemoveWishlist,
  useWishlist,
} from '../../../api/hooks/useWishlist';
import { useAppSelector } from '../../../app/store';
import { useToast } from '../../../shared/components/ui/Toast';

interface HeartButtonProps {
  productId: string;
  className?: string;
  size?: number;
}

export const HeartButton: React.FC<HeartButtonProps> = ({
  productId,
  className = '',
  size = 20,
}) => {
  const toast = useToast();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { selectedBranch } = useAppSelector((state) => state.customer);

  const { mutate: addWishlist } = useAddWishlist();
  const { mutate: removeWishlist } = useRemoveWishlist();

  // Retrieve wishlist cache to check if wishlisted (limit 100 query is cached and shared across cards)
  const { data: wishlistResponse } = useWishlist(
    {
      branchId: selectedBranch?.id || undefined,
      limit: 100,
    },
    isAuthenticated
  );

  const isWishlisted =
    isAuthenticated &&
    wishlistResponse?.data?.data?.some((item) => item.productId === productId);

  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please sign in to save items to your wishlist.');
      return;
    }

    if (!selectedBranch?.id) {
      toast.error('Please select a branch first.');
      return;
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);

    if (isWishlisted) {
      removeWishlist(productId, {
        onSuccess: () => {
          toast.success('Removed from wishlist');
        },
        onError: () => {
          toast.error('Failed to update wishlist. Please try again.');
        },
      });
    } else {
      addWishlist(
        { menuItemId: productId, branchId: selectedBranch.id },
        {
          onSuccess: () => {
            toast.success('Saved to wishlist!');
          },
          onError: () => {
            toast.error('Failed to update wishlist. Please try again.');
          },
        }
      );
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`absolute top-3 right-3 z-20 p-2.5 rounded-full bg-[#08070F]/65 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-md group/heart active:scale-90 ${className}`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <motion.div
        animate={
          isAnimating
            ? {
                scale: [1, 1.4, 0.9, 1.1, 1],
                rotate: [0, 15, -15, 0],
              }
            : {}
        }
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="relative"
      >
        {isWishlisted ? (
          <Heart
            size={size}
            className="text-red-500 fill-red-500 stroke-red-500 filter drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
          />
        ) : (
          <Heart
            size={size}
            className="text-neutral-400 group-hover/heart:text-white transition-colors"
          />
        )}
        {/* Heart Burst Particle Effect */}
        {isAnimating && !isWishlisted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="absolute w-1 h-1 bg-red-500 rounded-full animate-ping scale-150 opacity-75" />
          </div>
        )}
      </motion.div>
    </button>
  );
};

export default HeartButton;
