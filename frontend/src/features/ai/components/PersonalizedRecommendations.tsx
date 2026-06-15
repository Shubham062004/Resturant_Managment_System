import { Sparkles } from 'lucide-react';
import React, { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import { Card } from '../../../shared/components/ui/Card';
import { fetchRecommendations } from '../store/recommendationSlice';

export default function PersonalizedRecommendations() {
  const dispatch = useAppDispatch();
  const { recommendations, status } = useAppSelector((state) => state.recommendation);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch, isAuthenticated]);

  if (status === 'loading' || recommendations.length === 0) return null;

  return (
    <div className="my-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-primary animate-pulse" />
        <h2 className="text-2xl font-display font-bold text-white">Recommended For You</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((rec: any, idx: number) => (
          <Card
            key={idx}
            className="bg-surface/50 border-border/50 hover:border-primary/50 transition-colors p-4 group cursor-pointer"
          >
            <div className="aspect-video bg-secondary/30 rounded-lg mb-3 flex items-center justify-center text-muted-foreground overflow-hidden relative">
              {rec.product.image ? (
                <img
                  src={rec.product.image}
                  alt={rec.product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span>No Image</span>
              )}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-xs font-bold text-primary px-2 py-1 rounded">
                {rec.matchScore}% Match
              </div>
            </div>
            <h3 className="font-bold text-white mb-1 truncate">{rec.product.name}</h3>
            <p className="text-primary font-bold text-sm">₹{rec.product.basePrice}</p>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{rec.reason}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
