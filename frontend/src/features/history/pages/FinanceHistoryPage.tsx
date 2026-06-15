import React from 'react';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';

export default function FinanceHistoryPage() {
  return (
    <div className="flex flex-col space-y-6 h-full">
      <div>
        <h1 className="text-3xl font-bold font-display text-white tracking-tight">
          Finance History
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Historical records and advanced data tables for FinanceHistory.
        </p>
      </div>

      <Card className="bg-slate-900/40 border-border/20 flex-1">
        <CardHeader className="border-b border-border/10">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Records Table</h3>
            <Badge className="bg-primary/20 text-primary border-none">Coming Soon</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border/20 rounded-xl bg-slate-950/50">
            <span className="text-4xl mb-4">📊</span>
            <p className="text-slate-400 font-medium text-center max-w-md">
              The data grid for Finance History is currently under construction.
              It will feature filtering, sorting, and export capabilities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
