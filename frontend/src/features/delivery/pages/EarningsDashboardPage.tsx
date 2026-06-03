import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { fetchEarnings } from '../store/deliverySlice';
import { Card } from '../../../shared/components/ui/Card';
import { Wallet, TrendingUp, History } from 'lucide-react';

export default function EarningsDashboardPage() {
  const dispatch = useAppDispatch();
  const { earnings } = useAppSelector((state) => state.delivery);

  useEffect(() => {
    dispatch(fetchEarnings());
  }, [dispatch]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-white">Earnings Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-primary/20 to-surface border-primary/30 p-6 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-primary font-semibold mb-2 flex items-center gap-2">
              <Wallet className="w-5 h-5" /> Total Earnings
            </p>
            <h2 className="text-5xl font-bold text-white">
              ${Number(earnings.totalEarnings || 0).toFixed(2)}
            </h2>
          </div>
          <TrendingUp className="absolute -right-6 -bottom-6 w-32 h-32 text-primary/10" />
        </Card>

        <Card className="bg-surface/50 border-border/50 p-6">
          <p className="text-muted-foreground font-semibold mb-2">Completed Deliveries</p>
          <h2 className="text-5xl font-bold text-white">{earnings.history?.length || 0}</h2>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-muted-foreground" /> Earning History
        </h2>
        <div className="space-y-3">
          {earnings.history?.map((e, i) => (
            <Card
              key={i}
              className="bg-surface/50 border-border/50 p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-white font-medium">Order #{e.order?.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-success font-bold">+${Number(e.earnings).toFixed(2)}</p>
                {Number(e.bonus) > 0 && (
                  <p className="text-xs text-primary">Bonus: ${Number(e.bonus).toFixed(2)}</p>
                )}
              </div>
            </Card>
          ))}
          {!earnings.history?.length && (
            <p className="text-muted-foreground text-center py-8">No earnings recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
