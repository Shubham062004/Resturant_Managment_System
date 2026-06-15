import { TrendingUp, Star, Award, Clock, Target, Trophy, Gift, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '../../../shared/components/ui/Badge';
import { Card } from '../../../shared/components/ui/Card';

export default function StaffPerformancePage() {
  const [showBonus, setShowBonus] = useState(false);

  // Mock Performance Data
  const metrics = {
    todayCompleted: 24,
    weekCompleted: 145,
    avgPrepTime: '12m 30s',
    targetPrepTime: '15m 00s',
    customerRating: 4.8,
    managerRating: 4.5,
    leaderboardRank: 3,
    totalStaff: 12,
  };

  const bonusData = {
    fiveStarRatings: 5,
    bonusPerRating: 5, // ₹5 per 5-star
    dailyBonus: 25,
    weeklyBonus: 120,
    monthlyBonus: 450,
  };

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto custom-scrollbar pb-10 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-white tracking-tight">
          Performance & Rewards
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Track your efficiency, customer ratings, and bonus earnings.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-slate-900/60 border-border/20 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 rounded-xl bg-indigo-500/10">
              <Target className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-mono text-white mb-1">
            {metrics.todayCompleted}{' '}
            <span className="text-sm font-sans font-normal text-slate-500">items</span>
          </h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Completed Today
          </p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-border/20 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 rounded-xl bg-sky-500/10">
              <Clock className="w-5 h-5 text-sky-500" />
            </div>
            {metrics.avgPrepTime < metrics.targetPrepTime && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[10px] px-1.5 py-0">
                Fast
              </Badge>
            )}
          </div>
          <h3 className="text-2xl font-bold font-mono text-white mb-1">{metrics.avgPrepTime}</h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Avg Prep Time
          </p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-border/20 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-mono text-white mb-1">
            {metrics.customerRating}{' '}
            <span className="text-sm font-sans font-normal text-slate-500">/ 5.0</span>
          </h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Customer Rating
          </p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-border/20 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10">
              <Trophy className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-xs font-bold text-emerald-500">Top 25%</span>
          </div>
          <h3 className="text-2xl font-bold font-mono text-white mb-1">
            #{metrics.leaderboardRank}{' '}
            <span className="text-sm font-sans font-normal text-slate-500">
              / {metrics.totalStaff}
            </span>
          </h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Branch Rank
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bonus Tracking System */}
        <Card className="p-6 bg-slate-900/40 border-border/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 pointer-events-none" />

          <div className="flex justify-between items-center mb-6 relative">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Gift className="text-amber-500" /> Bonus Earnings
            </h3>
            <button
              onClick={() => setShowBonus(!showBonus)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              {showBonus ? <EyeOff size={14} /> : <Eye size={14} />}
              {showBonus ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="relative space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-amber-500 font-bold flex items-center gap-2">
                  <Star size={16} className="fill-amber-500" /> 5-Star Ratings Today
                </p>
                <p className="text-xs text-amber-500/70 mt-1">
                  Earn ₹{bonusData.bonusPerRating} for every perfect rating!
                </p>
              </div>
              <span className="text-3xl font-black text-amber-500">
                {bonusData.fiveStarRatings}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950/50 rounded-xl border border-border/10 text-center">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                  Daily Bonus
                </p>
                <p
                  className={`text-xl font-bold font-mono ${showBonus ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                  {showBonus ? `₹${bonusData.dailyBonus}` : '****'}
                </p>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-xl border border-border/10 text-center">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                  Weekly Bonus
                </p>
                <p
                  className={`text-xl font-bold font-mono ${showBonus ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                  {showBonus ? `₹${bonusData.weeklyBonus}` : '****'}
                </p>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-xl border border-border/10 text-center">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                  Monthly Bonus
                </p>
                <p
                  className={`text-xl font-bold font-mono ${showBonus ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                  {showBonus ? `₹${bonusData.monthlyBonus}` : '****'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quality & Efficiency */}
        <Card className="p-6 bg-slate-900/40 border-border/20">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-indigo-500" /> Efficiency Breakdown
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-slate-300">Preparation Speed</span>
                <span className="text-xs font-bold text-emerald-500">Excellent</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">15% faster than branch average.</p>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-slate-300">Quality / Accuracy</span>
                <span className="text-xs font-bold text-indigo-500">98%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Only 2 orders returned or remade this month.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-slate-300">Manager Evaluation</span>
                <span className="text-xs font-bold text-sky-500">
                  {metrics.managerRating} / 5.0
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                "Consistently delivers high quality under pressure."
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
