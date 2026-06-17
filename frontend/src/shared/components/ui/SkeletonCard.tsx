import React from 'react';

interface SkeletonCardProps {
  variant?: 'food' | 'restaurant' | 'branch' | 'offer';
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'food',
  className = '',
}) => {
  if (variant === 'restaurant') {
    return (
      <div
        className={`rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden animate-pulse ${className}`}
      >
        <div className="h-48 bg-white/5" />
        <div className="p-5 space-y-3">
          <div className="h-5 bg-white/10 rounded-lg w-3/4" />
          <div className="h-3 bg-white/5 rounded w-full" />
          <div className="h-3 bg-white/5 rounded w-5/6" />
          <div className="flex justify-between pt-3 border-t border-white/5">
            <div className="h-4 bg-white/10 rounded w-1/4" />
            <div className="h-4 bg-white/10 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'branch') {
    return (
      <div
        className={`rounded-xl border border-white/5 bg-white/[0.02] p-5 animate-pulse ${className}`}
      >
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-xl bg-white/5 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded w-2/3" />
            <div className="h-3 bg-white/5 rounded w-full" />
            <div className="flex gap-3 pt-1">
              <div className="h-3 bg-white/5 rounded w-16" />
              <div className="h-3 bg-white/5 rounded w-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'offer') {
    return (
      <div
        className={`rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 animate-pulse ${className}`}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-white/10 rounded w-20" />
            <div className="h-6 bg-white/10 rounded w-32" />
            <div className="h-3 bg-white/5 rounded w-48" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-white/5" />
        </div>
      </div>
    );
  }

  // Default: food card
  return (
    <div
      className={`rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden animate-pulse ${className}`}
    >
      <div className="h-40 bg-white/5" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="flex justify-between pt-2">
          <div className="h-4 bg-white/10 rounded w-16" />
          <div className="h-8 bg-white/5 rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
