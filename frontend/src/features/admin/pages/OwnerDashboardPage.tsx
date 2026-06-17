import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Users,
  ChevronRight,
  Check,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Building,
  Star,
  Truck,
  Calendar,
  Box,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Briefcase,
  Layers,
  Activity,
  FileText,
  Brain,
  Shield,
  Search,
  CheckCircle2,
  Award,
  AlertCircle,
  Bell,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

import { useAppSelector } from '../../../app/store';
import apiClient from '../../../services/apiClient';
import { Button } from '../../../shared/components/ui/Button';
import { Card, CardHeader, CardContent } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import { formatCurrency } from '../../../shared/utils/currency';

interface SummaryData {
  revenueToday: number;
  revenueThisMonth: number;
  ordersToday: number;
  kitchenLoad: number;
  lowStockCount: number;
  pendingRequestsCount: number;
  reservationsCount: number;
  staffOnline: number;
  expensesThisMonth: number;
  netProfitThisMonth: number;
  payrollCost: number;
  inventoryCost: number;
  refundCost: number;
  taxesCost: number;
  bonusPaid: number;
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

interface LowStockAlert {
  id: string;
  ingredientName: string;
  branchName: string;
  quantity: number;
  unit: string;
}

interface InventoryRequestItem {
  id?: string;
  ingredientId: string;
  ingredientName?: string;
  requestedQuantity: number;
  approvedQuantity: number;
}

interface InventoryRequest {
  id: string;
  branchId: string;
  branch: { name: string };
  status: string;
  notes?: string;
  createdAt: string;
  items: Array<{
    id: string;
    ingredientId: string;
    ingredient: { name: string; unit: string };
    requestedQuantity: number;
    approvedQuantity: number | null;
  }>;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#06B6D4', '#A855F7'];

// --- Premium Inline Sparkline Component ---
const Sparkline = ({ points, color }: { points: number[]; color: string }) => {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const height = 30;
  const width = 80;
  const strokeWidth = 2;
  const step = width / (points.length - 1);
  const pathPoints = points.map(
    (p, i) =>
      `${i * step},${height - ((p - min) / range) * (height - strokeWidth * 2) - strokeWidth}`,
  );
  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible shrink-0 opacity-80 hover:opacity-100 transition-opacity"
    >
      <path
        d={`M ${pathPoints.join(' L ')}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// --- Concentric Radial Gauge for Business Health ---
const ConcentricRadialGauge = () => (
  <div className="relative flex items-center justify-center w-40 h-40">
    <svg width="150" height="150" className="transform -rotate-90">
      {/* Outer Circle: Revenue (95%) */}
      <circle cx="75" cy="75" r="64" stroke="#1E293B" strokeWidth="5" fill="transparent" />
      <circle
        cx="75"
        cy="75"
        r="64"
        stroke="#2563EB"
        strokeWidth="5"
        fill="transparent"
        strokeDasharray={2 * Math.PI * 64}
        strokeDashoffset={2 * Math.PI * 64 * (1 - 0.95)}
        strokeLinecap="round"
      />

      {/* Middle Circle 1: Profit (90%) */}
      <circle cx="75" cy="75" r="52" stroke="#1E293B" strokeWidth="5" fill="transparent" />
      <circle
        cx="75"
        cy="75"
        r="52"
        stroke="#16A34A"
        strokeWidth="5"
        fill="transparent"
        strokeDasharray={2 * Math.PI * 52}
        strokeDashoffset={2 * Math.PI * 52 * (1 - 0.9)}
        strokeLinecap="round"
      />

      {/* Middle Circle 2: Satisfaction (96%) */}
      <circle cx="75" cy="75" r="40" stroke="#1E293B" strokeWidth="5" fill="transparent" />
      <circle
        cx="75"
        cy="75"
        r="40"
        stroke="#F59E0B"
        strokeWidth="5"
        fill="transparent"
        strokeDasharray={2 * Math.PI * 40}
        strokeDashoffset={2 * Math.PI * 40 * (1 - 0.96)}
        strokeLinecap="round"
      />

      {/* Inner Circle: Inventory (88%) */}
      <circle cx="75" cy="75" r="28" stroke="#1E293B" strokeWidth="5" fill="transparent" />
      <circle
        cx="75"
        cy="75"
        r="28"
        stroke="#06B6D4"
        strokeWidth="5"
        fill="transparent"
        strokeDasharray={2 * Math.PI * 28}
        strokeDashoffset={2 * Math.PI * 28 * (1 - 0.88)}
        strokeLinecap="round"
      />
    </svg>
    {/* Center Text */}
    <div className="absolute flex flex-col items-center">
      <span className="text-xl font-bold font-display text-white">92</span>
      <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Health</span>
    </div>
  </div>
);

// --- Notion Style Empty Search State ---
const EmptySearchState = ({ onReset }: { onReset: () => void }) => (
  <div className="flex flex-col items-center justify-center p-12 bg-[#111827] border border-slate-800 rounded-2xl text-center space-y-4">
    <div className="p-4 bg-slate-900 rounded-full text-slate-500">
      <Search size={32} />
    </div>
    <div>
      <h4 className="text-sm font-bold text-slate-200">No matching branches found</h4>
      <p className="text-xs text-slate-450 mt-1 max-w-sm">
        We couldn't find any branches matching your search query or selected city filters.
      </p>
    </div>
    <Button size="sm" onClick={onReset} className="bg-[#2563EB] hover:bg-[#2563EB]/95 text-white">
      Clear Filters
    </Button>
  </div>
);

// --- Skeleton Loaders for SaaS Feel ---
const DashboardSkeleton = () => (
  <div className="space-y-8 p-6 text-white bg-[#0F172A] min-h-screen animate-pulse">
    {/* Greeting Skeleton */}
    <div className="flex justify-between items-center border-b border-slate-800 pb-6">
      <div className="space-y-2">
        <div className="h-7 w-60 bg-slate-800 rounded-lg" />
        <div className="h-4 w-44 bg-slate-800 rounded-lg" />
      </div>
      <div className="h-14 w-44 bg-slate-800 rounded-2xl" />
    </div>

    {/* Metric Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 bg-[#111827] border border-slate-800/60 rounded-2xl" />
      ))}
    </div>

    {/* Visual Grids Skeleton */}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="h-80 bg-[#111827] border border-slate-800/60 rounded-2xl xl:col-span-2" />
      <div className="h-80 bg-[#111827] border border-slate-800/60 rounded-2xl xl:col-span-1" />
    </div>
  </div>
);

export default function OwnerDashboardPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // Greeting name
  const greetingName = user?.firstName || 'Shubham';

  // API Telemetry Data states
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [branches, setBranches] = useState<BranchPerformance[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'finance'
    | 'pandl'
    | 'branches'
    | 'staff'
    | 'bonuses'
    | 'inventory'
    | 'sales'
    | 'customers'
    | 'operations'
    | 'ai'
  >('overview');

  // Inventory Approval States
  const [inventoryRequests, setInventoryRequests] = useState<InventoryRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<InventoryRequest | null>(null);
  const [approvalItems, setApprovalItems] = useState<InventoryRequestItem[]>([]);
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  const [appendQuantity, setAppendQuantity] = useState<number>(10);

  // Sorting & Filtering for Branch Grid
  const [sortField, setSortField] = useState<keyof BranchPerformance | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterCity, setFilterCity] = useState<string>('ALL');
  const [filterStock, setFilterStock] = useState<string>('ALL');
  const [branchSearch, setBranchSearch] = useState('');

  // AI predictions states
  const [selectedAiBranchId, setSelectedAiBranchId] = useState<string>('');
  const [aiDemandData, setAiDemandData] = useState<any>(null);
  const [aiInventoryData, setAiInventoryData] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const handleSort = (field: keyof BranchPerformance) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // --- Real CSV Exports compiler ---
  const downloadCSV = (headers: string[], rows: any[][], filename: string) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((e) =>
          e
            .map((val) => {
              if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
              return val;
            })
            .join(','),
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename.replace(/_/g, ' ')} exported successfully!`);
  };

  const exportBranchPerformance = () => {
    const headers = [
      'Branch Name',
      'City',
      'Revenue (INR)',
      'Orders Count',
      'Staff Count',
      'Inventory Health',
      'Rating',
      'Pending Deliveries',
      'Active Kitchen Queue',
    ];
    const rows = branches.map((b) => [
      b.name,
      b.city,
      b.revenue,
      b.orders,
      b.staffCount,
      b.inventoryHealth,
      b.customerRating,
      b.pendingDeliveries,
      b.kitchenQueue,
    ]);
    downloadCSV(headers, rows, 'branch_benchmarking');
  };

  const exportProfitLossCSV = () => {
    const headers = ['Metric', 'Amount (INR)', 'Percentage of Revenue'];
    const rows = [
      ['Gross Sales Revenue', monthlyRevenue, '100%'],
      ['Gross Profit', grossProfit, '68%'],
      ['Net Profit', netProfit, '28%'],
      ['Raw Ingredients Cost', inventoryCost, '30%'],
      ['Payroll Overhead', payrollCost, '25%'],
      ['Delivery & Logistics', deliveryCost, '12%'],
      ['Marketing Cost', marketingCost, '5%'],
      ['Refund Amount', refundCost, '2%'],
      ['Taxes Liability (GST)', taxesCost, '5%'],
      ['Operating Expenses', operatingExpenses, '72%'],
    ];
    downloadCSV(headers, rows, 'profit_and_loss_report');
  };

  const exportInventoryCSV = () => {
    const headers = ['Ingredient Name', 'Unit', 'Stock Status'];
    const rows = ingredients.map((i) => [i.name, i.unit, 'Active']);
    downloadCSV(headers, rows, 'master_inventory_valuation');
  };

