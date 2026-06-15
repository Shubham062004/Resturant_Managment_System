import { ClipboardList, Utensils, Users, Search } from 'lucide-react';
import React from 'react';

import { Button } from './Button';

export type EmptyStateType = 'orders' | 'products' | 'customers' | 'search';

export interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  const defaults = {
    orders: {
      icon: <ClipboardList size={48} className="text-muted-foreground/60" />,
      title: 'No Orders Found',
      description:
        "There are currently no active orders in the queue. They'll show up here once placed.",
    },
    products: {
      icon: <Utensils size={48} className="text-muted-foreground/60" />,
      title: 'No Products Yet',
      description: 'Your menu is empty. Start adding delicious dishes to get started.',
    },
    customers: {
      icon: <Users size={48} className="text-muted-foreground/60" />,
      title: 'No Registered Customers',
      description:
        'Customer profiles list is empty. They will appear here when accounts are initialized.',
    },
    search: {
      icon: <Search size={48} className="text-muted-foreground/60" />,
      title: 'No Search Results',
      description:
        "We couldn't find any matches for your query. Try searching with different keywords.",
    },
  };

  const active = defaults[type];

  return (
    <div
      className={`flex flex-col items-center justify-center p-8.5 text-center bg-card/45 border border-border/60 rounded-2xl w-full min-h-[320px] max-w-lg mx-auto gap-4 font-sans select-none
        ${className}
      `}
    >
      <div className="p-4 bg-secondary/80 rounded-full flex items-center justify-center shadow-inner">
        {active.icon}
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-bold font-display tracking-tight text-foreground/90">
          {title || active.title}
        </h4>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          {description || active.description}
        </p>
      </div>

      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
