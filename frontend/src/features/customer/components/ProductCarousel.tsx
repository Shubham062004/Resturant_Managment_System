import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';

import SkeletonCard from '../../../shared/components/ui/SkeletonCard';
import type { Product } from '../store/catalogQueries';

import FoodCard from './FoodCard';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  isLoading: boolean;
  showAddToCart?: boolean;
  rankStart?: boolean; // If true, bestsellers get ranks 1, 2, 3...
  isTrendingSection?: boolean; // If true, cards display a trending flame
  totalOrdersList?: number[]; // Optional list of order counts to display as badges
  badgeText?: string; // Optional overlay text (e.g., 'NEW')
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  products,
  isLoading,
  showAddToCart = true,
  rankStart = false,
  isTrendingSection = false,
  totalOrdersList,
  badgeText,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollLimits = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollLimits();
    window.addEventListener('resize', checkScrollLimits);
    return () => window.removeEventListener('resize', checkScrollLimits);
  }, [products, isLoading]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount =
        direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Completely hide the section if not loading and there are no products (prevents empty whitespace)
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 px-6 max-w-7xl mx-auto w-full relative group/carousel">
      {/* Title Header */}
      <div className="flex justify-between items-end mb-6 relative">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Carousel Navigation Buttons */}
        {!isLoading && products.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleScroll('left')}
              disabled={!showLeftArrow}
              className={`p-2 rounded-full border border-white/10 bg-black/40 text-white transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed`}
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!showRightArrow}
              className={`p-2 rounded-full border border-white/10 bg-black/40 text-white transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed`}
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={checkScrollLimits}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 select-none scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading
            ? // Skeleton Loading placeholders
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[260px] shrink-0 snap-start">
                  <SkeletonCard variant="food" />
                </div>
              ))
            : // Render actual product cards
              products.map((product, index) => {
                const rank = rankStart ? index + 1 : undefined;
                const isTrending = isTrendingSection;
                const totalOrders = totalOrdersList?.[index];

                return (
                  <div
                    key={product.id}
                    className="w-[260px] shrink-0 snap-start"
                  >
                    <FoodCard
                      product={product}
                      showAddToCart={showAddToCart}
                      rank={rank}
                      isTrending={isTrending}
                      totalOrders={totalOrders}
                      badgeText={badgeText}
                    />
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