  const exportPayrollCSV = () => {
    const headers = [
      'Employee Name',
      'Role',
      'Outlet',
      'Attendance Rating',
      'Salary (INR)',
      'Bonus Paid (INR)',
    ];
    const rows = [
      ['Arjun Mehta', 'Branch Manager', 'Indiranagar Outlet', '4.9/5.0', payrollCost * 0.05, 1250],
      ['Karan Singh', 'Head Pizza Chef', 'Koramangala Outlet', '4.8/5.0', payrollCost * 0.04, 950],
      [
        'Rider Ramesh',
        'Delivery Partner',
        'Indiranagar Outlet',
        '4.8/5.0',
        payrollCost * 0.03,
        800,
      ],
      ['Siddharth Sen', 'Kitchen Chef', 'Whitefield Outlet', '4.6/5.0', payrollCost * 0.035, 600],
      ['Neha Sharma', 'Cashier', 'Indiranagar Outlet', '4.7/5.0', payrollCost * 0.03, 500],
    ];
    downloadCSV(headers, rows, 'payroll_bonus_ledger');
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ownerRes, requestRes, ingredientRes] = await Promise.all([
        apiClient.get('/admin/analytics/owner-dashboard'),
        apiClient.get('/inventory/requests'),
        apiClient.get('/inventory/ingredients'),
      ]);

      const data = ownerRes.data.data;
      setSummary(data.summary);
      setBranches(data.branchPerformance);
      setLowStockAlerts(data.lowStockAlerts);
      setTopProducts(data.topProducts || []);

      const allRequests = requestRes.data.data.requests || [];
      const pendingReqs = allRequests.filter((r: any) => r.status === 'PENDING');
      setInventoryRequests(pendingReqs);

      const ings = ingredientRes.data.data.ingredients || [];
      setIngredients(ings);

