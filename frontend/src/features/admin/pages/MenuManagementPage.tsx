import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/apiClient';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  BookOpen,
  Plus,
  Edit2,
  RefreshCw,
  Eye,
  EyeOff,
  Flame,
  CheckCircle,
  Tag,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
  isVeg: boolean;
  isAvailable: boolean;
  featured: boolean;
  description?: string;
  category?: { name: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function MenuManagementPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState('199');
  const [formIsVeg, setFormIsVeg] = useState(false);
  const [formDescription, setFormDescription] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get('/admin/products'),
        apiClient.get('/catalog/categories')
      ]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data.categories || []);
    } catch (err: any) {
      toast.error('Failed to load menu details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setSelectedProduct(null);
    setFormName('');
    setFormCategoryId(categories[0]?.id || '');
    setFormPrice('199');
    setFormIsVeg(false);
    setFormDescription('');
    setShowAddEditModal(true);
  };

  const openEditModal = (prod: Product) => {
    setSelectedProduct(prod);
    setFormName(prod.name);
    setFormCategoryId(prod.categoryId);
    setFormPrice(prod.basePrice.toString());
    setFormIsVeg(prod.isVeg);
    setFormDescription(prod.description || '');
    setShowAddEditModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategoryId) {
      toast.warning('Please select a menu category.');
      return;
    }

    try {
      const payload = {
        name: formName,
        categoryId: formCategoryId,
        basePrice: parseFloat(formPrice) || 0,
        isVeg: formIsVeg,
        description: formDescription
      };

      if (selectedProduct) {
        await apiClient.patch(`/admin/products/${selectedProduct.id}`, payload);
        toast.success(`Updated menu item: ${formName}`);
      } else {
        await apiClient.post('/admin/products', payload);
        toast.success(`Registered new menu item: ${formName}`);
      }
      setShowAddEditModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Error saving menu item.');
    }
  };

  const handleToggleAvailable = async (prod: Product) => {
    try {
      await apiClient.patch(`/admin/products/${prod.id}`, {
        isAvailable: !prod.isAvailable
      });
      toast.success(`${prod.name} is now ${!prod.isAvailable ? 'Available' : 'Unavailable'}`);
      loadData();
    } catch (err: any) {
      toast.error('Failed to change item availability.');
    }
  };

  const handleToggleFeatured = async (prod: Product) => {
    try {
      await apiClient.patch(`/admin/products/${prod.id}`, {
        featured: !prod.featured
      });
      toast.success(`${prod.name} featured state updated.`);
      loadData();
    } catch (err: any) {
      toast.error('Failed to toggle featured state.');
    }
  };

  const filteredProducts = products
    .filter(p => selectedCategoryId === 'ALL' || p.categoryId === selectedCategoryId)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 p-6 text-white bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Menu Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure restaurant dishes, base retail prices, dietary tags, and live menu item availability.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus size={16} /> Add Menu Item
        </Button>
      </div>

      {/* Grid of items */}
      <Card className="border-border/40 bg-slate-900/40 backdrop-blur-md rounded-2xl p-6">
        <CardHeader className="border-none p-0 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-display text-white">Active Catalog</h3>
            <p className="text-xs text-slate-400">Manage pricing, availability toggles, and culinary categories</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-border/20 text-xs w-64">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-white focus:outline-none w-full"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-border/20 text-xs">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="animate-spin text-primary w-10 h-10" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No menu items found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-2xl border bg-gradient-to-b from-slate-900/60 to-slate-950/40 relative flex flex-col justify-between ${
                  p.isAvailable ? 'border-border/30' : 'border-rose-900/40 opacity-70'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      p.isVeg 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {p.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                    {p.featured && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Flame size={10} fill="currentColor" /> Featured
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-slate-200 mt-3">{p.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description || 'No description provided.'}</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mt-6 pt-3 border-t border-border/10">
                    <span className="text-lg font-bold text-emerald-400">
                      ₹{parseFloat(p.basePrice.toString()).toFixed(2)}
                    </span>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={() => handleToggleFeatured(p)}
                        size="sm"
                        className={`p-1.5 rounded-lg border ${
                          p.featured 
                            ? 'bg-amber-950/20 hover:bg-amber-950 text-amber-400 border-amber-500/20' 
                            : 'bg-slate-900 border-border/30 text-slate-400'
                        }`}
                      >
                        <Flame size={12} />
                      </Button>
                      <Button
                        onClick={() => handleToggleAvailable(p)}
                        size="sm"
                        className={`p-1.5 rounded-lg border ${
                          p.isAvailable 
                            ? 'bg-indigo-950/20 hover:bg-indigo-950 text-indigo-400 border-indigo-500/20' 
                            : 'bg-rose-950/20 hover:bg-rose-950 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {p.isAvailable ? <Eye size={12} /> : <EyeOff size={12} />}
                      </Button>
                      <Button
                        onClick={() => openEditModal(p)}
                        size="sm"
                        className="p-1.5 bg-slate-900 border-border/30 text-slate-300 hover:bg-slate-800 rounded-lg"
                      >
                        <Edit2 size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {showAddEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-border/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-border/20 flex justify-between items-center bg-slate-950/40">
                <h2 className="text-lg font-bold font-display">
                  {selectedProduct ? 'Modify Menu Item' : 'Add Menu Item'}
                </h2>
                <button onClick={() => setShowAddEditModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Item Name</label>
                  <Input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Gourmet Veggie Burger"
                    className="bg-slate-950 border-border/30 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">Category</label>
                    <select
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      className="w-full bg-slate-950 border border-border/30 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">Base Price (₹)</label>
                    <Input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="bg-slate-950 border-border/30 text-white text-center font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <input
                    type="checkbox"
                    id="formIsVeg"
                    checked={formIsVeg}
                    onChange={(e) => setFormIsVeg(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-border/30 w-4 h-4"
                  />
                  <label htmlFor="formIsVeg" className="text-sm text-slate-300 select-none">Vegetarian Recipe</label>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Detailed ingredients list or preparation profile..."
                    className="w-full h-20 bg-slate-950 border border-border/30 rounded-xl p-3 text-sm text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => setShowAddEditModal(false)}
                    variant="outline"
                    className="bg-slate-900 border-border/30 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Save Item
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
