import { Wrench } from 'lucide-react';
import React from 'react';

import { Card } from '../../../shared/components/ui/Card';

export default function ManagerAnalyticsPage() {
  return (
    <div className="flex flex-col h-full space-y-6 max-w-4xl mx-auto items-center justify-center pt-20">
      {/* Under Maintenance Banner */}
      <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-center gap-3 text-amber-500 animate-pulse">
        <Wrench size={24} />
        <h2 className="text-lg font-bold font-display uppercase tracking-widest">
          Page Under Maintenance
        </h2>
      </div>

      <Card className="p-8 text-center bg-slate-900/60 border-border/20 backdrop-blur-xl w-full">
        <Wrench size={64} className="mx-auto text-slate-600 mb-6" />
        <h1 className="text-3xl font-bold font-display text-white tracking-tight mb-4">
          Analytics Coming Soon
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto">
          We are currently upgrading the Branch Manager Analytics module to
          provide you with deeper insights and better reporting capabilities.
          Please check back later.
        </p>
      </Card>
    </div>
  );
}
