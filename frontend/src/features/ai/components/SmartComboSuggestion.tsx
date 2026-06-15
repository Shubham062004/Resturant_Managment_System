import { Sparkles, Plus } from 'lucide-react';
import React, { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { fetchCombos } from '../store/recommendationSlice';

interface SmartComboProps {
  cartItemIds: string[];
}

export default function SmartComboSuggestion({ cartItemIds }: SmartComboProps) {
  const dispatch = useAppDispatch();
  const { combos, status } = useAppSelector((state) => state.recommendation);

  useEffect(() => {
    if (cartItemIds.length > 0) {
      dispatch(fetchCombos(cartItemIds));
    }
  }, [dispatch, cartItemIds]);

  if (status === 'loading' || !combos) return null;

  return (
    <Card className="bg-primary/5 border border-primary/20 p-4 mt-6">
      <div className="flex items-center gap-2 mb-3 text-primary">
        <Sparkles size={18} />
        <h4 className="font-bold">Smart Combo Suggestion</h4>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {combos.comboTitle} - Add these to get a{' '}
        <Badge variant="success">{combos.discountPercentage}% discount</Badge>!
      </p>

      <div className="space-y-3">
        {combos.items?.map((item: any) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-3 bg-surface rounded-lg"
          >
            <div>
              <p className="font-semibold text-white text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">₹{item.basePrice}</p>
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