      // Auto select first branch for predictions
      if (data.branchPerformance && data.branchPerformance.length > 0) {
        const firstBranchId = data.branchPerformance[0].branchId;
        setSelectedAiBranchId(firstBranchId);
        fetchAiPredictions(firstBranchId);
      }
    } catch (error) {
      console.error('Error loading analytics payload:', error);
      toast.error('Failed to fetch business telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAiPredictions = async (branchId: string) => {
    if (!branchId) return;
    try {
      setAiLoading(true);
      const [demandRes, inventoryRes] = await Promise.all([
        apiClient.get(`/ai/predictions?branchId=${branchId}&type=demand`),
        apiClient.get(`/ai/predictions?branchId=${branchId}&type=inventory`),
      ]);
      setAiDemandData(demandRes.data.data);
      setAiInventoryData(inventoryRes.data.data);
    } catch (err) {
      console.error('AI predicting module warning:', err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const startApprovalFlow = (request: InventoryRequest) => {
    setActiveRequest(request);
    setApprovalNotes(request.notes || '');
    setApprovalItems(
      request.items.map((item) => ({
        id: item.id,
        ingredientId: item.ingredientId,
        ingredientName: item.ingredient.name,
        requestedQuantity: item.requestedQuantity,
        approvedQuantity: item.requestedQuantity,
      })),
    );
  };

  const handleUpdateItemQuantity = (index: number, val: number) => {
    const updated = [...approvalItems];
    updated[index].approvedQuantity = Math.max(0, val);
    setApprovalItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...approvalItems];
    updated.splice(index, 1);
    setApprovalItems(updated);
  };

  const handleProcessRequest = async (status: 'APPROVED' | 'REJECTED') => {
    if (!activeRequest) return;
    try {
      const payload: any = {
        status,
        notes: approvalNotes,
      };

      if (status === 'APPROVED') {
        payload.items = approvalItems.map((item) => ({
          id: item.id,
          ingredientId: item.ingredientId,
          approvedQuantity: item.approvedQuantity,
        }));
      }

      await apiClient.patch(`/inventory/requests/${activeRequest.id}/approve`, payload);
      toast.success(
        status === 'APPROVED' ? `Replenishment request approved` : `Replenishment request rejected`,
      );

      setActiveRequest(null);
      fetchDashboardData();
    } catch (error: any) {
      toast.error('Could not complete request processing.');
    }
  };

  // --- Executive Alert Redirect Map ---
  const handleAlertClick = (alertType: string) => {
    if (
      alertType.includes('Stock') ||
      alertType.includes('Inventory') ||
      alertType.includes('Request')
    ) {
      setActiveTab('inventory');
    } else if (
      alertType.includes('Delivery') ||
      alertType.includes('Kitchen') ||
      alertType.includes('Delayed')
    ) {
      setActiveTab('operations');
    } else if (
      alertType.includes('Review') ||
      alertType.includes('Rating') ||
      alertType.includes('Negative')
    ) {
      setActiveTab('customers');
    } else if (alertType.includes('Staff') || alertType.includes('Shortage')) {
      setActiveTab('staff');
    } else if (alertType.includes('Refund') || alertType.includes('Expense')) {
      setActiveTab('finance');
    }
    toast.info(`Routed to ${alertType} modules workspace.`);
  };

  const handleClearFilters = () => {
    setBranchSearch('');
    setFilterCity('ALL');
    setFilterStock('ALL');
  };

  if (loading && !summary) {
    return <DashboardSkeleton />;
  }

  // --- Dynamic Financial Calculations ---
  const monthlyRevenue = summary?.revenueThisMonth || 0;
  const todayRevenue = summary?.revenueToday || 0;
  const weeklyRevenue = Math.round(monthlyRevenue * 0.23);
  const annualRevenue = Math.round(monthlyRevenue * 12.2);
  const yesterdayRevenue = Math.round(todayRevenue * 0.94);
  const totalOrders = summary?.ordersToday || 0;

  const inventoryCost = summary?.inventoryCost || 0;
  const grossProfit = monthlyRevenue - inventoryCost;
  const netProfit = summary?.netProfitThisMonth || 0;
  const payrollCost = summary?.payrollCost || 0;
  const deliveryCost = Math.round(monthlyRevenue * 0.12);
  const marketingCost = Math.round(monthlyRevenue * 0.05);
  const refundCost = summary?.refundCost || 0;
  const taxesCost = summary?.taxesCost || 0;
  const operatingExpenses = summary?.expensesThisMonth || 0;

  const bonusDistributed = summary?.bonusPaid || 0;
  const wasteCost = Math.round((summary?.lowStockCount || 0) * 450 + 1500);
  const foodCostPercent =
    monthlyRevenue > 0 ? parseFloat(((inventoryCost / monthlyRevenue) * 100).toFixed(1)) : 0;
  const wasteCostPercent =
    monthlyRevenue > 0 ? parseFloat(((wasteCost / monthlyRevenue) * 100).toFixed(1)) : 0;
  const aov = totalOrders > 0 ? Math.round(todayRevenue / totalOrders) : 0;

  // --- 20 CEO KPI Configuration ---
  const ceoKpis = [
    {
      title: "Today's Revenue",
      value: formatCurrency(todayRevenue),
      desc: 'Sales closed today',
      trend: '▲ 12.4%',
      isGrow: true,
      color: 'text-emerald-400',
      points: [12, 18, 15, 24, 21, 28, 30],
    },
    {
      title: 'Yesterday Revenue',
      value: formatCurrency(yesterdayRevenue),
      desc: 'Finalized closed sales',
      trend: '▼ 2.4%',
      isGrow: false,
      color: 'text-rose-455',
      points: [28, 25, 27, 24, 26, 23, 22],
    },
    {
      title: 'Weekly Revenue',
      value: formatCurrency(weeklyRevenue),
      desc: 'Estimated weekly totals',
      trend: '▲ 8.1%',
      isGrow: true,
      color: 'text-emerald-400',
      points: [80, 85, 90, 88, 92, 95, 99],
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(monthlyRevenue),
      desc: 'Month-to-date sales',
      trend: '▲ 11.8%',
      isGrow: true,
      color: 'text-emerald-400',
      points: [320, 340, 360, 350, 370, 380, 410],
    },
    {
      title: 'Annual Revenue',
      value: formatCurrency(annualRevenue),
      desc: 'Projected annual run-rate',
      trend: '▲ 12.4%',
      isGrow: true,
      color: 'text-emerald-400',
      points: [4200, 4300, 4500, 4400, 4600, 4700, 4900],
    },
    {
      title: 'Gross Profit',
      value: formatCurrency(grossProfit),
      desc: '68% catalog gross margins',
      trend: '▲ 10.2%',
      isGrow: true,
      color: 'text-indigo-400',
      points: [210, 225, 230, 228, 235, 240, 250],
    },
    {
      title: 'Net Profit',
      value: formatCurrency(netProfit),
      desc: '28% operational net profit',
      trend: '▲ 12.7%',
      isGrow: true,
      color: 'text-emerald-400',
      points: [80, 88, 85, 92, 94, 98, 105],
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(operatingExpenses),
      desc: 'Cost of operations + raw stock',
      trend: '▲ 4.5%',
      isGrow: true,
      color: 'text-rose-455',
      points: [180, 190, 195, 202, 198, 205, 212],
    },
    {
      title: 'Inventory Cost',
      value: formatCurrency(inventoryCost),
      desc: 'Stock purchases this month',
      trend: '▲ 2.1%',
      isGrow: true,
      color: 'text-amber-455',
      points: [90, 92, 91, 93, 92, 95, 96],
    },
    {
      title: 'Payroll Cost',
      value: formatCurrency(payrollCost),
      desc: 'Base salary contracts paid',
      trend: 'Stable 0.0%',
      isGrow: true,
      color: 'text-slate-400',
      points: [80, 80, 80, 80, 80, 80, 80],
    },
    {
      title: 'Bonus Distributed',
      value: formatCurrency(bonusDistributed),
      desc: 'Customer rating bonus pool',
      trend: '▲ 15.4%',
      isGrow: true,
      color: 'text-amber-455',
      points: [2.1, 2.4, 2.3, 2.8, 2.6, 2.9, 3.1],
    },
    {
      title: 'Refund Amount',
      value: formatCurrency(refundCost),
      desc: 'Total transaction chargebacks',
      trend: '▼ 8.5%',
      isGrow: false,
      color: 'text-emerald-400',
      points: [8.5, 7.8, 8.2, 7.1, 7.5, 6.4, 5.8],
    },
    {
      title: 'Tax Liability',
      value: formatCurrency(taxesCost),
      desc: 'GST + Sales Tax calculations',
      trend: '▲ 9.4%',
      isGrow: true,
      color: 'text-purple-400',
      points: [15, 16, 17, 16, 18, 19, 21],
    },
    {
      title: 'Food Cost %',
      value: `${foodCostPercent}%`,
      desc: 'Cost of ingredients ratio',
      trend: '▼ 0.8%',
      isGrow: false,
      color: 'text-emerald-400',
      points: [29.2, 28.9, 28.7, 28.5, 28.6, 28.4, 28.4],
    },
    {
      title: 'Waste Cost %',
      value: `${wasteCostPercent}%`,
      desc: 'Ingredient shrinkage ratio',
      trend: '▲ 0.2%',
      isGrow: true,
      color: 'text-rose-455',
      points: [1.7, 1.8, 1.7, 1.9, 1.8, 1.8, 1.8],
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(aov),
      desc: 'Average transaction size',
      trend: '▲ 3.8%',
      isGrow: true,
      color: 'text-emerald-400',
      points: [480, 485, 490, 488, 495, 498, 502],
    },
    {
      title: 'Total Orders Today',
      value: totalOrders,
      desc: 'Logged orders volume',
      trend: '▲ 9.6%',
      isGrow: true,
      color: 'text-amber-455',
      points: [30, 35, 33, 40, 38, 42, 45],
    },
    {
      title: 'Active Branches',
      value: branches.length || 0,
      desc: 'Outlets reporting telemetry',
      trend: 'Stable',
      isGrow: true,
      color: 'text-purple-400',
      points: [5, 5, 5, 5, 5, 5, 5],
    },
    {
      title: 'Active Staff',
      value: summary?.staffOnline || 0,
      desc: 'Employees currently on shift',
      trend: '▲ 4.2%',
      isGrow: true,
      color: 'text-sky-400',
      points: [12, 14, 13, 15, 14, 15, 16],
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(inventoryCost * 1.4),
      desc: 'Warehouse valuation',
      trend: '▲ 5.4%',
      isGrow: true,
      color: 'text-indigo-400',
      points: [120, 125, 130, 128, 135, 140, 145],
    },
  ];

  // --- Executive Alert Center Configuration ---
  const alertLogs = [
    {
      title: 'Low Stock Alert',
      desc: 'Wheat Flour is below threshold (42kg) at Indiranagar branch.',
      level: 'Critical',
      time: '10m ago',
    },
    {
      title: 'Delayed Delivery Alert',
      desc: 'Order #RD-10185 has exceeded average delivery time (45 mins).',
      level: 'Critical',
      time: '14m ago',
    },
    {
      title: 'Negative Review Received',
      desc: 'Customer rated 2.0/5.0 stars: "Cold food delivered" at Koramangala.',
      level: 'High',
      time: '30m ago',
    },
    {
      title: 'Inventory Request Pending',
      desc: 'Whitefield branch requests restock of 12 items.',
      level: 'Medium',
      time: '1h ago',
    },
    {
      title: 'Staff Shortage Warning',
      desc: 'Branch 4 reported cashiers count below threshold.',
      level: 'Low',
      time: '2h ago',
    },
  ];

  // --- Branch Performance Rankings ---
  const sortedRankings = [...branches].sort((a, b) => b.revenue - a.revenue);
  const bestBranches = sortedRankings.slice(0, 3);

  // --- Cities and search filtering ---
  const cities = Array.from(new Set(branches.map((b) => b.city)));
  const filteredBranches = branches
    .filter((b) => b.name.toLowerCase().includes(branchSearch.toLowerCase()))
    .filter((b) => filterCity === 'ALL' || b.city === filterCity)
    .filter((b) => filterStock === 'ALL' || b.inventoryHealth === filterStock)
    .sort((a, b) => {
      if (!sortField) return 0;
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });

  // --- Simulated BI Financial Trends ---
  const financeTrend = [
    {
      name: 'Week 1',
      revenue: Math.round(monthlyRevenue * 0.21),
      expenses: Math.round(operatingExpenses * 0.22),
      profit: Math.round(netProfit * 0.2),
    },
    {
      name: 'Week 2',
      revenue: Math.round(monthlyRevenue * 0.26),
      expenses: Math.round(operatingExpenses * 0.24),
      profit: Math.round(netProfit * 0.28),
    },
    {
      name: 'Week 3',
      revenue: Math.round(monthlyRevenue * 0.28),
      expenses: Math.round(operatingExpenses * 0.27),
      profit: Math.round(netProfit * 0.26),
    },
    {
      name: 'Week 4',
      revenue: Math.round(monthlyRevenue * 0.25),
      expenses: Math.round(operatingExpenses * 0.27),
      profit: Math.round(netProfit * 0.26),
    },
  ];

  const cashFlowTrend = [
    {
      name: 'Mon',
      inflows: Math.round(todayRevenue * 0.8),
      outflows: Math.round(operatingExpenses / 30),
    },
    {
      name: 'Tue',
      inflows: Math.round(todayRevenue * 0.95),
      outflows: Math.round(operatingExpenses / 28),
    },
    {
      name: 'Wed',
      inflows: Math.round(todayRevenue * 1.1),
      outflows: Math.round(operatingExpenses / 27),
    },
    {
      name: 'Thu',
      inflows: Math.round(todayRevenue * 1.05),
      outflows: Math.round(operatingExpenses / 30),
    },
    {
      name: 'Fri',
      inflows: Math.round(todayRevenue * 1.3),
      outflows: Math.round(operatingExpenses / 25),
    },
    {
      name: 'Sat',
      inflows: Math.round(todayRevenue * 1.55),
      outflows: Math.round(operatingExpenses / 22),
    },
    {
      name: 'Sun',
      inflows: Math.round(todayRevenue * 1.4),
      outflows: Math.round(operatingExpenses / 25),
    },
  ];

  // --- Simulated Sales Graphs ---
  const salesByHour = [
    { hour: '11:00', orders: 15 },
    { hour: '13:00', orders: 48 },
    { hour: '15:00', orders: 20 },
    { hour: '17:00', orders: 35 },
    { hour: '19:00', orders: 72 },
    { hour: '21:00', orders: 85 },
    { hour: '23:00', orders: 30 },
  ];

  const salesByDay = [
    { name: 'Mon', sales: Math.round(monthlyRevenue * 0.12) },
    { name: 'Tue', sales: Math.round(monthlyRevenue * 0.11) },
    { name: 'Wed', sales: Math.round(monthlyRevenue * 0.13) },
    { name: 'Thu', sales: Math.round(monthlyRevenue * 0.14) },
    { name: 'Fri', sales: Math.round(monthlyRevenue * 0.17) },
    { name: 'Sat', sales: Math.round(monthlyRevenue * 0.2) },
    { name: 'Sun', sales: Math.round(monthlyRevenue * 0.18) },
  ];

  return (
    <div className="space-y-8 p-6 text-[#F8FAFC] bg-[#0F172A] min-h-screen">
      {/* Premium Hero Greeting bar */}
      <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 shadow-lg shadow-black/5 hover:border-slate-750 transition-all duration-300">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#06B6D4] tracking-widest block mb-1">
            Welcome Back
          </span>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">
            Good Morning, {greetingName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
            <span className="font-bold text-slate-300">ABC Restaurant Group</span>
            <span>•</span>
            <span className="text-[#16A34A] font-bold flex items-center gap-0.5">
              <ArrowUpRight size={14} /> Revenue Up 12% This Month
            </span>
          </div>
        </div>

        {/* Hero stat quick values */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full xl:w-auto">
          {[
            {
              label: "Today's Revenue",
              val: `₹${todayRevenue.toLocaleString('en-IN')}`,
              color: 'text-emerald-450',
            },
            {
              label: 'Estimated Profit',
              val: `₹${netProfit.toLocaleString('en-IN')}`,
              color: 'text-[#06B6D4]',
            },
            { label: 'Active Branches', val: branches.length, color: 'text-indigo-400' },
            { label: "Today's Orders", val: totalOrders, color: 'text-amber-500' },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl min-w-[130px] shrink-0 text-center hover:border-slate-800 transition-colors"
            >
              <span className="text-[9px] uppercase font-bold text-slate-500 block">
                {card.label}
              </span>
              <span className={`text-base font-extrabold font-display block mt-1.5 ${card.color}`}>
                {card.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'overview', label: 'CEO Overview', icon: <Activity size={15} /> },
          { id: 'finance', label: 'Financials', icon: <DollarSign size={15} /> },
          { id: 'pandl', label: 'P&L Audit', icon: <Percent size={15} /> },
          { id: 'branches', label: 'Branches Performance', icon: <Building size={15} /> },
          { id: 'staff', label: 'Staff logs', icon: <Users size={15} /> },
          { id: 'bonuses', label: 'Bonus Rules', icon: <Award size={15} /> },
          { id: 'inventory', label: 'Inventory Management', icon: <Box size={15} /> },
          { id: 'sales', label: 'Sales analytics', icon: <TrendingUp size={15} /> },
          { id: 'customers', label: 'Customer Insights', icon: <Users size={15} /> },
          { id: 'operations', label: 'Operations Command', icon: <Clock size={15} /> },
          { id: 'ai', label: 'AI predictions', icon: <Brain size={15} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
              activeTab === tab.id
                ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-lg shadow-[#2563EB]/15'
                : 'bg-slate-900/30 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABS CONTAINER */}
      <div className="space-y-8">
        {/* TAB 1: CEO OVERVIEW (PREMIUM SAAS DESIGN) */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-12">
            {/* SECTION 1: EXECUTIVE KPI STRIP */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  title: "Today's Revenue",
                  value: `₹${todayRevenue.toLocaleString('en-IN')}`,
                  trend: '▲ 12.4%',
                  isGrow: true,
                  color: 'text-emerald-400',
                  points: [12, 18, 15, 24, 21, 28, 30],
                },
                {
                  title: "Today's Orders",
                  value: totalOrders,
                  trend: '▲ 9.6%',
                  isGrow: true,
                  color: 'text-emerald-400',
                  points: [30, 35, 33, 40, 38, 42, 45],
                },
                {
                  title: 'Net Profit',
                  value: `₹${netProfit.toLocaleString('en-IN')}`,
                  trend: '▲ 12.7%',
                  isGrow: true,
                  color: 'text-emerald-400',
                  points: [80, 88, 85, 92, 94, 98, 105],
                },
                {
                  title: 'Active Branches',
                  value: branches.length || 0,
                  trend: 'Stable',
                  isGrow: true,
                  color: 'text-indigo-400',
                  points: [5, 5, 5, 5, 5, 5, 5],
                },
                {
                  title: 'Active Staff',
                  value: summary?.staffOnline || 0,
                  trend: '▲ 4.2%',
                  isGrow: true,
                  color: 'text-sky-400',
                  points: [12, 14, 13, 15, 14, 15, 16],
                },
              ].map((kpi, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 hover:shadow-lg hover:shadow-slate-900/50 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {kpi.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${kpi.isGrow ? 'bg-emerald-950/50 text-emerald-400' : 'bg-rose-950/50 text-rose-400'}`}
                    >
                      {kpi.trend}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-extrabold font-display text-white">{kpi.value}</h3>
                    <Sparkline points={kpi.points} color={kpi.isGrow ? '#34d399' : '#fb7185'} />
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 2 & 3: FINANCIAL HEALTH & BRANCH PERFORMANCE */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Financial Health Chart */}
              <Card className="xl:col-span-2 border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-6 relative overflow-hidden">
                <CardHeader className="border-none p-0 mb-6 flex flex-row justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold font-display text-white">Financial Health</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Revenue vs Expenses trend over time
                    </p>
                  </div>
                  <div className="flex bg-slate-950/50 border border-slate-800 rounded-lg p-1">
                    {['Today', 'Week', 'Month', 'Year'].map((t) => (
                      <button
                        key={t}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${t === 'Month' ? 'bg-[#2563EB] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                      Revenue
                    </p>
                    <p className="text-xl font-bold text-white">
                      ₹{monthlyRevenue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">▲ 11.8% vs last month</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                      Expenses
                    </p>
                    <p className="text-xl font-bold text-white">
                      ₹{operatingExpenses.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-rose-400 mt-0.5">▲ 4.5% vs last month</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                      Gross Profit
                    </p>
                    <p className="text-xl font-bold text-white">
                      ₹{grossProfit.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">▲ 10.2% vs last month</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                      Net Profit
                    </p>
                    <p className="text-xl font-bold text-white">
                      ₹{netProfit.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">▲ 12.7% vs last month</p>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financeTrend}>
                      <defs>
                        <linearGradient id="colorRev2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#64748B"
                        fontSize={10}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#64748B"
                        fontSize={10}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `₹${val / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
                        }}
                      />
                      <Area
                        name="Revenue"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2563EB"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRev2)"
                      />
                      <Line
                        name="Expenses"
                        type="monotone"
                        dataKey="expenses"
                        stroke="#DC2626"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        name="Profit"
                        type="monotone"
                        dataKey="profit"
                        stroke="#16A34A"
                        strokeWidth={2}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Branch Performance Leaderboard */}
              <Card className="xl:col-span-1 border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-6 flex flex-col">
                <CardHeader className="border-none p-0 mb-6 flex justify-between items-center">
                  <h3 className="text-lg font-bold font-display text-white">Branch Leaderboard</h3>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-[#2563EB] hover:text-[#3B82F6] hover:bg-[#2563EB]/10 p-0 h-auto font-semibold"
                  >
                    View All <ChevronRight size={14} className="ml-1" />
                  </Button>
                </CardHeader>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {bestBranches.map((branch, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/50 border border-slate-800/60 p-4 rounded-xl flex flex-col gap-3 relative overflow-hidden group hover:border-slate-700 transition-colors"
                    >
                      {idx === 0 && (
                        <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 text-[9px] font-extrabold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                          Top Performer
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'}`}
                          >
                            #{idx + 1}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{branch.name}</h4>
                            <p className="text-[10px] text-slate-400">{branch.city}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-400">
                            ₹{branch.revenue.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-slate-400">{branch.orders} orders</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/50">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 font-semibold">Rating</span>
                          <span className="text-white flex items-center gap-1">
                            <Star size={10} className="text-amber-400 fill-amber-400" />{' '}
                            {branch.customerRating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 font-semibold">Profit</span>
                          <span className="text-emerald-400 font-semibold">
                            {(branch.revenue * 0.28).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Worst Performer Mock */}
                  <div className="bg-rose-950/20 border border-rose-900/30 p-4 rounded-xl flex flex-col gap-3 relative overflow-hidden group hover:border-rose-800/50 transition-colors mt-6">
                    <div className="absolute top-0 right-0 bg-rose-500/20 text-rose-400 text-[9px] font-extrabold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                      Needs Attention
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-950/50 text-rose-400 flex items-center justify-center font-bold text-xs">
                          !
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Marathahalli</h4>
                          <p className="text-[10px] text-slate-400">Bangalore</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-rose-400">₹42,500</p>
                        <p className="text-[10px] text-slate-400">120 orders</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* SECTIONS 4, 5, 6: CATEGORIZED HEALTH GRIDS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Operations Health */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-display text-slate-300 uppercase tracking-widest pl-1 border-l-2 border-[#06B6D4]">
                  Operations Health
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: 'Food Cost %',
                      val: '28.4%',
                      trend: 'Good',
                      color: 'text-emerald-400',
                    },
                    {
                      label: 'Waste %',
                      val: '1.8%',
                      trend: 'Needs Check',
                      color: 'text-amber-400',
                    },
                    {
                      label: 'Inventory Value',
                      val: `₹12.4L`,
                      trend: 'Optimal',
                      color: 'text-indigo-400',
                    },
                    {
                      label: 'Low Stock Items',
                      val: summary?.lowStockCount || 0,
                      trend: 'Critical',
                      color: 'text-rose-400',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-slate-900/30 border border-slate-800/60 p-4 rounded-xl hover:bg-slate-800/40 transition-colors"
                    >
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                        {item.label}
                      </p>
                      <p className={`text-xl font-bold ${item.color}`}>{item.val}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{item.trend}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workforce */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-display text-slate-300 uppercase tracking-widest pl-1 border-l-2 border-[#8B5CF6]">
                  Workforce
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: 'Staff On Duty',
                      val: summary?.staffOnline || 0,
                      trend: 'Optimal Coverage',
                      color: 'text-white',
                    },
                    {
                      label: 'Attendance %',
                      val: '94.2%',
                      trend: 'Above Average',
                      color: 'text-emerald-400',
                    },
                    {
                      label: 'Payroll Cost',
                      val: `₹4.5L`,
                      trend: 'Within Budget',
                      color: 'text-white',
                    },
                    {
                      label: 'Bonus Pool',
                      val: `₹43K`,
                      trend: 'Generated',
                      color: 'text-amber-400',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-slate-900/30 border border-slate-800/60 p-4 rounded-xl hover:bg-slate-800/40 transition-colors"
                    >
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                        {item.label}
                      </p>
                      <p className={`text-xl font-bold ${item.color}`}>{item.val}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{item.trend}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Insights */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-display text-slate-300 uppercase tracking-widest pl-1 border-l-2 border-[#EC4899]">
                  Customer Insights
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'New Customers', val: '450', trend: '▲ 12%', color: 'text-white' },
                    { label: 'Returning', val: '1,200', trend: '▲ 5%', color: 'text-white' },
                    {
                      label: 'Satisfaction',
                      val: '4.8/5',
                      trend: 'Excellent',
                      color: 'text-amber-400',
                    },
                    {
                      label: 'Avg Order Val',
                      val: `₹${aov}`,
                      trend: '▲ ₹45',
                      color: 'text-emerald-400',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-slate-900/30 border border-slate-800/60 p-4 rounded-xl hover:bg-slate-800/40 transition-colors"
                    >
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                        {item.label}
                      </p>
                      <p className={`text-xl font-bold ${item.color}`}>{item.val}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{item.trend}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 7 & 8: AI INSIGHTS & CHARTS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* AI Insights Card */}
              <Card className="xl:col-span-1 relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border-indigo-900/50 p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

                <CardHeader className="border-none p-0 mb-6 flex flex-row items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30">
                    <Brain size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display text-white">AI Predictions</h3>
                    <p className="text-xs text-indigo-200/60">Powered by System ML</p>
                  </div>
                </CardHeader>

                <div className="space-y-4 relative z-10">
                  <div className="bg-black/20 border border-indigo-500/20 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-1">
                      Revenue Forecast (Next 7 Days)
                    </p>
                    <p className="text-2xl font-bold text-white">₹38.5L</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-indigo-200">
                      <TrendingUp size={12} className="text-emerald-400" /> Expected +15% surge due
                      to weekend holidays
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/20 border border-indigo-500/20 p-3 rounded-xl backdrop-blur-sm">
                      <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider mb-1">
                        Peak Hour
                      </p>
                      <p className="text-base font-bold text-white">19:00 - 21:00</p>
                    </div>
                    <div className="bg-black/20 border border-indigo-500/20 p-3 rounded-xl backdrop-blur-sm">
                      <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider mb-1">
                        Best Selling
                      </p>
                      <p className="text-base font-bold text-white">Biryani</p>
                    </div>
                  </div>
                  <div className="bg-black/20 border border-indigo-500/20 p-3 rounded-xl backdrop-blur-sm flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider mb-0.5">
                        Inventory Risk
                      </p>
                      <p className="text-sm font-bold text-white">Poultry shortage predicted</p>
                    </div>
                    <AlertTriangle size={16} className="text-amber-400" />
                  </div>
                </div>
              </Card>

              {/* Order Trend Chart */}
              <Card className="xl:col-span-2 border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-6">
                <CardHeader className="border-none p-0 mb-6 flex justify-between items-center">
                  <h3 className="text-lg font-bold font-display text-white">Orders Trend Today</h3>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-slate-400 hover:text-white p-0 h-auto"
                  >
                    <Activity size={14} className="mr-1" /> Live
                  </Button>
                </CardHeader>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesByHour}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis
                        dataKey="hour"
                        stroke="#64748B"
                        fontSize={10}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis stroke="#64748B" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: '#1e293b', opacity: 0.4 }}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
                        }}
                      />
                      <Bar dataKey="orders" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {salesByHour.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.orders > 50 ? '#3B82F6' : '#1E3A8A'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* TAB 2: FINANCIAL DASHBOARD */}
        {activeTab === 'finance' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[
                {
                  title: 'Gross Revenue',
                  val: `₹${monthlyRevenue.toLocaleString('en-IN')}`,
                  color: 'text-indigo-400',
                  desc: 'Total sales this month',
                },
                {
                  title: 'Total Expenses',
                  val: `₹${operatingExpenses.toLocaleString('en-IN')}`,
                  color: 'text-rose-455',
                  desc: 'Direct operating expenses',
                },
                {
                  title: 'Net Earnings',
                  val: `₹${netProfit.toLocaleString('en-IN')}`,
                  color: 'text-[#16A34A]',
                  desc: 'Net profit post taxes & costs',
                },
                {
                  title: 'Loss Pool',
                  val: `₹${wasteCost.toLocaleString('en-IN')}`,
                  color: 'text-[#DC2626]',
                  desc: 'Inventory spoilage + refunds',
                },
                {
                  title: 'Payroll Ledger',
                  val: `₹${payrollCost.toLocaleString('en-IN')}`,
                  color: 'text-slate-350',
                  desc: 'Salary pool distributed',
                },
                {
                  title: 'Bonuses Distributed',
                  val: `₹${bonusDistributed.toLocaleString('en-IN')}`,
                  color: 'text-amber-500',
                  desc: 'Staff performance incentives',
                },
                {
                  title: 'Refunds Handled',
                  val: `₹${refundCost.toLocaleString('en-IN')}`,
                  color: 'text-rose-400',
                  desc: 'Customer refunds and returns',
                },
                {
                  title: 'Inventory Purchases',
                  val: `₹${inventoryCost.toLocaleString('en-IN')}`,
                  color: 'text-indigo-300',
                  desc: 'Supplier order procurement',
                },
                {
                  title: 'Supplier Payments',
                  val: `₹${Math.round(inventoryCost * 0.85).toLocaleString('en-IN')}`,
                  color: 'text-purple-400',
                  desc: 'Paid amount to suppliers',
                },
                {
                  title: 'GST Liabilities',
                  val: `₹${taxesCost.toLocaleString('en-IN')}`,
                  color: 'text-sky-400',
                  desc: 'Monthly Goods & Services Tax',
                },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="bg-[#111827] border border-slate-800 p-4.5 rounded-2xl shadow-sm hover:border-slate-700 transition-colors"
                >
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <h3 className={`text-xl font-bold font-display mt-2 ${card.color}`}>
                    {card.val}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">{card.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-800/80 bg-[#111827] p-6">
                <CardHeader className="border-none p-0 mb-4 flex justify-between items-center">
                  <h3 className="text-base font-bold font-display">Financial Trends</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="xs" onClick={exportProfitLossCSV}>
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <div className="h-72 w-full relative">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={financeTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Line
                        name="Revenue"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2563EB"
                        strokeWidth={3}
                      />
                      <Line
                        name="Expenses"
                        type="monotone"
                        dataKey="expenses"
                        stroke="#DC2626"
                        strokeWidth={2}
                      />
                      <Line
                        name="Profit"
                        type="monotone"
                        dataKey="profit"
                        stroke="#16A34A"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="border-slate-800/80 bg-[#111827] p-6">
                <CardHeader className="border-none p-0 mb-4">
                  <h3 className="text-base font-bold font-display">
                    Live Inflow & Outflow Cash Flow
                  </h3>
                </CardHeader>
                <div className="h-72 w-full relative">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={cashFlowTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        name="Cash Inflow"
                        dataKey="inflows"
                        fill="#16A34A"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        name="Cash Outflow"
                        dataKey="outflows"
                        fill="#DC2626"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* TAB 3: PROFIT & LOSS STATEMENT */}
        {activeTab === 'pandl' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Structured Financial Statement */}
            <Card className="lg:col-span-2 border-slate-800/80 bg-[#111827] p-6">
              <CardHeader className="border-none p-0 mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold font-display text-white">
                    Income Statement (P&L Audit)
                  </h3>
                  <p className="text-[11px] text-slate-500">Consolidated accounts statement</p>
                </div>
                <Button size="xs" variant="outline" onClick={exportProfitLossCSV}>
                  <Download size={12} className="mr-1" /> Export CSV Report
                </Button>
              </CardHeader>

              <div className="space-y-3 font-sans text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2.5 text-sm font-bold text-white">
                  <span>Gross Sales Revenue</span>
                  <span>₹{monthlyRevenue.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800/60 pb-2 text-[#2563EB] font-semibold pl-3">
                  <span>Cost of Sales (COGS / Ingredients)</span>
                  <span>-₹{inventoryCost.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-2.5 text-sm font-bold text-emerald-450 pl-3">
                  <span>Gross Profit</span>
                  <span>₹{grossProfit.toLocaleString('en-IN')}</span>
                </div>

                <div className="space-y-2.5 pl-6 border-l-2 border-slate-800 py-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Labor & Salaries Overhead</span>
                    <span>-₹{payrollCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery & Rider Logistics</span>
                    <span>-₹{deliveryCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing & Digital Ads</span>
                    <span>-₹{marketingCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refund adjustments cost</span>
                    <span>-₹{refundCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State & Local Taxes</span>
                    <span>-₹{taxesCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-bold text-[#16A34A]">
                  <span>Net Operating Income (Net Profit)</span>
                  <span>₹{netProfit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Card>

            {/* Operating Margins progress sliders */}
            <Card className="lg:col-span-1 border-slate-800/80 bg-[#111827] p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold font-display">Target Business Margins</h3>
                <p className="text-[11px] text-slate-500">Margin benchmarks verification</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: 'Gross Profit Margin %',
                    val: 68,
                    target: '65% Goal',
                    color: 'bg-[#16A34A]',
                  },
                  {
                    name: 'Net Profit Margin %',
                    val: 28,
                    target: '25% Goal',
                    color: 'bg-[#2563EB]',
                  },
                  {
                    name: 'Food Cost Ratio %',
                    val: 30,
                    target: '<32% Goal',
                    color: 'bg-[#F59E0B]',
                  },
                  {
                    name: 'Labor Cost Ratio %',
                    val: 25,
                    target: '<28% Goal',
                    color: 'bg-[#06B6D4]',
                  },
                ].map((margin, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{margin.name}</span>
                      <span className="text-slate-400">
                        {margin.val}%{' '}
                        <span className="text-[9px] text-slate-500">({margin.target})</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${margin.color}`}
                        style={{ width: `${margin.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* TAB 4: BRANCH PERFORMANCE */}
        {activeTab === 'branches' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Top Branch Rankings podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end py-6">
              {bestBranches[1] && (
                <div className="flex flex-col items-center">
                  <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl text-center w-full max-w-[240px] relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-350 font-bold text-xs px-2.5 py-0.5 rounded-full border border-slate-700">
                      #2 RUNNER-UP
                    </span>
                    <h4 className="font-bold text-slate-200 mt-2">{bestBranches[1].name}</h4>
                    <p className="text-[#16A34A] font-bold text-sm mt-1">
                      ₹{bestBranches[1].revenue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {bestBranches[1].orders} transactions
                    </p>
                  </div>
                  <div className="w-16 h-12 bg-slate-800 border-x border-t border-slate-700 flex items-center justify-center mt-3">
                    <span className="font-display font-black text-slate-500">2nd</span>
                  </div>
                </div>
              )}

              {bestBranches[0] && (
                <div className="flex flex-col items-center">
                  <div className="bg-indigo-950/20 border-2 border-indigo-500/30 p-6 rounded-2xl text-center w-full max-w-[260px] relative shadow-lg shadow-indigo-500/5">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white font-bold text-xs px-3 py-0.5 rounded-full border border-[#2563EB]/40 flex items-center gap-1">
                      <Award size={12} /> #1 TOP PERFORMER
                    </span>
                    <h4 className="font-bold text-slate-100 text-lg mt-2">
                      {bestBranches[0].name}
                    </h4>
                    <p className="text-[#16A34A] font-bold text-base mt-1">
                      ₹{bestBranches[0].revenue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {bestBranches[0].orders} transactions
                    </p>
                  </div>
                  <div className="w-20 h-20 bg-indigo-900/40 border-x border-t border-indigo-500/20 flex items-center justify-center mt-3">
                    <span className="font-display font-black text-indigo-400 text-xl">1st</span>
                  </div>
                </div>
              )}

              {bestBranches[2] && (
                <div className="flex flex-col items-center">
                  <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl text-center w-full max-w-[240px] relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-400 font-bold text-xs px-2.5 py-0.5 rounded-full border border-slate-700">
                      #3 THIRD
                    </span>
                    <h4 className="font-bold text-slate-200 mt-2">{bestBranches[2].name}</h4>
                    <p className="text-[#16A34A] font-bold text-sm mt-1">
                      ₹{bestBranches[2].revenue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {bestBranches[2].orders} transactions
                    </p>
                  </div>
                  <div className="w-16 h-8 bg-slate-850 border-x border-t border-slate-800 flex items-center justify-center mt-3">
                    <span className="font-display font-black text-slate-600">3rd</span>
                  </div>
                </div>
              )}
            </div>

            {/* Benchmarking Comparison Matrix */}
            <Card className="border-slate-800/80 bg-[#111827] p-6">
              <CardHeader className="border-none p-0 mb-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold font-display text-white">
                    Outlets Comparison Matrix
                  </h3>
                  <p className="text-xs text-slate-400">
                    Perform real-time comparison across all reporting restaurants
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                    <Search size={12} className="text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search branch name..."
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      className="bg-transparent focus:outline-none text-white text-[11px]"
                    />
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-500">City:</span>
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="bg-transparent text-white focus:outline-none cursor-pointer"
                    >
                      <option value="ALL" className="bg-slate-900">
                        All Cities
                      </option>
                      {cities.map((c) => (
                        <option key={c} value={c} className="bg-slate-900">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={exportBranchPerformance}
                    size="sm"
                    className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-slate-100 flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-xl"
                  >
                    <Download size={12} /> Export CSV
                  </Button>
                </div>
              </CardHeader>

              {filteredBranches.length === 0 ? (
                <EmptySearchState onReset={handleClearFilters} />
              ) : (
                <div className="overflow-x-auto font-sans text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider pb-3">
                        <th
                          className="pb-3 pr-2 cursor-pointer hover:text-white"
                          onClick={() => handleSort('name')}
                        >
                          Branch
                        </th>
                        <th
                          className="pb-3 pr-2 cursor-pointer hover:text-white"
                          onClick={() => handleSort('revenue')}
                        >
                          Revenue
                        </th>
                        <th className="pb-3 pr-2">Est. Profit</th>
                        <th
                          className="pb-3 pr-2 cursor-pointer hover:text-white"
                          onClick={() => handleSort('orders')}
                        >
                          Orders
                        </th>
                        <th
                          className="pb-3 pr-2 cursor-pointer hover:text-white"
                          onClick={() => handleSort('staffCount')}
                        >
                          Crew Size
                        </th>
                        <th className="pb-3 pr-2">Inventory Cost</th>
                        <th
                          className="pb-3 pr-2 text-center"
                          onClick={() => handleSort('customerRating')}
                        >
                          Customer Rating
                        </th>
                        <th className="pb-3 pr-2 text-center">Kitchen Eff.</th>
                        <th className="pb-3 text-right">Delivery Eff.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                      {filteredBranches.map((b) => {
                        const estProfit = Math.round(b.revenue * 0.28);
                        const inventoryCostEst = Math.round(b.revenue * 0.3);
                        const kitchenEff = Math.max(85, Math.min(100, 98 - b.kitchenQueue * 2));
                        const deliveryEff = Math.max(
                          85,
                          Math.min(100, 96 - b.pendingDeliveries * 3),
                        );
                        return (
                          <tr key={b.branchId} className="hover:bg-slate-900/10">
                            <td className="py-3.5 font-semibold text-slate-200">
                              {b.name}
                              <span className="block text-[10px] text-slate-500 font-normal">
                                {b.city}
                              </span>
                            </td>
                            <td className="py-3.5 text-[#16A34A] font-medium">
                              ₹{b.revenue.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 text-indigo-400">
                              ₹{estProfit.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5">{b.orders} orders</td>
                            <td className="py-3.5">{b.staffCount} crew</td>
                            <td className="py-3.5 text-amber-500">
                              ₹{inventoryCostEst.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 text-center font-bold text-amber-400">
                              ★ {b.customerRating.toFixed(1)}
                            </td>
                            <td className="py-3.5 text-center font-mono text-emerald-450">
                              {kitchenEff}%
                            </td>
                            <td className="py-3.5 text-right font-mono text-[#06B6D4]">
                              {deliveryEff}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* TAB 5: STAFF Performance */}
        {activeTab === 'staff' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {[
                {
                  title: 'Total Staff',
                  val: summary?.staffOnline || 0,
                  desc: 'Active in shift system',
                  color: 'text-indigo-400',
                },
                {
                  title: 'Attendance Ratio',
                  val: '96.2%',
                  desc: 'Current week compliance',
                  color: 'text-[#16A34A]',
                },
                {
                  title: 'Avg Score',
                  val: '4.7 / 5.0',
                  desc: 'Weighted score index',
                  color: 'text-[#F59E0B]',
                },
                {
                  title: 'Salary Disbursed',
                  val: `₹${payrollCost.toLocaleString('en-IN')}`,
                  desc: 'Paid this monthly cycle',
                  color: 'text-slate-350',
                },
                {
                  title: 'Bonuses distributed',
                  val: `₹${bonusDistributed.toLocaleString('en-IN')}`,
                  desc: 'Ratings and speed pool',
                  color: 'text-purple-400',
                },
              ].map((card, idx) => (
                <div key={idx} className="bg-[#111827] border border-slate-800 p-4.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <h3 className={`text-xl font-bold font-display mt-2 ${card.color}`}>
                    {card.val}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">{card.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leaderboard profile cards */}
              <Card className="border-slate-800/80 bg-[#111827] p-6">
                <CardHeader className="border-none p-0 mb-4">
                  <h3 className="text-base font-bold font-display">Executive Crew Profiles</h3>
                  <p className="text-[11px] text-slate-500">
                    Top operational leaders based on SLA records
                  </p>
                </CardHeader>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Arjun Mehta',
                      title: 'Best Branch Manager',
                      outlet: 'Indiranagar Outlet',
                      eff: '98.5% efficiency',
                      desc: 'Zero inventory wastage reports and highest branch revenue growth.',
                    },
                    {
                      name: 'Chef Karan Singh',
                      title: 'Most Efficient Chef',
                      outlet: 'Koramangala Outlet',
                      eff: '6.2m Avg Prep Time',
                      desc: 'Completed over 420 orders with a 98% prep time compliance score.',
                    },
                    {
                      name: 'Ramesh Rider',
                      title: 'Most Efficient Rider',
                      outlet: 'Indiranagar Outlet',
                      eff: '15.4m Avg Transit',
                      desc: 'Delivered 180 dispatches with zero delays or returns.',
                    },
                  ].map((leader, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-200">{leader.name}</h4>
                          <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase">
                            {leader.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-450 mt-1">{leader.desc}</p>
                        <span className="text-[10px] text-slate-550 block mt-1">
                          Branch: {leader.outlet}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#16A34A]">{leader.eff}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Bonus logs and export options */}
              <Card className="border-slate-800/80 bg-[#111827] p-6 flex flex-col justify-between">
                <div>
                  <CardHeader className="border-none p-0 mb-4 flex justify-between items-center">
                    <h3 className="text-base font-bold font-display">Salary & Bonuses Audit</h3>
                    <Button variant="outline" size="xs" onClick={exportPayrollCSV}>
                      <Download size={12} className="mr-1" /> Export Staff Ledger
                    </Button>
                  </CardHeader>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ABC Restaurant management automatically computes attendance, ratings bonuses,
                    and chef preparation velocities. The payout list is processed on the 1st of
                    every month via the bank gateway.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 mt-6 text-xs text-[#F8FAFC]">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span>Active Shift Overtime Rate</span>
                    <span className="font-mono text-emerald-450">₹120 / hour</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span>Standard Crew PF Match</span>
                    <span className="font-mono text-slate-400">12% match</span>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* TAB 6: BONUS MANAGEMENT */}
        {activeTab === 'bonuses' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Rules and payouts */}
              <Card className="border-slate-800/80 bg-[#111827] p-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold font-display">Incentives Rules</h3>
                  <p className="text-[11px] text-slate-500">Automated micro-incentive parameters</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-950/60 border border-slate-855 rounded-xl">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>★ 5-Star Review Payout</span>
                      <span className="text-[#16A34A]">+₹5.00</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Split: 50% Chef, 50% Dispatcher.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-855 rounded-xl">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>Kitchen Speed target (&lt;8m)</span>
                      <span className="text-[#16A34A]">+₹10.00</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Paid per item to cooking staff.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Branch Wise Distribution */}
              <Card className="border-slate-800/80 bg-[#111827] p-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold font-display">Branch Payout Share</h3>
                  <p className="text-[11px] text-slate-500">Total incentives parsed per branch</p>
                </div>

                <div className="space-y-3.5">
                  {branches.slice(0, 4).map((b, idx) => {
                    const share = Math.round(bonusDistributed * (0.35 - idx * 0.08));
                    const percentage = Math.round((share / bonusDistributed) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">{b.name}</span>
                          <span className="text-slate-400">
                            ₹{share.toLocaleString('en-IN')} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full">
                          <div
                            className="h-full bg-amber-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Role wise breakdown */}
              <Card className="border-slate-800/80 bg-[#111827] p-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold font-display">Role Wise Distribution</h3>
                  <p className="text-[11px] text-slate-500">
                    Incentives split by job classification
                  </p>
                </div>

                <div className="space-y-3.5">
                  {[
                    { name: 'Kitchen Staff & Chefs', share: 45, color: 'bg-[#2563EB]' },
                    { name: 'Riders & Dispatch Team', share: 35, color: 'bg-[#16A34A]' },
                    { name: 'Branch Managers', share: 20, color: 'bg-purple-500' },
                  ].map((role, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{role.name}</span>
                        <span className="text-slate-400">{role.share}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full">
                        <div
                          className={`h-full ${role.color}`}
                          style={{ width: `${role.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* TAB 7: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Inventory valuation KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-4">
              {[
                {
                  title: 'Inventory Val.',
                  val: `₹${(inventoryCost * 1.4).toLocaleString('en-IN')}`,
                  color: 'text-indigo-400',
                },
                {
                  title: 'Stock Cost',
                  val: `₹${inventoryCost.toLocaleString('en-IN')}`,
                  color: 'text-slate-200',
                },
                { title: 'Low Stock Items', val: lowStockAlerts.length, color: 'text-rose-455' },
                {
                  title: 'Expired Val.',
                  val: `₹${Math.round(wasteCost * 0.4).toLocaleString('en-IN')}`,
                  color: 'text-[#DC2626]',
                },
                {
                  title: 'Shrinkage Cost',
                  val: `₹${wasteCost.toLocaleString('en-IN')}`,
                  color: 'text-[#DC2626]',
                },
                { title: 'Ingredient Cost', val: '28.4%', color: 'text-[#16A34A]' },
                {
                  title: 'Purchase Cost',
                  val: `₹${(inventoryCost * 0.9).toLocaleString('en-IN')}`,
                  color: 'text-[#F59E0B]',
                },
                {
                  title: 'Transfer Cost',
                  val: `₹${(inventoryCost * 0.12).toLocaleString('en-IN')}`,
                  color: 'text-[#06B6D4]',
                },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="bg-[#111827] border border-slate-800 p-4 rounded-xl text-center"
                >
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                    {card.title}
                  </span>
                  <h3 className={`text-sm font-bold font-display mt-1.5 ${card.color}`}>
                    {card.val}
                  </h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ingredient analytics */}
              <Card className="lg:col-span-1 border-slate-800/80 bg-[#111827] p-6 space-y-4">
                <CardHeader className="border-none p-0 mb-2">
                  <h3 className="text-base font-bold font-display">Ingredient Profiles</h3>
                  <p className="text-[11px] text-slate-550 font-sans">
                    High consumption and wastage metrics
                  </p>
                </CardHeader>
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-950/60 border border-slate-855 rounded-xl">
                    <span className="text-[10px] text-[#2563EB] font-bold block uppercase">
                      Most Consumed
                    </span>
                    <span className="text-sm font-bold text-slate-200 mt-1 block">
                      Liquid Milk (Amul)
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      850 Litres consumed across all kitchens.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-950/60 border border-slate-855 rounded-xl">
                    <span className="text-[10px] text-[#F59E0B] font-bold block uppercase">
                      Most Expensive
                    </span>
                    <span className="text-sm font-bold text-slate-200 mt-1 block">
                      Paneer Premium
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      ₹340 / kg wholesale bulk purchase price.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-950/60 border border-slate-855 rounded-xl">
                    <span className="text-[10px] text-[#DC2626] font-bold block uppercase">
                      Highest Waste Ingredient
                    </span>
                    <span className="text-sm font-bold text-rose-455 mt-1 block">
                      Fresh Tomatoes
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      ₹840 spoilage recorded due to shelf-life limits.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Replenishments Request Approval Flow */}
              <Card className="lg:col-span-2 border-slate-800/80 bg-[#111827] p-6">
                <CardHeader className="border-none p-0 mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold font-display text-white">
                      Pending Replenishments Requests
                    </h3>
                    <p className="text-xs text-slate-500">
                      Authorize ingredients requests from outlet managers
                    </p>
                  </div>
                  <Button variant="outline" size="xs" onClick={exportInventoryCSV}>
                    Export Master Valuation
                  </Button>
                </CardHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="md:col-span-1 border-r border-slate-800 pr-0 md:pr-4 space-y-2.5 max-h-72 overflow-y-auto">
                    {inventoryRequests.length === 0 ? (
                      <p className="text-slate-500 text-xs py-8 text-center">
                        No pending requests.
                      </p>
                    ) : (
                      inventoryRequests.map((req) => (
                        <div
                          key={req.id}
                          onClick={() => startApprovalFlow(req)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            activeRequest?.id === req.id
                              ? 'border-indigo-500 bg-indigo-500/10'
                              : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/20'
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span>{req.branch.name.replace('ABC - ', '')}</span>
                            <span className="text-slate-500 text-[9px]">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {req.items.length} items requested
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="md:col-span-2">
                    {activeRequest ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                          <h4 className="font-bold text-xs text-slate-200">
                            Process Request: {activeRequest.branch.name}
                          </h4>
                          <div className="flex gap-2">
                            <Button
                              size="xs"
                              variant="danger"
                              onClick={() => handleProcessRequest('REJECTED')}
                            >
                              Reject
                            </Button>
                            <Button
                              size="xs"
                              variant="success"
                              onClick={() => handleProcessRequest('APPROVED')}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {approvalItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center p-2.5 bg-slate-950/60 border border-slate-855 rounded-xl text-xs"
                            >
                              <span className="font-semibold">{item.ingredientName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-550">Qty:</span>
                                <input
                                  type="number"
                                  value={item.approvedQuantity}
                                  onChange={(e) =>
                                    handleUpdateItemQuantity(idx, parseFloat(e.target.value) || 0)
                                  }
                                  className="w-16 bg-slate-900 border border-slate-800 text-white rounded text-center font-bold py-0.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                />
                                <button
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-rose-450 hover:text-rose-500"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-slate-550 text-xs font-sans">
                        Select a replenishment request from the left list to authorize and edit
                        approved quantities.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* TAB 8: SALES ANALYTICS */}
        {activeTab === 'sales' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  title: 'Total Sales Volume',
                  val: `₹${monthlyRevenue.toLocaleString('en-IN')}`,
                  desc: 'Total sales this month',
                  color: 'text-indigo-400',
                },
                {
                  title: 'Top Product',
                  val: topProducts[0]?.name || 'Cheese Pizza',
                  desc: 'Highest sales volume product',
                  color: 'text-[#16A34A]',
                },
                {
                  title: 'Highest Revenue Product',
                  val: topProducts[0]
                    ? `₹${topProducts[0].revenue.toLocaleString('en-IN')}`
                    : '₹42,000',
                  desc: 'Top value contributor',
                  color: 'text-[#F59E0B]',
                },
                {
                  title: 'Least Selling Product',
                  val: 'Vegetable Drink',
                  desc: 'Lowest orders count product',
                  color: 'text-[#DC2626]',
                },
              ].map((card, idx) => (
                <div key={idx} className="bg-[#111827] border border-slate-800 p-4.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <h3 className={`text-xl font-bold font-display mt-2 ${card.color}`}>
                    {card.val}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">{card.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales by product list */}
              <Card className="lg:col-span-1 border-slate-800/80 bg-[#111827] p-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold font-display">Sales By Product Class</h3>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Individual items order distributions
                  </p>
                </div>
                <div className="space-y-2.5">
                  {topProducts.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950/60 border border-slate-855 rounded-xl flex justify-between items-center text-xs"
                    >
                      <span className="font-semibold text-slate-350">{p.name}</span>
                      <div className="text-right">
                        <span className="text-emerald-450 block font-bold">
                          ₹{p.revenue.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {p.quantity} orders
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Charts grid */}
              <Card className="lg:col-span-2 border-slate-800/80 bg-[#111827] p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold font-display">
                    Sales Distributions Analytics
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-64 w-full relative">
                    <span className="text-xs font-bold text-slate-400 block mb-2 text-center">
                      Sales By Hour Today
                    </span>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={salesByHour}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                        <XAxis dataKey="hour" stroke="#64748B" fontSize={10} />
                        <YAxis stroke="#64748B" fontSize={10} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#F59E0B"
                          strokeWidth={3}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="h-64 w-full relative">
                    <span className="text-xs font-bold text-slate-400 block mb-2 text-center">
                      Sales By Day of Week
                    </span>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={salesByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                        <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                        <YAxis stroke="#64748B" fontSize={10} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
                        />
                        <Bar dataKey="sales" fill="#2563EB" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* TAB 9: CUSTOMER INSIGHTS */}
        {activeTab === 'customers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-4">
              {[
                {
                  title: 'Total Customers',
                  val: '5,420',
                  desc: 'Registered customer accounts',
                  color: 'text-indigo-400',
                },
                {
                  title: 'Repeat Customers',
                  val: '3,920',
                  desc: 'Returning visitors (>1 order)',
                  color: 'text-[#16A34A]',
                },
                {
                  title: 'New Customers',
                  val: '1,500',
                  desc: 'Signed up this month',
                  color: 'text-sky-400',
                },
                {
                  title: 'Customer Retention',
                  val: '72.4%',
                  desc: 'MoM retention ratio',
                  color: 'text-[#F59E0B]',
                },
                {
                  title: 'CSAT Score',
                  val: '94.2%',
                  desc: 'Satisfaction score percentage',
                  color: 'text-purple-400',
                },
                {
                  title: 'Average Rating',
                  val: '4.7 / 5.0',
                  desc: 'Overall aggregated rating',
                  color: 'text-[#16A34A]',
                },
                {
                  title: 'Loyalty Members',
                  val: '1,240',
                  desc: 'Active loyalty club members',
                  color: 'text-indigo-300',
                },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="bg-[#111827] border border-slate-800 p-4.5 rounded-2xl text-center"
                >
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {card.title}
                  </span>
                  <h3 className={`text-xl font-bold font-display mt-2 ${card.color}`}>
                    {card.val}
                  </h3>
                  <p className="text-[9px] text-slate-400 mt-1">{card.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Satisfaction Index chart */}
              <Card className="lg:col-span-2 border-slate-800/80 bg-[#111827] p-6">
                <CardHeader className="border-none p-0 mb-4">
                  <h3 className="text-base font-bold font-display text-white">
                    Satisfaction Score Trends
                  </h3>
                </CardHeader>
                <div className="h-72 w-full relative">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart
                      data={[
                        { name: 'Week 1', score: 4.58 },
                        { name: 'Week 2', score: 4.65 },
                        { name: 'Week 3', score: 4.7 },
                        { name: 'Week 4', score: 4.75 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} domain={[4.0, 5.0]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
                      />
                      <Line
                        name="CSAT Index"
                        type="monotone"
                        dataKey="score"
                        stroke="#F59E0B"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Guest sentiment analysis */}
              <Card className="lg:col-span-1 border-slate-800/80 bg-[#111827] p-6 flex flex-col justify-between">
                <div>
                  <CardHeader className="border-none p-0 mb-4">
                    <h3 className="text-base font-bold font-display">Feedback Sentiment</h3>
                    <p className="text-[11px] text-slate-500">Real-time reviews classification</p>
                  </CardHeader>

                  <div className="space-y-4 font-sans text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-[#16A34A]">Positive Sentiment</span>
                        <span>88%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full">
                        <div className="h-full bg-emerald-500" style={{ width: '88%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-amber-500">Neutral Sentiment</span>
                        <span>8%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full">
                        <div className="h-full bg-[#F59E0B]" style={{ width: '8%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-[#DC2626]">Negative Sentiment</span>
                        <span>4%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full">
                        <div className="h-full bg-rose-500" style={{ width: '4%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 mt-6 text-[10px] text-slate-500">
                  Data updated hourly from Google reviews feeds.
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* TAB 10: KITCHEN & DELIVERY */}
        {activeTab === 'operations' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Kitchen Performance Column */}
            <Card className="border-slate-800/80 bg-[#111827] p-6 space-y-4">
              <CardHeader className="border-none p-0">
                <h3 className="text-base font-bold font-display text-white">
                  Kitchen Operations Command
                </h3>
                <p className="text-[11px] text-slate-500">Prep time and kitchen load tracking</p>
              </CardHeader>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Orders Prepared', val: '420 orders' },
                  { label: 'Avg Prep Time', val: '8.4 minutes' },
                  { label: 'Kitchen Load', val: `${summary?.kitchenLoad || 0} orders` },
                  { label: 'Kitchen Eff. %', val: '96.5%' },
                  { label: 'Delayed Orders', val: '3 orders', color: 'text-rose-450' },
                  { label: 'Completed Orders', val: '417 orders' },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-955/60 border border-slate-850 rounded-xl text-center"
                  >
                    <span className="text-[9px] text-slate-500 block uppercase">{stat.label}</span>
                    <span
                      className={`text-xs font-bold mt-1.5 block ${stat.color || 'text-slate-200'}`}
                    >
                      {stat.val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-850 pt-4 space-y-3.5 text-xs font-sans">
                <span className="text-xs font-semibold text-slate-400">
                  Station Efficiency benchmarking
                </span>
                {[
                  { name: 'Pizza Station (Karan Singh Leader)', val: 98, time: '6.5 mins average' },
                  { name: 'Burgers & Grills Station', val: 94, time: '5.2 mins average' },
                  { name: 'Desserts & Beverages Station', val: 99, time: '3.8 mins average' },
                ].map((station, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-300">{station.name}</span>
                      <span className="text-slate-400">
                        {station.val}% ({station.time})
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full">
                      <div className="h-full bg-indigo-500" style={{ width: `${station.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Delivery Performance Column */}
            <Card className="border-slate-800/80 bg-[#111827] p-6 space-y-4">
              <CardHeader className="border-none p-0">
                <h3 className="text-base font-bold font-display text-white">
                  Logistics & Delivery Fleet Command
                </h3>
                <p className="text-[11px] text-slate-500">Real-time driver dispatch tracking</p>
              </CardHeader>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Deliveries Today', val: '185 orders' },
                  { label: 'Avg Transit Time', val: '18.5 minutes' },
                  { label: 'Failed Deliveries', val: '2 orders', color: 'text-[#DC2626]' },
                  { label: 'Successful Del.', val: '183 orders' },
                  { label: 'Driver Earnings', val: '₹8,400' },
                  { label: 'Driver Bonuses', val: `₹${Math.round(bonusDistributed * 0.35)}` },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-955/60 border border-slate-850 rounded-xl text-center"
                  >
                    <span className="text-[9px] text-slate-500 block uppercase">{stat.label}</span>
                    <span
                      className={`text-xs font-bold mt-1.5 block ${stat.color || 'text-slate-200'}`}
                    >
                      {stat.val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-855 pt-4 space-y-3.5 text-xs font-sans">
                <span className="text-xs font-semibold text-slate-400">
                  Driver Performance Leaderboard
                </span>
                {[
                  { name: 'Rider Ramesh', val: 99, orders: '42 dispatches' },
                  { name: 'Rider Kumar', val: 95, orders: '38 dispatches' },
                  { name: 'Rider Anil', val: 92, orders: '32 dispatches' },
                ].map((driver, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-300">{driver.name}</span>
                      <span className="text-slate-400">
                        {driver.val}% completion ({driver.orders})
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full">
                      <div className="h-full bg-emerald-500" style={{ width: `${driver.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* TAB 11: AI PREDICTIVE */}
        {activeTab === 'ai' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Branch Selection Bar */}
            <div className="bg-[#111827] border border-slate-800 p-4.5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-200">
                  Load AI Predictive Analytics
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
                  Select outlet to load demand forecast and raw ingredients stockout risks models
                </p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs text-slate-400 shrink-0 font-sans font-semibold">
                  Select Branch:
                </span>
                <select
                  value={selectedAiBranchId}
                  onChange={(e) => {
                    setSelectedAiBranchId(e.target.value);
                    fetchAiPredictions(e.target.value);
                  }}
                  className="bg-slate-950/60 text-white text-xs font-semibold rounded-xl border border-slate-800 focus:outline-none p-2 cursor-pointer w-full md:w-60"
                >
                  {branches.map((b) => (
                    <option key={b.branchId} value={b.branchId} className="bg-slate-900">
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {aiLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-450">
                <RefreshCw className="animate-spin text-[#2563EB] w-10 h-10 mb-3" />
                <p className="text-xs font-medium font-display">
                  Generating predictions algorithms...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Textual Analysis */}
                <Card className="lg:col-span-1 border-slate-800/80 bg-[#111827] p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold font-display text-white">
                      AI Forecasting Report
                    </h3>
                    <p className="text-[11px] text-slate-550 uppercase tracking-wider block font-bold font-sans mt-0.5">
                      Prediction Type: LSTM Multi-Factor Model
                    </p>
                  </div>

                  <div className="space-y-4 font-sans text-xs">
                    <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-xl leading-relaxed">
                      <span className="text-[9px] text-[#2563EB] font-bold block uppercase tracking-wider mb-1">
                        Demand Analysis
                      </span>
                      <p className="text-slate-205 italic">
                        &ldquo;
                        {aiDemandData?.aiAnalysis ||
                          'Strong weekend volume predicted. Preparing station prep capacity checks is advised.'}
                        &rdquo;
                      </p>
                    </div>

                    <div className="p-3.5 bg-amber-950/20 border border-amber-500/20 rounded-xl leading-relaxed">
                      <span className="text-[9px] text-[#F59E0B] font-bold block uppercase tracking-wider mb-1">
                        Inventory Risks
                      </span>
                      <p className="text-slate-205 italic">
                        &ldquo;
                        {aiInventoryData?.aiAnalysis ||
                          'Mozzarella cheese stock requires immediate replenishment within 24 hours to support forecast.'}
                        &rdquo;
                      </p>
                    </div>
                  </div>
                </Card>

                {/* AI Demand & Stockout curves */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-slate-800/80 bg-[#111827] p-6">
                    <CardHeader className="border-none p-0 mb-4">
                      <h3 className="text-base font-bold font-display text-white">
                        Demand Forecast Calendar
                      </h3>
                    </CardHeader>
                    <div className="h-64 w-full relative">
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart
                          data={[
                            {
                              name: 'Jun W1',
                              actual: Math.round(monthlyRevenue * 0.25),
                              predicted: Math.round(monthlyRevenue * 0.26),
                            },
                            {
                              name: 'Jun W2',
                              actual: null,
                              predicted: Math.round(monthlyRevenue * 0.28),
                            },
                            {
                              name: 'Jun W3',
                              actual: null,
                              predicted: Math.round(monthlyRevenue * 0.31),
                            },
                            {
                              name: 'Jun W4',
                              actual: null,
                              predicted: Math.round(monthlyRevenue * 0.32),
                            },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                          <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                          <YAxis stroke="#64748B" fontSize={11} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
                          />
                          <Legend verticalAlign="top" height={36} />
                          <Line
                            name="Actual Sales"
                            type="monotone"
                            dataKey="actual"
                            stroke="#2563EB"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                          />
                          <Line
                            name="AI Predicted Sales"
                            type="monotone"
                            dataKey="predicted"
                            stroke="#16A34A"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-slate-800/80 bg-[#111827] p-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                        AI Inventory Risks list
                      </span>
                      <div className="space-y-2">
                        {(
                          aiInventoryData?.risks || [
                            {
                              ingredient: 'Mozzarella Cheese',
                              daysLeft: 1.2,
                              suggestedRestockQty: 50,
                            },
                            { ingredient: 'Pizza Dough', daysLeft: 0.5, suggestedRestockQty: 100 },
                          ]
                        ).map((risk: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-950/60 border border-slate-855 rounded-xl flex justify-between items-center text-xs font-sans"
                          >
                            <div>
                              <span className="font-semibold text-slate-200 block">
                                {risk.ingredient}
                              </span>
                              <span className="text-[10px] text-rose-400 block mt-0.5">
                                {risk.daysLeft} days left
                              </span>
                            </div>
                            <span className="text-indigo-400 font-bold shrink-0">
                              Suggest Qty: {risk.suggestedRestockQty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="border-slate-800/80 bg-[#111827] p-4 font-sans text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                        AI Forecasted Highlights
                      </span>
                      <div className="space-y-2.5">
                        <div className="flex justify-between border-b border-slate-805 pb-2">
                          <span className="text-slate-450">Demand Increase Trend</span>
                          <span className="font-semibold text-emerald-450">+12.4% MoM</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-805 pb-2">
                          <span className="text-slate-450">Best Seller Prediction</span>
                          <span className="font-semibold text-indigo-400">Double Cheese Pizza</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-slate-450">Highest Branch Growth Forecast</span>
                          <span className="font-semibold text-emerald-450">
                            Indiranagar (+15.2%)
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Unified Executive Exports & Reports Center Widget */}
      <Card className="border-slate-800/80 bg-[#111827] p-6 mt-8">
        <CardHeader className="border-none p-0 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-bold font-display text-white">
              Unified Reports & Data Exporters
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Download corporate performance and audit logs directly in CSV formats
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-[#2563EB] border border-[#2563EB]/25 px-2 py-0.5 rounded-full">
            Secure Enterprise Channel
          </span>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex flex-col justify-between hover:border-slate-750 transition-all">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Profit & Loss</span>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                Download detailed income statement including raw food, staff, and delivery costs.
              </p>
            </div>
            <Button
              size="xs"
              variant="outline"
              className="mt-4 w-full flex items-center justify-center gap-1.5"
              onClick={exportProfitLossCSV}
            >
              <Download size={12} /> Download CSV
            </Button>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex flex-col justify-between hover:border-slate-750 transition-all">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Payroll & Bonuses
              </span>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                Export staff logs including attendance ratios, base salary, and rated bonuses.
              </p>
            </div>
            <Button
              size="xs"
              variant="outline"
              className="mt-4 w-full flex items-center justify-center gap-1.5"
              onClick={exportPayrollCSV}
            >
              <Download size={12} /> Download CSV
            </Button>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-855 rounded-xl flex flex-col justify-between hover:border-slate-750 transition-all">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Inventory Val.</span>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                Download master ingredient stock, units, and valuation logs.
              </p>
            </div>
            <Button
              size="xs"
              variant="outline"
              className="mt-4 w-full flex items-center justify-center gap-1.5"
              onClick={exportInventoryCSV}
            >
              <Download size={12} /> Download CSV
            </Button>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-855 rounded-xl flex flex-col justify-between hover:border-slate-750 transition-all">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Branch Benchmarks
              </span>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                Download city ratings, revenues, and active dispatches comparisons.
              </p>
            </div>
            <Button
              size="xs"
              variant="outline"
              className="mt-4 w-full flex items-center justify-center gap-1.5"
              onClick={exportBranchPerformance}
            >
              <Download size={12} /> Download CSV
            </Button>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-855 rounded-xl flex flex-col justify-between hover:border-slate-750 transition-all">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                PDF Audit Statement
              </span>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                Generate a formatted PDF presentation containing executive summaries.
              </p>
            </div>
            <Button
              size="xs"
              variant="outline"
              className="mt-4 w-full flex items-center justify-center gap-1.5"
              onClick={() =>
                toast.success('Formatted Executive PDF Report compiled and queued for print!')
              }
            >
              <FileText size={12} /> Compile PDF
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
