import { LucideIcon } from 'lucide-react';
import React from 'react';

import { Card, CardContent } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number; // percentage, e.g., 12.5 or -4.2
  icon?: LucideIcon;
  subtitle?: string;
  className?: string;
  loading?: boolean;
}

export function StatCard({ title, value, trend, icon: Icon, subtitle, className, loading }: StatCardProps) {
  return (
    <Card className={`bg-slate-900/60 border-border/10 overflow-hidden relative group ${className || ''}`}>
      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          {Icon && (
            <div className="p-2 bg-slate-800/50 rounded-lg text-slate-400 group-hover:text-primary transition-colors">
              <Icon size={18} />
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="h-8 bg-slate-800 animate-pulse rounded w-1/2 mb-2"></div>
        ) : (
          <div className="flex items-baseline space-x-3">
            <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
            {trend !== undefined && (
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        )}
        
        {subtitle && !loading && (
          <p className="text-slate-500 text-xs mt-2">{subtitle}</p>
        )}
      </CardContent>
      {/* Decorative gradient blob */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
    </Card>
  );
}
