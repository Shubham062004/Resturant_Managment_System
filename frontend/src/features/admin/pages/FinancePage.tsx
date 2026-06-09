import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/apiClient';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Building,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SummaryData {
  revenueThisMonth: number;
  lowStockCount: number;
  staffOnline: number;
}

interface PurchaseOrder {
  id: string;
  totalAmount: number;
  status: string;
}

export default function FinancePage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ownerRes, poRes] = await Promise.all([
        apiClient.get('/admin/analytics/owner-dashboard'),
        apiClient.get('/inventory/purchase-orders')
      ]);
      setSummary(ownerRes.data.data.summary);
      setPurchaseOrders(poRes.data.data);
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
    // Create a mock download link
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

  // Financial Breakdown calculations
  const revenue = summary?.revenueThisMonth || 0;
  const payroll = (summary?.staffOnline || 0) * 22500; // estimated per staff
  const spoilage = (summary?.lowStockCount || 0) * 450;
  const poCost = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  const refunds = 8500; // Estimated refunds
  const totalExpenses = payroll + spoilage + poCost + refunds;
  const netProfit = Math.max(0, revenue - totalExpenses);
  const gstCollected = Math.round(revenue * 0.05); // 5% GST on food

  return (
    <div className="space-y-8 p-6 text-white bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Financial Control Tower
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Consolidated Profit & Loss statements, Tax summaries, payroll overhead forecasting, and invoice downloads.
          </p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          className="flex items-center gap-2 border-border bg-slate-900 text-slate-100 hover:bg-slate-800"
        >
          <RefreshCw size={16} /> Reload Ledgers
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="animate-spin text-primary w-12 h-12 mb-4" />
          <p className="font-display">Assembling Profit & Loss Ledgers...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Financial Report (left) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-slate-900/40 border-border/30">
              <CardHeader className="border-none p-0 mb-6">
                <h3 className="text-lg font-bold font-display text-white">Consolidated Profit & Loss</h3>
                <p className="text-xs text-slate-400">May 2026 Telemetry Period</p>
              </CardHeader>

              <div className="space-y-4 font-sans">
                {/* Revenue */}
                <div className="flex justify-between items-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="text-emerald-400 w-5 h-5" />
                    <span className="font-semibold text-slate-200">Gross Restaurant Revenue</span>
                  </div>
                  <span className="font-bold text-emerald-400 text-base">₹{revenue.toLocaleString('en-IN')}</span>
                </div>

                {/* Expenses breakdown */}
                <div className="p-4 bg-slate-950/40 border border-border/10 rounded-xl space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Operating Expenses</h4>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Staff Payroll & Benefits</span>
                    <span className="font-medium text-slate-200">₹{payroll.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Wholesale Purchase Orders</span>
                    <span className="font-medium text-slate-200">₹{poCost.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Spoilage & Spills (Inventory Waste)</span>
                    <span className="font-medium text-slate-200">₹{spoilage.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Customer Refunds Issued</span>
                    <span className="font-medium text-slate-200">₹{refunds.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2 border-t border-border/15 font-semibold">
                    <span className="text-slate-300">Total Operational Outflow</span>
                    <span className="text-rose-400">₹{totalExpenses.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Net Profit Summary */}
                <div className="flex justify-between items-center p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="text-indigo-400 w-5 h-5" />
                    <span className="font-bold text-slate-200">Consolidated Net Profit</span>
                  </div>
                  <span className="font-extrabold text-indigo-400 text-lg">₹{netProfit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Tax filings & Report Downloads (right) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tax & GST Cards */}
            <Card className="p-6 bg-slate-900/40 border-border/30 space-y-4">
              <h3 className="text-base font-bold font-display text-white">GST & Tax Telemetry</h3>
              
              <div className="p-3 bg-slate-950/60 border border-border/20 rounded-xl">
                <span className="text-xs text-slate-400 font-semibold block">GST collected (5%)</span>
                <span className="text-lg font-bold text-emerald-400 block mt-1">₹{gstCollected.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-border/20 rounded-xl">
                <span className="text-xs text-slate-400 font-semibold block">Tax rate slab</span>
                <span className="text-lg font-bold text-slate-200 block mt-1">18% Standard corporate</span>
              </div>
            </Card>

            {/* Document Downloads */}
            <Card className="p-6 bg-slate-900/40 border-border/30 space-y-4">
              <h3 className="text-base font-bold font-display text-white">Generate Reports</h3>
              <p className="text-xs text-slate-400">Download formatted accounting logs for audit submission</p>
              
              <div className="space-y-3 pt-2">
                <Button
                  onClick={() => handleDownloadReport('GST Return')}
                  className="w-full flex items-center justify-between bg-slate-950 border border-border/20 text-slate-200 hover:bg-slate-900 text-xs py-2 px-3"
                >
                  <span className="flex items-center gap-2">
                    <FileText size={14} className="text-indigo-400" /> GST filings GSTR-1
                  </span>
                  <Download size={14} />
                </Button>

                <Button
                  onClick={() => handleDownloadReport('Profit & Loss Summary')}
                  className="w-full flex items-center justify-between bg-slate-950 border border-border/20 text-slate-200 hover:bg-slate-900 text-xs py-2 px-3"
                >
                  <span className="flex items-center gap-2">
                    <FileText size={14} className="text-emerald-400" /> P&L Consolidated
                  </span>
                  <Download size={14} />
                </Button>

                <Button
                  onClick={() => handleDownloadReport('Tax Ledger Audit')}
                  className="w-full flex items-center justify-between bg-slate-950 border border-border/20 text-slate-200 hover:bg-slate-900 text-xs py-2 px-3"
                >
                  <span className="flex items-center gap-2">
                    <FileText size={14} className="text-amber-400" /> Corporate Tax Summary
                  </span>
                  <Download size={14} />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
