import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/apiClient';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  Truck,
  Plus,
  Edit2,
  RefreshCw,
  Star,
  Mail,
  Phone,
  Package,
  Calendar,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  rating?: number;
}

interface PurchaseOrder {
  id: string;
  supplierId: string;
  branchId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  supplier: { name: string };
}

export default function SupplierManagementPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [suppliersRes, poRes] = await Promise.all([
        apiClient.get('/inventory/suppliers'),
        apiClient.get('/inventory/purchase-orders')
      ]);
      setSuppliers(suppliersRes.data.data);
      setPurchaseOrders(poRes.data.data);
    } catch (err: any) {
      toast.error('Failed to load supplier details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setSelectedSupplier(null);
    setFormName('');
    setFormContactName('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setShowAddEditModal(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormName(supplier.name);
    setFormContactName(supplier.contactName);
    setFormEmail(supplier.email);
    setFormPhone(supplier.phone);
    setFormAddress(supplier.address);
    setShowAddEditModal(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formName,
        contactName: formContactName,
        email: formEmail,
        phone: formPhone,
        address: formAddress
      };

      if (selectedSupplier) {
        await apiClient.patch(`/inventory/suppliers/${selectedSupplier.id}`, payload);
        toast.success(`Updated supplier: ${formName}`);
      } else {
        await apiClient.post('/inventory/suppliers', payload);
        toast.success(`Registered new supplier: ${formName}`);
      }
      setShowAddEditModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Error saving supplier.');
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-6 text-white bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Supplier Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Maintain wholesale distributor profiles, evaluate supplier performance metrics, and track procurement purchase orders.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus size={16} /> Add Supplier
        </Button>
      </div>

      {/* Grid of Suppliers and Purchase History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Suppliers List (left) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-slate-900/40 border-border/30">
            <CardHeader className="border-none p-0 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold font-display text-white">Active Distributors</h3>
                <p className="text-xs text-slate-400">Directory of ingredient and materials partners</p>
              </div>
              <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-border/20 text-xs w-64">
                <input
                  type="text"
                  placeholder="Search supplier name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-white focus:outline-none w-full"
                />
              </div>
            </CardHeader>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="animate-spin text-primary w-8 h-8" />
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No distributors registered.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSuppliers.map((s, idx) => {
                  const simulatedRating = 4.2 + (idx * 0.2) % 0.8;
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-slate-950/60 border border-border/20 rounded-xl relative hover:border-indigo-500/40 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-200">{s.name}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Rep: {s.contactName}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <Star size={12} fill="currentColor" />
                            <span>{simulatedRating.toFixed(1)}</span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 text-xs text-slate-400">
                          <p className="flex items-center gap-2">
                            <Mail size={12} /> {s.email}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone size={12} /> {s.phone}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/10 flex justify-end">
                        <Button
                          onClick={() => openEditModal(s)}
                          size="sm"
                          variant="outline"
                          className="text-xs bg-slate-900 border-border/30 text-slate-300 hover:bg-slate-800 py-1"
                        >
                          <Edit2 size={12} className="mr-1" /> Edit Profile
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Purchase History / Pending POs (right) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-slate-900/40 border-border/30">
            <CardHeader className="border-none p-0 mb-4">
              <h3 className="text-base font-bold font-display text-white">Purchase Orders History</h3>
              <p className="text-xs text-slate-400">Recent wholesale ingredient purchase transactions</p>
            </CardHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <RefreshCw className="animate-spin text-primary w-6 h-6" />
                </div>
              ) : purchaseOrders.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-8">No purchase orders logged.</p>
              ) : (
                purchaseOrders.map((po) => (
                  <div
                    key={po.id}
                    className="p-3 bg-slate-950/40 border border-border/10 rounded-xl space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">{po.supplier.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        po.status === 'RECEIVED' 
                          ? 'bg-green-500/20 text-green-400' 
                          : po.status === 'APPROVED' 
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {po.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 pt-1 border-t border-border/5">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {new Date(po.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-semibold text-emerald-400">₹{po.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

      </div>

      {/* Add / Edit Supplier Modal */}
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
                  {selectedSupplier ? 'Modify Supplier Profile' : 'Add Wholesale Supplier'}
                </h2>
                <button onClick={() => setShowAddEditModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSaveSupplier} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Supplier Company Name</label>
                  <Input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. ABC Dairy Farms"
                    className="bg-slate-950 border-border/30 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Contact Representative</label>
                  <Input
                    required
                    value={formContactName}
                    onChange={(e) => setFormContactName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="bg-slate-950 border-border/30 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">Email Address</label>
                    <Input
                      required
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="john@abcdairy.com"
                      className="bg-slate-950 border-border/30 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase">Phone Number</label>
                    <Input
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="e.g. +91 99999 88888"
                      className="bg-slate-950 border-border/30 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Warehouse Address</label>
                  <Input
                    required
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. Plot 42, Industrial Area, Sector 5"
                    className="bg-slate-950 border-border/30 text-white"
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
                    Save Profile
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
