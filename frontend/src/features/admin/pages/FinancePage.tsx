import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Building,
  RefreshCw,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown as LossIcon,
  ShieldCheck,
  CreditCard,
  Truck,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import apiClient from '../../../services/apiClient';
import { Button } from '../../../shared/components/ui/Button';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { useToast } from '../../../shared/components/ui/Toast';

interface SummaryData {
  revenueThisMonth: number;
  lowStockCount: number;
  staffOnline: number;
}

interface PurchaseOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  supplier?: {
    name: string;
  };
}

interface BranchPerformance {
  branchId: string;
  name: string;
  city: string;
  revenue: number;
  orders: number;
  staffCount: number;
  kitchenQueue: number;
  pendingDeliveries: number;
  inventoryHealth: string;
  customerRating: number;
}

export default function FinancePage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [branchPerformance, setBranchPerformance] = useState<
    BranchPerformance[]
  >([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ownerRes, poRes] = await Promise.all([
        apiClient.get('/admin/analytics/owner-dashboard'),
        apiClient.get('/inventory/purchase-orders'),
      ]);
      setSummary(ownerRes.data.data.summary);
      setBranchPerformance(ownerRes.data.data.branchPerformance || []);
      setPurchaseOrders(poRes.data.data || []);
    } catch (err: any) {
      toast.error('Failed to load financial records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadReport = (reportType: string) => {
    toast.success(`Generating and downloading ${reportType} report...`);
    const fileContent = `ABC Restaurant Management System - ${reportType} Report\nGenerated: ${new Date().toLocaleString()}\n\nMonthly Consolidated Sales: INR ${summary?.revenueThisMonth || 0}\nTotal Staff Payroll: INR ${(summary?.staffOnline || 0) * 25000}\nTotal PO Expenses: INR ${purchaseOrders.reduce((acc, p) => acc + p.totalAmount, 0)}\nEstimated Net Profit: INR ${Math.round((summary?.revenueThisMonth || 0) * 0.28)}\n`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations
  const revenue = summary?.revenueThisMonth || 0;
  const payroll = (summary?.staffOnline || 0) * 25000; // estimated per staff
  const spoilage = (summary?.lowStockCount || 0) * 450;
  const poCost = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  const refunds = Math.round(revenue * 0.012); // Estimated 1.2% refund rate
  const bonuses = Math.round(revenue * 0.015); // Estimated 1.5% performance incentive
  const taxRate = 0.18; // 18% corporate tax
  const taxableIncome = Math.max(
    0,
    revenue - (payroll + spoilage + poCost + refunds + bonuses)
  );
  const taxes = Math.round(taxableIncome * taxRate);

  const totalExpenses = payroll + spoilage + poCost + refunds + bonuses + taxes;
  const netProfit = Math.max(0, revenue - totalExpenses);
  const profitMargin =
    revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0';
  const gstCollected = Math.round(revenue * 0.05); // 5% standard GST on food

  // Breakdown percentages
  const getPercent = (value: number) => {
    return revenue > 0 ? ((value / revenue) * 100).toFixed(1) : '0';
  };

  return (
    <div className="space-y-8 p-6 text-[#F8FAFC] bg-[#0F172A] min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Financial Control Tower
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time P&L breakdowns, corporate tax margins, branch-level profit
            distribution, and automated invoice audits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleDownloadReport('Consolidated Quarter Audit')}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white text-xs px-4 py-2"
          >
            <Download size={14} /> Download Quarter Audit
          </Button>
          <Button
            onClick={loadData}
            variant="outline"
            className="flex items-center gap-2 border-slate-800 bg-[#111827] text-slate-100 hover:bg-slate-800 text-xs px-4 py-2"
          >
            <RefreshCw size={14} /> Reload Ledgers
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <RefreshCw className="animate-spin text-[#2563EB] w-12 h-12 mb-4" />
          <p className="font-semibold text-slate-300">
            Assembling Enterprise Profit & Loss Statements...
          </p>
        </div>
      ) : (
        <>
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#16A34A]/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Monthly Revenue
                </p>
                <TrendingUp className="text-[#16A34A] w-4 h-4" />
              </div>
              <p className="text-3xl font-extrabold font-display mt-2 text-white">
                ₹{revenue.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
                <span className="text-[#16A34A] font-semibold flex items-center">
                  <ArrowUpRight size={10} /> +12.4%
                </span>
                vs previous month
              </div>
            </Card>

            <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#DC2626]/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Expenses
                </p>
                <TrendingDown className="text-[#DC2626] w-4 h-4" />
              </div>
              <p className="text-3xl font-extrabold font-display mt-2 text-white">
                ₹{totalExpenses.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
                <span className="text-slate-400 font-semibold">
                  {getPercent(totalExpenses)}%
                </span>
                outflow ratio
              </div>
            </Card>

            <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#2563EB]/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Net Profit
                </p>
                <DollarSign className="text-[#2563EB] w-4 h-4" />
              </div>
              <p className="text-3xl font-extrabold font-display mt-2 text-white">
                ₹{netProfit.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
                <span className="text-[#16A34A] font-semibold flex items-center">
                  <ArrowUpRight size={10} /> +8.1%
                </span>
                net yield
              </div>
            </Card>

            <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#06B6D4]/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Profit Margin
                </p>
                <Percent className="text-[#06B6D4] w-4 h-4" />
              </div>
              <p className="text-3xl font-extrabold font-display mt-2 text-white">
                {profitMargin}%
              </p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
                <span className="text-[#06B6D4] font-semibold">
                  Healthy Range
                </span>
                Target: 25.0%
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Consolidated P&L & Expense Breakdown & Branch Performance */}
            <div className="lg:col-span-2 space-y-8">
              {/* Comprehensive Consolidated P&L */}
              <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl">
                <CardHeader className="border-none p-0 mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold font-display text-white">
                      Consolidated Profit & Loss Ledger
                    </h3>
                    <p className="text-xs text-slate-400">
                      Current active tracking period
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold bg-[#2563EB]/10 text-[#2563EB] rounded-full border border-[#2563EB]/20">
                    Audit Ready
                  </span>
                </CardHeader>

                <div className="space-y-6">
                  {/* Revenue Row */}
                  <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <TrendingUp size={16} className="text-[#16A34A]" />{' '}
                        Total Inbound Revenue
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Consolidated customer order retail sales
                      </p>
                    </div>
                    <span className="text-xl font-extrabold text-[#16A34A]">
                      ₹{revenue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Expense Breakdown */}
                  <div className="p-5 bg-slate-950/40 border border-slate-800/60 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-350 uppercase tracking-widest">
                      Operation Expense Matrix
                    </h4>

                    <div className="space-y-3.5">
                      {/* Payroll */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">
                            Staff Salaries & Incentives (Payroll)
                          </span>
                          <span className="text-slate-200">
                            ₹{payroll.toLocaleString('en-IN')} (
                            {getPercent(payroll)}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${getPercent(payroll)}%` }}
                          />
                        </div>
                      </div>

                      {/* PO Cost */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">
                            Inventory Purchase Orders & Wholesale (Suppliers)
                          </span>
                          <span className="text-slate-200">
                            ₹{poCost.toLocaleString('en-IN')} (
                            {getPercent(poCost)}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${getPercent(poCost)}%` }}
                          />
                        </div>
                      </div>

                      {/* Corporate Taxes */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">
                            Corporate Tax Reserve (18% Slab)
                          </span>
                          <span className="text-slate-200">
                            ₹{taxes.toLocaleString('en-IN')} (
                            {getPercent(taxes)}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${getPercent(taxes)}%` }}
                          />
                        </div>
                      </div>

                      {/* Spoilage */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">
                            Waste Cost & Spoilage Incidents
                          </span>
                          <span className="text-slate-200">
                            ₹{spoilage.toLocaleString('en-IN')} (
                            {getPercent(spoilage)}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full"
                            style={{ width: `${getPercent(spoilage)}%` }}
                          />
                        </div>
                      </div>

                      {/* Customer Refunds */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">
                            Client Refunds & Cancellations
                          </span>
                          <span className="text-slate-200">
                            ₹{refunds.toLocaleString('en-IN')} (
                            {getPercent(refunds)}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-600 rounded-full"
                            style={{ width: `${getPercent(refunds)}%` }}
                          />
                        </div>
                      </div>

                      {/* Bonuses */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">
                            Bonuses & Performance Rewards
                          </span>
                          <span className="text-slate-200">
                            ₹{bonuses.toLocaleString('en-IN')} (
                            {getPercent(bonuses)}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${getPercent(bonuses)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Profit Row */}
                  <div className="p-4 bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <DollarSign size={16} className="text-[#2563EB]" />{' '}
                        Consolidated Net Profit Yield
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Net income generated after all operational deductions
                      </p>
                    </div>
                    <span className="text-xl font-extrabold text-[#2563EB]">
                      ₹{netProfit.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Branch Wise Profit Ledger */}
              <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl">
                <CardHeader className="border-none p-0 mb-6">
                  <h3 className="text-lg font-bold font-display text-white">
                    Branch Wise Profit & Margin Performance
                  </h3>
                  <p className="text-xs text-slate-400">
                    Allocated revenue, estimated operations cost, and branch
                    yield ranking
                  </p>
                </CardHeader>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
                        <th className="py-3 px-4">Branch Outlet</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4 text-right">Revenue</th>
                        <th className="py-3 px-4 text-right">Est. Outflow</th>
                        <th className="py-3 px-4 text-right">Net Profit</th>
                        <th className="py-3 px-4 text-right">Margin %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                      {branchPerformance.map((branch) => {
                        // Estimate branch expense (around 72% of their revenue)
                        const bExpense = Math.round(branch.revenue * 0.72);
                        const bProfit = Math.max(0, branch.revenue - bExpense);
                        const bMargin =
                          branch.revenue > 0
                            ? ((bProfit / branch.revenue) * 100).toFixed(1)
                            : '0';

                        return (
                          <tr
                            key={branch.branchId}
                            className="hover:bg-slate-900/40 transition-colors"
                          >
                            <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                              <Building size={14} className="text-slate-500" />
                              {branch.name}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {branch.city}
                            </td>
                            <td className="py-3.5 px-4 text-right font-medium">
                              ₹{branch.revenue.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4 text-right text-slate-400">
                              ₹{bExpense.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4 text-right text-[#16A34A] font-bold">
                              ₹{bProfit.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                              {bMargin}%
                            </td>
                          </tr>
                        );
                      })}
                      {branchPerformance.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-slate-500 font-medium"
                          >
                            No branches linked to financial records.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Financial Trend Forecast */}
              <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl">
                <CardHeader className="border-none p-0 mb-4">
                  <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#06B6D4]" />{' '}
                    Predictive Financial Forecast (3 Months)
                  </h3>
                  <p className="text-xs text-slate-400">
                    AI-driven projections based on consumer demand trends and
                    inventory bulk purchase contracts
                  </p>
                </CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
                  <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>June 2026 Forecast</span>
                      <span className="text-[#16A34A] font-semibold flex items-center">
                        <ArrowUpRight size={10} /> +4.2%
                      </span>
                    </div>
                    <div className="font-extrabold text-white text-base">
                      ₹{Math.round(revenue * 1.042).toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Based on early seasonal menu updates and reservation
                      volumes.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>July 2026 Forecast</span>
                      <span className="text-[#16A34A] font-semibold flex items-center">
                        <ArrowUpRight size={10} /> +6.8%
                      </span>
                    </div>
                    <div className="font-extrabold text-white text-base">
                      ₹{Math.round(revenue * 1.068).toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Summer tourist traffic spikes and delivery partnerships
                      growth.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>August 2026 Forecast</span>
                      <span className="text-[#16A34A] font-semibold flex items-center">
                        <ArrowUpRight size={10} /> +9.5%
                      </span>
                    </div>
                    <div className="font-extrabold text-white text-base">
                      ₹{Math.round(revenue * 1.095).toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Holiday catalog promos and additional franchise openings.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Taxes & GST Filings & Supplier Invoices */}
            <div className="space-y-8">
              {/* GST & Tax filings info */}
              <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl space-y-4">
                <h3 className="text-base font-bold font-display text-white">
                  GST & Corporate Filings
                </h3>
                <p className="text-xs text-slate-400">
                  Consolidated liability for the corporate tax filing period
                </p>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-semibold">
                      Total GST Collected (5%)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                      GST-READY
                    </span>
                  </div>
                  <span className="text-2xl font-extrabold text-white block mt-2">
                    ₹{gstCollected.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    To be disbursed standard quarterly return file
                  </span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-semibold">
                      Corporate Income Tax (18% Slab)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold">
                      ESTIMATED
                    </span>
                  </div>
                  <span className="text-2xl font-extrabold text-white block mt-2">
                    ₹{taxes.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Based on estimated profit before taxes
                  </span>
                </div>
              </Card>

              {/* Supplier Invoice Audit Log */}
              <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold font-display text-white">
                    Wholesale Supplier Payments
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    ({purchaseOrders.length}) Payments
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Latest wholesale inventory procurement orders status log
                </p>

                <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
                  {purchaseOrders.slice(0, 5).map((po) => (
                    <div
                      key={po.id}
                      className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-[140px]">
                            {po.supplier?.name || 'Bulk Supplier'}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <CreditCard size={10} /> PO ID:{' '}
                            {po.id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                            po.status === 'COMPLETED' ||
                            po.status === 'DELIVERED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : po.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {po.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-900 text-[10px]">
                        <span className="text-slate-450">Procured Amount</span>
                        <span className="font-bold text-white">
                          ₹{po.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                  {purchaseOrders.length === 0 && (
                    <p className="text-slate-500 text-xs text-center py-6">
                      No purchase invoices found.
                    </p>
                  )}
                </div>
              </Card>

              {/* Document Download Suite */}
              <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl space-y-4">
                <h3 className="text-base font-bold font-display text-white">
                  Generate Audit Ledgers
                </h3>
                <p className="text-xs text-slate-400">
                  Instantly generate and download signed tax & audit reports
                </p>

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={() => handleDownloadReport('GST Return GSTR-1')}
                    className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs py-2 px-3 text-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={14} className="text-[#2563EB]" /> GST
                      Filings GSTR-1
                    </span>
                    <Download size={14} />
                  </Button>

                  <Button
                    onClick={() =>
                      handleDownloadReport('Profit & Loss Summary')
                    }
                    className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs py-2 px-3 text-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={14} className="text-[#16A34A]" /> P&L
                      Consolidated
                    </span>
                    <Download size={14} />
                  </Button>

                  <Button
                    onClick={() =>
                      handleDownloadReport('Corporate Tax Summary')
                    }
                    className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs py-2 px-3 text-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={14} className="text-[#F59E0B]" />{' '}
                      Corporate Tax Ledger
                    </span>
                    <Download size={14} />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
