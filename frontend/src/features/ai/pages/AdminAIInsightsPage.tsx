import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  BarChart4,
  Warehouse,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import apiClient from '../../../services/apiClient';
import Badge from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import ComingSoonBanner from '../../../shared/components/ui/ComingSoonBanner';
import { useToast } from '../../../shared/components/ui/Toast';
import { fetchPredictions } from '../store/forecastSlice';

interface Branch {
  id: string;
  name: string;
  city: string;
}

export default function AdminAIInsightsPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { demand, inventory, status } = useAppSelector((state) => state.forecast);

  // Dynamic branch selection
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [loadingBranches, setLoadingBranches] = useState(true);

  const loadBranches = async () => {
    try {
      setLoadingBranches(true);
      const res = await apiClient.get('/admin/branches');
      const branchList = res.data.data || [];
      setBranches(branchList);
      if (branchList.length > 0) {
        setSelectedBranchId(branchList[0].id);
      }
    } catch (err: any) {
      toast.error('Failed to load active branches list.');
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const triggerForecast = () => {
    if (!selectedBranchId) return;
    dispatch(fetchPredictions({ branchId: selectedBranchId, type: 'demand' }));
    dispatch(fetchPredictions({ branchId: selectedBranchId, type: 'inventory' }));
    toast.success('AI projections synchronized.');
  };

  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchPredictions({ branchId: selectedBranchId, type: 'demand' }));
      dispatch(fetchPredictions({ branchId: selectedBranchId, type: 'inventory' }));
    }
  }, [selectedBranchId, dispatch]);

  const totalDemandOrders =
    demand?.forecasts?.reduce((acc: number, f: any) => acc + f.expectedOrders, 0) || 0;
  const avgOrdersExpected =
    demand?.forecasts?.length > 0 ? Math.round(totalDemandOrders / demand.forecasts.length) : 0;
  const totalRisksCount = inventory?.risks?.length || 0;

  return (
    <div className="space-y-8 p-6 text-[#F8FAFC] bg-[#0F172A] min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20">
              <BrainCircuit size={18} />
            </span>
            <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              AI Insights Dashboard
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1 ml-9">
            Leverage neural demand forecasting, low stockout preventative analytics, and custom
            branch optimization recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Branch Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Branch:</span>
            {loadingBranches ? (
              <span className="text-slate-500 font-mono">Loading...</span>
            ) : (
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900">
                    {b.name.replace('ABC - ', '')}
                  </option>
                ))}
                {branches.length === 0 && (
                  <option value="" className="bg-slate-900">
                    No Branches Available
                  </option>
                )}
              </select>
            )}
          </div>

          <Button
            onClick={triggerForecast}
            disabled={status === 'loading'}
            variant="outline"
            className="flex items-center gap-2 border-slate-800 bg-[#111827] text-slate-100 hover:bg-slate-800 text-xs px-4 py-2"
          >
            <RefreshCw size={14} className={status === 'loading' ? 'animate-spin' : ''} />{' '}
            Recalculate
          </Button>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <ComingSoonBanner featureName="AI Insights Dashboard" />

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#06B6D4]/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg Expected Orders
            </p>
            <TrendingUp className="text-[#06B6D4] w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold font-display mt-2 text-white">
            {status === 'loading' ? 'Calculating...' : `${avgOrdersExpected} Orders`}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Projected mean volume per day
          </span>
        </Card>

        <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Stockout Risk Alerts
            </p>
            <AlertTriangle className="text-rose-400 w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold font-display mt-2 text-rose-400">
            {status === 'loading' ? 'Scanning...' : `${totalRisksCount} Ingredients`}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Expected shortage within 3 days
          </span>
        </Card>

        <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              AI Accuracy Confidence
            </p>
            <ShieldCheck className="text-emerald-450 w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold font-display mt-2 text-white">87%</p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Refined against historical sales
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demand Forecasting Widget */}
        <Card className="bg-[#111827] border-slate-800 shadow-xl p-6">
          <CardHeader className="p-0 border-none mb-6">
            <div className="flex items-center gap-2 text-white">
              <BarChart4 className="text-blue-500 w-5 h-5" />
              <h3 className="font-bold text-lg font-display">Demand Forecast Matrix</h3>
            </div>
            <p className="text-xs text-slate-405 mt-0.5">
              Expected visitor load and meal bookings volumes
            </p>
          </CardHeader>

          <CardContent className="p-0 space-y-5">
            {status === 'loading' ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <RefreshCw className="animate-spin text-[#06B6D4] w-8 h-8 mb-2" />
                <p className="text-xs font-semibold">Generating neural demand charts...</p>
              </div>
            ) : demand ? (
              <>
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl">
                  <div className="flex gap-2 items-start text-xs italic text-slate-300">
                    <Sparkles size={14} className="text-[#06B6D4] shrink-0 mt-0.5" />
                    <span>
                      &ldquo;
                      {demand.aiAnalysis ||
                        'A seasonal spike is expected over the upcoming period based on localized trends.'}
                      &rdquo;
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {demand.forecasts?.map((f: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3.5 bg-slate-950/40 border border-slate-805 rounded-xl text-xs"
                    >
                      <div>
                        <p className="text-white font-bold">
                          {new Date(f.date).toLocaleDateString(undefined, {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Model Confidence Score</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-450 font-extrabold text-sm">
                          {f.expectedOrders} Expected Orders
                        </p>
                        <p className="text-[10px] text-slate-450 mt-0.5">
                          {(f.confidence * 100).toFixed(0)}% accuracy rating
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!demand.forecasts || demand.forecasts.length === 0) && (
                    <p className="text-slate-500 text-xs text-center py-8">
                      No forecasts generated for this branch.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-xs text-center py-8">
                Select a valid branch to display AI demand charts.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Inventory Risks & Safety Stock */}
        <Card className="bg-[#111827] border-slate-800 shadow-xl p-6">
          <CardHeader className="p-0 border-none mb-6">
            <div className="flex items-center gap-2 text-white">
              <Warehouse className="text-amber-500 w-5 h-5" />
              <h3 className="font-bold text-lg font-display">Shortage Prevention Suite</h3>
            </div>
            <p className="text-xs text-slate-405 mt-0.5">
              Automatic spoilage and low ingredient stock notifications
            </p>
          </CardHeader>

          <CardContent className="p-0 space-y-5">
            {status === 'loading' ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <RefreshCw className="animate-spin text-amber-500 w-8 h-8 mb-2" />
                <p className="text-xs font-semibold">Running supply depletion analysis...</p>
              </div>
            ) : inventory ? (
              <>
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl">
                  <div className="flex gap-2 items-start text-xs italic text-slate-300">
                    <Sparkles size={14} className="text-[#06B6D4] shrink-0 mt-0.5" />
                    <span>
                      &ldquo;
                      {inventory.aiAnalysis ||
                        'Mozzarella and Dough supplies are running thin. Dispatching purchase order alerts.'}
                      &rdquo;
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {inventory.risks?.map((r: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3.5 bg-rose-950/10 border border-rose-900/20 rounded-xl text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold">{r.ingredient}</p>
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-extrabold uppercase">
                            SHORTAGE RISK
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450 mt-1">
                          Est. depletes in {r.daysLeft} days
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-550 block">Suggested Order</span>
                        <span className="font-extrabold text-white text-sm mt-0.5 block">
                          {r.suggestedRestockQty} units
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!inventory.risks || inventory.risks.length === 0) && (
                    <div className="p-8 text-center bg-slate-950/30 rounded-2xl border border-slate-850">
                      <CheckCircle size={24} className="text-emerald-450 mx-auto mb-2" />
                      <p className="text-slate-400 font-semibold">Stock Levels Optimal</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        No immediate stockout risks flagged for this outlet.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-xs text-center py-8">
                Select a valid branch to scan supply levels.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Corporate Growth Recommendations */}
      <Card className="bg-[#111827] border-slate-800 shadow-xl p-6">
        <CardHeader className="p-0 border-none mb-4">
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Sparkles size={16} className="text-[#06B6D4]" /> AI Business Strategy & Decisions
            Advisory
          </h3>
          <p className="text-xs text-slate-400">
            Prescriptive chain-wide strategy suggestions synthesized from consumer retention splits
            and branch ratings
          </p>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs">
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-2">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[9px] font-bold uppercase">
              Revenue & Pricing
            </span>
            <p className="font-bold text-white text-sm">Target Peak Hour Surge Promos</p>
            <p className="text-[10px] text-slate-450 leading-relaxed">
              Adjust Friday/Saturday checkout coupons dynamic rates during 7-9 PM. System predicts
              +8.2% gross revenue lift.
            </p>
          </div>
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-2">
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[9px] font-bold uppercase">
              Staff Allocation
            </span>
            <p className="font-bold text-white text-sm">Optimize Delivery Roster Shift</p>
            <p className="text-[10px] text-slate-450 leading-relaxed">
              Allocate additional delivery drivers to central branch zone on Sundays starting 5 PM
              to mitigate standard queue delays.
            </p>
          </div>
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-2">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold uppercase">
              Culinary Catalog
            </span>
            <p className="font-bold text-white text-sm">Expand Featured Veg Varieties</p>
            <p className="text-[10px] text-slate-450 leading-relaxed">
              Vegetarian category items search volumes increased by 14.5% month-over-month. Promote
              top rating veg dishes in landing cards.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
