import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Send,
  AlertTriangle,
  History,
  CheckCircle,
  Truck,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import apiClient from '../../../services/apiClient';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  fetchInventory,
  fetchInventoryRequests,
  createInventoryRequest,
} from '../../inventory/store/inventorySlice';

export default function ManagerInventoryPage() {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { inventory, inventoryRequests } = useAppSelector(
    (state) => state.inventory
  );

  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  // Request Form State
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestItems, setRequestItems] = useState<
    { ingredientId: string; quantity: number; notes: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await apiClient.get('/catalog/branches');
        const b = res.data.data.branches || [];
        setBranches(b);
        if (b.length > 0) setSelectedBranchId(b[0].id);
      } catch (err) {
        console.error('Failed to load branches', err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedBranchId) return;
    dispatch(fetchInventory());
    dispatch(fetchInventoryRequests(selectedBranchId));
  }, [selectedBranchId, dispatch]);

  const handleAddRequestItem = () => {
    setRequestItems([
      ...requestItems,
      { ingredientId: '', quantity: 1, notes: '' },
    ]);
  };

  const handleRemoveRequestItem = (idx: number) => {
    setRequestItems(requestItems.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (idx: number, field: string, value: any) => {
    const newItems = [...requestItems];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setRequestItems(newItems);
  };

  const handleSubmitRequest = () => {
    if (
      requestItems.length === 0 ||
      requestItems.some((i) => !i.ingredientId || i.quantity <= 0)
    ) {
      toast.error('Please fill all item fields properly.');
      return;
    }

    setSubmitting(true);
    dispatch(
      createInventoryRequest({
        branchId: selectedBranchId,
        expectedDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        items: requestItems,
      })
    )
      .unwrap()
      .then(() => {
        toast.success('Inventory request sent to Central Warehouse.');
        setShowRequestForm(false);
        setRequestItems([]);
      })
      .catch((err) => toast.error(err.message || 'Failed to submit request.'))
      .finally(() => setSubmitting(false));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'APPROVED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'DISPATCHED':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'DELIVERED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'REJECTED':
        return 'bg-rose-500/20 text-rose-500 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Assume inventory slice returns global inventory array where we map items.
  // In a real app we'd filter `inventory` by branchId or use a specific endpoint.
  const branchInventory = inventory.filter(
    (i) => i.branchId === selectedBranchId || !i.branchId
  );
  const lowStockItems = branchInventory.filter(
    (i) => i.quantity <= (i.minimumStockLevel || 10)
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">
            Inventory & Logistics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor branch stock and order supplies from Central.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-border/30 rounded-xl px-4 py-2">
            <span className="text-slate-400 text-xs">Branch:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer appearance-none"
            >
              {branches.map((b) => (
                <option
                  key={b.id}
                  value={b.id}
                  className="bg-slate-900 text-white"
                >
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={() => setShowRequestForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9"
          >
            <Send size={14} className="mr-2" /> Request Supplies
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: Alerts & Stock Levels */}
        <div className="xl:col-span-1 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar">
          <Card className="bg-slate-900/40 border-border/20 p-5 shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="text-amber-500 w-5 h-5" />
              <h3 className="font-bold text-white">Low Stock Alerts</h3>
            </div>

            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Stock levels are healthy.
                </p>
              ) : (
                lowStockItems.slice(0, 5).map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-amber-500/5 rounded-xl border border-amber-500/10"
                  >
                    <div>
                      <p className="text-sm font-semibold text-amber-500">
                        {item.ingredient?.name || item.name}
                      </p>
                      <p className="text-[10px] text-amber-500/70 mt-0.5">
                        Min: {item.minimumStockLevel} {item.unit}
                      </p>
                    </div>
                    <span className="font-mono text-amber-500 font-bold">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="bg-slate-900/40 border-border/20 flex flex-col flex-1 overflow-hidden min-h-[300px]">
            <div className="p-4 border-b border-border/10 bg-slate-900/60 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-white">Current Stock</h3>
              <Badge className="bg-slate-800 text-slate-300 font-bold">
                {branchInventory.length} Items
              </Badge>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
              {branchInventory.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-border/5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      {item.ingredient?.name || item.name}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                      {item.unit}
                    </p>
                  </div>
                  <span
                    className={`font-mono font-bold ${item.quantity <= (item.minimumStockLevel || 10) ? 'text-amber-500' : 'text-slate-300'}`}
                  >
                    {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Requisition History */}
        <Card className="xl:col-span-2 bg-slate-900/40 border-border/20 flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-border/20 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-white font-bold font-display text-lg">
              <History className="text-primary w-5 h-5" /> Recent Requests
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            {inventoryRequests.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                <Package size={48} className="mb-4" />
                <p className="text-sm font-semibold">
                  No supply requests made yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {inventoryRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-slate-950/60 rounded-2xl border border-border/10 flex flex-col gap-3 group hover:border-border/30 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-200">
                          Request #
                          {req.requestNumber?.toUpperCase() ||
                            req.id.slice(-6).toUpperCase()}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Submitted:{' '}
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        className={`text-[10px] border ${getStatusBadge(req.status)}`}
                      >
                        {req.status}
                      </Badge>
                    </div>

                    <div className="pt-3 border-t border-border/5 grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Items Requested
                        </p>
                        {req.items
                          ?.slice(0, 3)
                          .map((item: any, idx: number) => (
                            <p
                              key={idx}
                              className="text-xs text-slate-300 flex justify-between"
                            >
                              <span>{item.ingredient?.name || 'Item'}</span>
                              <span className="font-mono text-primary">
                                {item.quantity} {item.ingredient?.unit}
                              </span>
                            </p>
                          ))}
                        {(req.items?.length || 0) > 3 && (
                          <p className="text-[10px] text-slate-500 italic">
                            + {(req.items?.length || 0) - 3} more items
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Expected Delivery
                          </p>
                          <p className="text-xs text-slate-300">
                            {new Date(req.expectedDate).toLocaleDateString()}
                          </p>
                        </div>
                        {req.status === 'DISPATCHED' && (
                          <div className="bg-sky-500/10 text-sky-400 border border-sky-500/20 p-2 rounded-lg text-xs flex items-center gap-2">
                            <Truck size={14} /> En route from Central
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {showRequestForm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-border/20 max-w-2xl w-full rounded-2xl flex flex-col max-h-[80vh] shadow-2xl"
            >
              <div className="p-6 border-b border-border/20 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-white font-display">
                    New Supply Request
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Order ingredients from the central warehouse.
                  </p>
                </div>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="text-slate-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                {requestItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-950/50 rounded-xl border border-border/10"
                  >
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                        Ingredient
                      </label>
                      <select
                        value={item.ingredientId}
                        onChange={(e) =>
                          handleUpdateItem(idx, 'ingredientId', e.target.value)
                        }
                        className="w-full bg-slate-900 border border-border/30 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Select Item...</option>
                        {/* Assuming we fetch all ingredients and they are available in state somewhere, mock for now */}
                        <option value="ing-1">Tomatoes</option>
                        <option value="ing-2">Flour</option>
                        <option value="ing-3">Mozzarella Cheese</option>
                        <option value="ing-4">Olive Oil</option>
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                        Qty
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(
                            idx,
                            'quantity',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="bg-slate-900 border-border/30"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                        Notes (Opt)
                      </label>
                      <Input
                        type="text"
                        value={item.notes}
                        placeholder="Urgent, specific brand..."
                        onChange={(e) =>
                          handleUpdateItem(idx, 'notes', e.target.value)
                        }
                        className="bg-slate-900 border-border/30"
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <button
                        onClick={() => handleRemoveRequestItem(idx)}
                        className="text-rose-500 hover:text-rose-400 p-1.5 bg-rose-500/10 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                <Button
                  onClick={handleAddRequestItem}
                  variant="outline"
                  className="w-full border-dashed border-border/40 text-slate-400 hover:text-white hover:border-primary/50 bg-transparent h-12"
                >
                  + Add Ingredient to Request
                </Button>
              </div>

              <div className="p-6 border-t border-border/20 flex gap-3 justify-end bg-slate-900/50 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setShowRequestForm(false)}
                  className="border-border/30 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  disabled={submitting || requestItems.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {submitting ? 'Submitting...' : 'Submit Request to Central'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
