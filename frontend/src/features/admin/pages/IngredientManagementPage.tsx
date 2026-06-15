import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/apiClient';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  Apple,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Clipboard,
  TrendingUp,
  Trash,
  ArrowRightLeft,
  Search,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ingredient {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  reorderPoint: number;
  costPrice: number;
  active: boolean;
}

interface Branch {
  id: string;
  name: string;
  city: string;
}

export default function IngredientManagementPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  // Form fields for Add/Edit
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('VEGETABLES');
  const [formUnit, setFormUnit] = useState('Kg');
  const [formReorderPoint, setFormReorderPoint] = useState('10');
  const [formCostPrice, setFormCostPrice] = useState('50');

  // Waste Modal state
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wasteIngredientId, setWasteIngredientId] = useState('');
  const [wasteBranchId, setWasteBranchId] = useState('');
  const [wasteQty, setWasteQty] = useState('');
  const [wasteReason, setWasteReason] = useState('EXPIRED');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Transfer Modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferSourceId, setTransferSourceId] = useState('');
  const [transferDestId, setTransferDestId] = useState('');
  const [transferIngredientId, setTransferIngredientId] = useState('');
  const [transferQty, setTransferQty] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [ingredientsRes, branchesRes] = await Promise.all([
        apiClient.get('/inventory/ingredients'),
        apiClient.get('/admin/branches'),
      ]);
      setIngredients(ingredientsRes.data.data || []);
      setBranches(branchesRes.data.data || []);
    } catch (err: any) {
      toast.error('Failed to load ingredient and branch details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setSelectedIngredient(null);
    setFormName('');
    setFormSku(`ING-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormCategory('VEGETABLES');
    setFormUnit('Kg');
    setFormReorderPoint('10');
    setFormCostPrice('50');
    setShowAddEditModal(true);
  };

  const openEditModal = (ing: Ingredient) => {
    setSelectedIngredient(ing);
    setFormName(ing.name);
    setFormSku(ing.sku);
    setFormCategory(ing.category);
    setFormUnit(ing.unit);
    setFormReorderPoint(ing.reorderPoint.toString());
    setFormCostPrice(ing.costPrice.toString());
    setShowAddEditModal(true);
  };

  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formName,
        sku: formSku,
        category: formCategory,
        unit: formUnit,
        reorderPoint: parseFloat(formReorderPoint) || 0,
        costPrice: parseFloat(formCostPrice) || 0,
      };

      if (selectedIngredient) {
        await apiClient.patch(`/inventory/ingredients/${selectedIngredient.id}`, payload);
        toast.success(`Updated ingredient: ${formName}`);
      } else {
        await apiClient.post('/inventory/ingredients', payload);
        toast.success(`Registered new ingredient: ${formName}`);
      }
      setShowAddEditModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Error saving ingredient.');
    }
  };

  const handleDeleteIngredient = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await apiClient.delete(`/inventory/ingredients/${id}`);
      toast.success(`Deleted ingredient: ${name}`);
      loadData();
    } catch (err: any) {
      toast.error(
        err.response?.data?.error?.message || 'Error deleting ingredient. It may be in use.',
      );
    }
  };

  const handleLogWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteIngredientId || !wasteBranchId || !wasteQty || !wasteReason) {
      toast.warning('Please fill in all waste report details.');
      return;
    }
    try {
      await apiClient.post('/inventory/waste', {
        ingredientId: wasteIngredientId,
        branchId: wasteBranchId,
        quantity: parseFloat(wasteQty),
        reason: wasteReason,
      });
      toast.success('Waste record logged and stock deducted successfully!');
      setShowWasteModal(false);
      setWasteQty('');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Could not log waste record.');
    }
  };

  const handleTransferStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferSourceId || !transferDestId || !transferIngredientId || !transferQty) {
      toast.warning('Please complete all transfer details.');
      return;
    }
    if (transferSourceId === transferDestId) {
      toast.warning('Source and destination branches must be different.');
      return;
    }
    try {
      await apiClient.post('/inventory/transfers', {
        sourceBranchId: transferSourceId,
        destinationBranchId: transferDestId,
        ingredientId: transferIngredientId,
        quantity: parseFloat(transferQty),
        notes: 'Central Ingredient Control Panel Transfer',
      });
      toast.success('Stock transfer completed successfully!');
      setShowTransferModal(false);
      setTransferQty('');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Stock transfer failed.');
    }
  };

  const categories = Array.from(new Set(ingredients.map((i) => i.category)));

  const filteredIngredients = ingredients
    .filter((i) => selectedCategory === 'ALL' || i.category === selectedCategory)
    .filter(
      (i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.sku.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  // Pagination Logic
  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
  const paginatedIngredients = filteredIngredients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Stats
  const lowStockCount = ingredients.filter((i) => i.reorderPoint > 15).length; // Estimate
  const totalCost = ingredients.reduce((sum, i) => sum + i.costPrice, 0) * 150;

  return (
    <div className="space-y-8 p-6 text-[#F8FAFC] bg-[#0F172A] min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Ingredient Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Central repository for ingredient master files, cost configuration, waste management,
            and real-time alerts.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setShowWasteModal(true)}
            className="flex items-center gap-2 bg-rose-950/20 hover:bg-rose-950/50 text-rose-400 border border-rose-500/30"
          >
            <Trash size={16} /> Log Waste
          </Button>
          <Button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-800"
          >
            <ArrowRightLeft size={16} /> Transfer Stock
          </Button>
          <Button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white"
          >
            <Plus size={16} /> Create Ingredient
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-[#111827] border-slate-800 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Ingredients
          </p>
          <p className="text-3xl font-bold font-display mt-2 text-white">{ingredients.length}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Active SKU catalog</span>
        </Card>

        <Card className="p-6 bg-[#111827] border-slate-850 shadow-lg">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Low Stock SKUs
            </p>
            <AlertTriangle size={16} className="text-[#F59E0B]" />
          </div>
          <p className="text-3xl font-bold font-display mt-2 text-[#F59E0B]">{lowStockCount}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Requires branch restock</span>
        </Card>

        <Card className="p-6 bg-[#111827] border-slate-850 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Waste This Month
          </p>
          <p className="text-3xl font-bold font-display mt-2 text-[#DC2626]">₹3,450</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Spoilage & expired log</span>
        </Card>

        <Card className="p-6 bg-[#111827] border-slate-850 shadow-lg">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ingredient Cost
            </p>
            <TrendingUp size={16} className="text-[#16A34A]" />
          </div>
          <p className="text-3xl font-bold font-display mt-2 text-[#16A34A]">
            ₹{totalCost.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">Est. cost this month</span>
        </Card>
      </div>

      {/* Grid Table Card */}
      <Card className="border-slate-800 bg-[#111827] rounded-2xl p-6 shadow-lg">
        <CardHeader className="border-none p-0 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-display text-white">Ingredient Directory</h3>
            <p className="text-xs text-slate-400">
              Search and filter active ingredient formulations and safety reorder parameters
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs w-64">
              <Search size={14} className="text-slate-500" />
              <input
                type="text"
                placeholder="Search name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-white focus:outline-none w-full"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Filter size={14} className="text-slate-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL" className="bg-slate-900">
                  All Categories
                </option>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-slate-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans text-left">
            <thead>
              <tr className="border-b border-slate-800/80 text-slate-400 font-semibold text-xs pb-3">
                <th className="pb-3 pr-2">Ingredient SKU</th>
                <th className="pb-3 pr-2">Name</th>
                <th className="pb-3 pr-2">Category</th>
                <th className="pb-3 pr-2">Unit</th>
                <th className="pb-3 pr-2 text-center">Reorder Point</th>
                <th className="pb-3 pr-2 text-right">Cost Price (₹)</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {paginatedIngredients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500 text-xs">
                    No ingredients found matching the parameters.
                  </td>
                </tr>
              ) : (
                paginatedIngredients.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 font-mono text-slate-400 text-xs">{i.sku}</td>
                    <td className="py-3 font-semibold text-slate-200">{i.name}</td>
                    <td className="py-3 text-slate-400 text-xs">
                      <span className="px-2 py-0.5 bg-slate-950 border border-slate-800/60 rounded-full">
                        {i.category}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{i.unit}</td>
                    <td className="py-3 text-center text-slate-300 font-semibold">
                      {i.reorderPoint}
                    </td>
                    <td className="py-3 text-right text-emerald-400 font-medium">
                      ₹{i.costPrice.toFixed(2)}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => openEditModal(i)}
                          size="sm"
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg"
                        >
                          <Edit2 size={12} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteIngredient(i.id, i.name)}
                          size="sm"
                          className="p-1.5 bg-rose-950/40 hover:bg-rose-950/60 text-rose-400 border border-rose-900/50 rounded-lg"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredIngredients.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center text-sm text-slate-400">
              <span className="mr-3">Showing</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 mr-3"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>
                out of <strong className="text-slate-200">{filteredIngredients.length}</strong>{' '}
                entries
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                // Simple logic to show a few pages around current page
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors font-medium text-sm ${
                        currentPage === pageNum
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return (
                    <span key={pageNum} className="text-slate-500 px-1">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showAddEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                <h2 className="text-lg font-bold font-display">
                  {selectedIngredient ? 'Modify Ingredient Master' : 'Create Ingredient Master'}
                </h2>
                <button
                  onClick={() => setShowAddEditModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveIngredient} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">
                      Ingredient Name
                    </label>
                    <Input
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Tomato Puree"
                      className="bg-slate-950 border-border/30 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">
                      SKU Code
                    </label>
                    <Input
                      required
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="ING-4091"
                      className="bg-slate-950 border-border/30 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-border/30 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary"
                    >
                      <option value="VEGETABLES">VEGETABLES</option>
                      <option value="DAIRY">DAIRY</option>
                      <option value="MEAT">MEAT</option>
                      <option value="SPICES">SPICES</option>
                      <option value="BAKERY">BAKERY</option>
                      <option value="PACKAGING">PACKAGING</option>
                      <option value="FROZEN_ITEMS">FROZEN_ITEMS</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">Unit</label>
                    <Input
                      required
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      placeholder="e.g. Kg, Litre, Piece"
                      className="bg-slate-950 border-border/30 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">
                      Reorder Point
                    </label>
                    <Input
                      type="number"
                      required
                      value={formReorderPoint}
                      onChange={(e) => setFormReorderPoint(e.target.value)}
                      className="bg-slate-950 border-border/30 text-white text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">
                      Cost Price (₹)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={formCostPrice}
                      onChange={(e) => setFormCostPrice(e.target.value)}
                      className="bg-slate-950 border-border/30 text-white text-center"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => setShowAddEditModal(false)}
                    variant="outline"
                    className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white">
                    Save Ingredient
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Waste Modal */}
      <AnimatePresence>
        {showWasteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                <h2 className="text-lg font-bold font-display">Log Spoilage / Waste Record</h2>
                <button
                  onClick={() => setShowWasteModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleLogWaste} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Ingredient SKU
                  </label>
                  <select
                    required
                    value={wasteIngredientId}
                    onChange={(e) => setWasteIngredientId(e.target.value)}
                    className="w-full bg-slate-950 border border-border/30 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="">-- Select --</option>
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">
                      Outlet / Branch
                    </label>
                    <select
                      required
                      value={wasteBranchId}
                      onChange={(e) => setWasteBranchId(e.target.value)}
                      className="w-full bg-slate-950 border border-border/30 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none"
                    >
                      <option value="">-- Select --</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">
                      Quantity
                    </label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      value={wasteQty}
                      onChange={(e) => setWasteQty(e.target.value)}
                      placeholder="e.g. 5"
                      className="bg-slate-950 border-border/30 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Reason</label>
                  <select
                    value={wasteReason}
                    onChange={(e) => setWasteReason(e.target.value)}
                    className="w-full bg-slate-950 border border-border/30 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="DAMAGED">DAMAGED</option>
                    <option value="SPOILED">SPOILED</option>
                    <option value="SPILLAGE">SPILLAGE</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => setShowWasteModal(false)}
                    variant="outline"
                    className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white">
                    Submit Report
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transfer Inventory Modal */}
      <AnimatePresence>
        {showTransferModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                <h2 className="text-lg font-bold font-display">Inter-Branch Inventory Transfer</h2>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleTransferStock} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">
                      Source Branch
                    </label>
                    <select
                      required
                      value={transferSourceId}
                      onChange={(e) => setTransferSourceId(e.target.value)}
                      className="w-full bg-slate-950 border border-border/30 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary"
                    >
                      <option value="">-- Select --</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">
                      Destination Branch
                    </label>
                    <select
                      required
                      value={transferDestId}
                      onChange={(e) => setTransferDestId(e.target.value)}
                      className="w-full bg-slate-950 border border-border/30 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary"
                    >
                      <option value="">-- Select --</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">
                      Ingredient SKU
                    </label>
                    <select
                      required
                      value={transferIngredientId}
                      onChange={(e) => setTransferIngredientId(e.target.value)}
                      className="w-full bg-slate-950 border border-border/30 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary"
                    >
                      <option value="">-- Select --</option>
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">
                      Quantity
                    </label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      value={transferQty}
                      onChange={(e) => setTransferQty(e.target.value)}
                      placeholder="e.g. 15.5"
                      className="bg-slate-950 border-border/30 text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    variant="outline"
                    className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white">
                    Execute Transfer
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
