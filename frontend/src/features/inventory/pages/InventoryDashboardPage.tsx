import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
  fetchInventory,
  fetchAnalytics,
  fetchInventoryRequests,
  createInventoryRequest,
  approveInventoryRequest,
  updateInventoryRequestStatus,
  socketInventoryUpdate,
  socketInventoryRequestUpdated,
} from '../store/inventorySlice';
import { io } from 'socket.io-client';
import { Card } from '../../../shared/components/ui/Card';
import {
  Package,
  AlertTriangle,
  ArrowRightLeft,
  Trash2,
  ShoppingCart,
  Truck,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Alert } from '../../../shared/components/ui/Alert';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function InventoryDashboardPage() {
  const dispatch = useAppDispatch();
  const { inventory, analytics, inventoryRequests, status } = useAppSelector(
    (state) => state.inventory,
  );
  const { user } = useAppSelector((state) => state.auth);

  // Local state
  const [activeTab, setActiveTab] = useState<'stock' | 'requests'>('stock');
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  // Request creation state
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');
  const [requestItems, setRequestItems] = useState<
    Array<{ ingredientId: string; requestedQuantity: number }>
  >([]);

  useEffect(() => {
    dispatch(fetchInventory());
    dispatch(fetchAnalytics());
    dispatch(fetchInventoryRequests(undefined));
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io(API_BASE_URL, { auth: { token }, withCredentials: true });

    newSocket.on('inventory-updated', (updatedInv: any) => {
      dispatch(socketInventoryUpdate(updatedInv));
    });

    newSocket.on('inventory-request-created', (req: any) => {
      dispatch(socketInventoryRequestUpdated(req));
    });

    newSocket.on('inventory-request-approved', (req: any) => {
      dispatch(socketInventoryRequestUpdated(req));
    });

    newSocket.on('inventory-request-status-updated', (req: any) => {
      dispatch(socketInventoryRequestUpdated(req));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, dispatch]);

  const lowStockItems = inventory.filter(
    (inv) => inv.availableQuantity <= (inv.ingredient?.reorderPoint || 0),
  );

  const handleCreateRequest = async () => {
    if (requestItems.length === 0) {
      setAlertMsg({
        type: 'error',
        text: 'Please select at least one ingredient to request replenishment.',
      });
      return;
    }

    try {
      // Find branch ID: if user belongs to branch, use that, else default to first inventory item's branch
      const branchId = (user as any)?.branchId || inventory[0]?.branchId;
      if (!branchId) {
        setAlertMsg({ type: 'error', text: 'No branch reference found for user context.' });
        return;
      }

      await dispatch(
        createInventoryRequest({
          branchId,
          notes: requestNotes,
          items: requestItems,
        }),
      ).unwrap();

      setAlertMsg({
        type: 'success',
        text: 'Replenishment request dispatched to central supply hub.',
      });
      setShowCreateRequestModal(false);
      setRequestNotes('');
      setRequestItems([]);
      dispatch(fetchInventoryRequests(undefined));
    } catch (err: any) {
      setAlertMsg({
        type: 'error',
        text: err.message || 'Failed to dispatch replenishment request.',
      });
    }
  };

  const handleApproveRequest = async (id: string, approveStatus: 'APPROVED' | 'REJECTED') => {
    try {
      await dispatch(
        approveInventoryRequest({
          id,
          data: { status: approveStatus },
        }),
      ).unwrap();
      setAlertMsg({
        type: 'success',
        text: `Request successfully ${approveStatus.toLowerCase()}.`,
      });
      dispatch(fetchInventoryRequests(undefined));
    } catch (err: any) {
      setAlertMsg({
        type: 'error',
        text: err.message || 'Failed to update request authorization.',
      });
    }
  };

  const handleUpdateStatus = async (
    id: string,
    nextStatus: 'PACKED' | 'DISPATCHED' | 'DELIVERED',
    type: 'dispatch' | 'deliver',
  ) => {
    try {
      await dispatch(
        updateInventoryRequestStatus({
          id,
          status: nextStatus,
          type,
        }),
      ).unwrap();
      setAlertMsg({ type: 'success', text: `Shipment marked as ${nextStatus.toLowerCase()}.` });
      dispatch(fetchInventoryRequests(undefined));
      dispatch(fetchInventory()); // Reload stock levels in case of DELIVERY
    } catch (err: any) {
      setAlertMsg({
        type: 'error',
        text: err.message || 'Failed to change shipment workflow status.',
      });
    }
  };

  const addItemToRequest = (ingredientId: string) => {
    if (requestItems.some((i) => i.ingredientId === ingredientId)) return;
    setRequestItems((prev) => [...prev, { ingredientId, requestedQuantity: 10 }]);
  };

  const updateItemQty = (ingredientId: string, val: number) => {
    setRequestItems((prev) =>
      prev.map((i) => (i.ingredientId === ingredientId ? { ...i, requestedQuantity: val } : i)),
    );
  };

  const removeItemFromRequest = (ingredientId: string) => {
    setRequestItems((prev) => prev.filter((i) => i.ingredientId !== ingredientId));
  };

  const getTimelineStep = (statusStr: string) => {
    const steps = ['PENDING', 'APPROVED', 'PACKED', 'DISPATCHED', 'DELIVERED'];
    return steps.indexOf(statusStr);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Inventory Control Hub</h1>
          <p className="text-slate-400 mt-1">
            Real-time stock balancing, central supplier dispatches, and multi-branch replenishment
            requests.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="text-slate-300 border-slate-700 hover:bg-slate-800"
            onClick={() => setShowCreateRequestModal(true)}
          >
            Create Replenish Request
          </Button>
        </div>
      </div>

      {alertMsg && (
        <div className="relative mb-4">
          <Alert variant={alertMsg.type === 'success' ? 'success' : 'error'} className="pr-10">
            {alertMsg.text}
          </Alert>
          <button
            onClick={() => setAlertMsg(null)}
            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Analytics Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-indigo-400 w-5 h-5" />
            <h2 className="text-slate-400 font-semibold text-sm uppercase tracking-wider">
              Total Stock Items
            </h2>
          </div>
          <p className="text-4xl font-bold text-white mt-1">{analytics.totalIngredients || 0}</p>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-amber-500 w-5 h-5" />
            <h2 className="text-slate-400 font-semibold text-sm uppercase tracking-wider">
              Low Stock alerts
            </h2>
          </div>
          <p className="text-4xl font-bold text-amber-500 mt-1">{lowStockItems.length}</p>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="text-emerald-500 w-5 h-5" />
            <h2 className="text-slate-400 font-semibold text-sm uppercase tracking-wider">
              Active POs
            </h2>
          </div>
          <p className="text-4xl font-bold text-white mt-1">{analytics.activePOs || 0}</p>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <Trash2 className="text-rose-500 w-5 h-5" />
            <h2 className="text-slate-400 font-semibold text-sm uppercase tracking-wider">
              Waste Today (Units)
            </h2>
          </div>
          <p className="text-4xl font-bold text-rose-500 mt-1">{analytics.wasteToday || 0}</p>
        </Card>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-3 text-sm font-semibold tracking-wider uppercase transition border-b-2 ${
            activeTab === 'stock'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🗄️ Stock Levels
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-sm font-semibold tracking-wider uppercase transition border-b-2 ${
            activeTab === 'requests'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🚚 Replenishment Requests Pipeline
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'stock' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stock Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Current Stock Levels</h2>
              {lowStockItems.length > 0 && (
                <Badge variant="warning" className="animate-pulse">
                  Requires Restock Focus
                </Badge>
              )}
            </div>

            {status === 'loading' && inventory.length === 0 ? (
              <p className="text-slate-400 animate-pulse">Querying stock ledger...</p>
            ) : (
              <Card className="overflow-hidden border border-slate-800 bg-slate-950">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-900 border-b border-slate-800 text-white uppercase text-xs tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Ingredient</th>
                        <th className="px-6 py-4 font-semibold">SKU / Code</th>
                        <th className="px-6 py-4 font-semibold">Available Units</th>
                        <th className="px-6 py-4 font-semibold">Safety threshold</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {inventory.map((inv, i) => {
                        const isLow = inv.availableQuantity <= (inv.ingredient?.reorderPoint || 0);
                        return (
                          <tr key={inv.id || i} className="hover:bg-slate-900/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">
                              {inv.ingredient?.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-500">
                              {inv.ingredient?.sku || '-'}
                            </td>
                            <td className="px-6 py-4 font-semibold text-white">
                              {inv.availableQuantity.toFixed(2)} {inv.ingredient?.unit}
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-500">
                              {inv.ingredient?.reorderPoint || 0} {inv.ingredient?.unit}
                            </td>
                            <td className="px-6 py-4">
                              {isLow ? (
                                <Badge
                                  variant="warning"
                                  className="bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                >
                                  Low Stock
                                </Badge>
                              ) : (
                                <Badge
                                  variant="success"
                                  className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                >
                                  Optimal
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {inventory.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                            No inventory records loaded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Inventory Controls</h2>
            <div className="space-y-4">
              <Card className="bg-slate-900 border-slate-800 p-5 hover:border-indigo-500/40 cursor-pointer transition-colors flex items-center gap-4">
                <div className="bg-indigo-500/10 p-3.5 rounded-lg border border-indigo-500/20">
                  <ShoppingCart className="text-indigo-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Configure Purchase Orders</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Procure raw stock elements directly from configured suppliers.
                  </p>
                </div>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-5 hover:border-indigo-500/40 cursor-pointer transition-colors flex items-center gap-4">
                <div className="bg-amber-500/10 p-3.5 rounded-lg border border-amber-500/20">
                  <ArrowRightLeft className="text-amber-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Inter-Branch Stock Transfers</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Shift units from overflowing branches to low stocks.
                  </p>
                </div>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-5 hover:border-indigo-500/40 cursor-pointer transition-colors flex items-center gap-4">
                <div className="bg-rose-500/10 p-3.5 rounded-lg border border-rose-500/20">
                  <Trash2 className="text-rose-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Log Waste Ledger</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Account for spoiled, broken, or expired items.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* Replenishment Requests pipeline tab */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Replenishment Request Pipeline</h2>
            <span className="text-xs font-semibold text-slate-400">
              Total requests: {inventoryRequests.length} active
            </span>
          </div>

          <div className="space-y-6">
            {inventoryRequests.map((req: any) => {
              const currentStep = getTimelineStep(req.status);
              return (
                <Card key={req.id} className="bg-slate-900 border-slate-800 p-6 space-y-4">
                  {/* Top bar header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-white text-base">
                          Request ID: #{req.id.slice(0, 8)}
                        </span>
                        <Badge variant="info" className="text-xs">
                          Branch: {req.branch?.name || 'Main'}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>
                          Requested By: {req.requestedBy?.firstName || 'Staff'} (
                          {req.requestedBy?.email || 'System'})
                        </span>
                        <span>•</span>
                        <span>Date: {new Date(req.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Role Actions */}
                    <div className="flex gap-2">
                      {/* Approvals (Super Admin, Admin, Org Owner) */}
                      {req.status === 'PENDING' &&
                        (user?.role === 'ADMIN' ||
                          user?.role === 'SUPER_ADMIN' ||
                          user?.role === 'ORGANIZATION_OWNER') && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApproveRequest(req.id, 'APPROVED')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              className="border-slate-700 text-slate-300 hover:bg-slate-800"
                              size="sm"
                              onClick={() => handleApproveRequest(req.id, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                      {/* Packing & Dispatch (Inventory Manager, Admin) */}
                      {req.status === 'APPROVED' &&
                        (user?.role === 'INVENTORY_MANAGER' ||
                          user?.role === 'ADMIN' ||
                          user?.role === 'SUPER_ADMIN') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(req.id, 'PACKED', 'dispatch')}
                          >
                            Mark Packed
                          </Button>
                        )}
                      {req.status === 'PACKED' &&
                        (user?.role === 'INVENTORY_MANAGER' ||
                          user?.role === 'ADMIN' ||
                          user?.role === 'SUPER_ADMIN') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(req.id, 'DISPATCHED', 'dispatch')}
                          >
                            Dispatch Cargo
                          </Button>
                        )}

                      {/* Deliver Confirm (Branch Manager, Admin) */}
                      {req.status === 'DISPATCHED' &&
                        (user?.role === 'BRANCH_MANAGER' ||
                          user?.role === 'ADMIN' ||
                          user?.role === 'SUPER_ADMIN') && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleUpdateStatus(req.id, 'DELIVERED', 'deliver')}
                          >
                            Confirm Delivery Receipt
                          </Button>
                        )}

                      {/* Final Status pill */}
                      {req.status === 'REJECTED' && (
                        <Badge
                          variant="error"
                          className="bg-red-500/10 text-red-500 border border-red-500/20"
                        >
                          Rejected
                        </Badge>
                      )}
                      {req.status === 'DELIVERED' && (
                        <Badge
                          variant="success"
                          className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        >
                          Delivered
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Visual Status Timeline Progress Bar */}
                  {req.status !== 'REJECTED' && (
                    <div className="py-2">
                      <div className="flex justify-between items-center relative">
                        {/* Timeline background connection line */}
                        <div className="absolute left-0 right-0 h-1 bg-slate-800 top-1/2 -translate-y-1/2 z-0" />

                        {/* Status items */}
                        {[
                          { label: 'Created', value: 'PENDING', icon: Clock },
                          { label: 'Authorized', value: 'APPROVED', icon: CheckCircle },
                          { label: 'Items Packed', value: 'PACKED', icon: Package },
                          { label: 'Dispatched', value: 'DISPATCHED', icon: Truck },
                          { label: 'Delivered', value: 'DELIVERED', icon: CheckCircle },
                        ].map((step, idx) => {
                          const StepIcon = step.icon;
                          const isCompleted = currentStep >= idx;
                          return (
                            <div
                              key={step.value}
                              className="flex flex-col items-center z-10 space-y-1 bg-slate-900 px-3"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${
                                  isCompleted
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/35'
                                    : 'bg-slate-950 border-slate-800 text-slate-500'
                                }`}
                              >
                                <StepIcon className="w-4 h-4" />
                              </div>
                              <span
                                className={`text-[11px] font-semibold tracking-wider ${isCompleted ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Requested Items Table list */}
                  <div className="bg-slate-950/40 rounded-lg p-4 border border-slate-800/60">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Requested Restock Materials
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {req.items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded"
                        >
                          <span className="text-sm text-slate-200 font-medium">
                            {item.ingredient?.name || 'Ingredient'}
                          </span>
                          <div className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-white font-bold">
                            Qty: {item.requestedQuantity}
                          </div>
                        </div>
                      ))}
                    </div>
                    {req.notes && (
                      <div className="mt-3 text-xs text-slate-500 border-t border-slate-800/80 pt-3">
                        <span className="font-semibold text-slate-400">Restock Notes:</span>{' '}
                        {req.notes}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}

            {inventoryRequests.length === 0 && (
              <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-lg text-slate-500 flex flex-col items-center justify-center">
                <span className="text-4xl">📦</span>
                <h3 className="font-bold text-slate-400 mt-3">No Restock Pipelines Active</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Create a replenishment request using the button above to request stock transfers
                  from the central warehouse supply.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Creation Replenishment Request Modal overlay */}
      {showCreateRequestModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <Card className="bg-slate-900 border-slate-800 p-6 max-w-lg w-full space-y-4 text-slate-100 shadow-2xl">
            <h3 className="text-xl font-bold border-b border-slate-800 pb-3 flex items-center gap-2">
              <span>🚚</span> Create Replenishment Request
            </h3>

            <div className="space-y-4">
              {/* Ingredient select */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Select Ingredients
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto border border-slate-800 rounded bg-slate-950 p-2.5">
                  {inventory.map((inv) => (
                    <button
                      key={inv.ingredientId}
                      onClick={() => addItemToRequest(inv.ingredientId)}
                      className="text-left text-xs text-slate-300 hover:text-white hover:bg-slate-900 p-1.5 rounded transition truncate"
                    >
                      + {inv.ingredient?.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected items with qty inputs */}
              {requestItems.length > 0 && (
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  <span className="text-xs font-bold text-slate-400">Request Items List:</span>
                  {requestItems.map((item) => {
                    const ing = inventory.find(
                      (i) => i.ingredientId === item.ingredientId,
                    )?.ingredient;
                    return (
                      <div
                        key={item.ingredientId}
                        className="flex justify-between items-center gap-4 bg-slate-950 border border-slate-800 p-2 rounded"
                      >
                        <span className="text-xs truncate font-medium text-slate-300">
                          {ing?.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`request-qty-${item.ingredientId}`}
                            type="number"
                            value={item.requestedQuantity}
                            onChange={(e) =>
                              updateItemQty(item.ingredientId, parseFloat(e.target.value) || 0)
                            }
                            className="w-16 h-8 text-xs bg-slate-900 border-slate-800 text-center font-bold"
                          />
                          <span className="text-xs text-slate-500">{ing?.unit}</span>
                          <button
                            onClick={() => removeItemFromRequest(item.ingredientId)}
                            className="text-rose-500 hover:text-rose-400 text-xs px-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Restock Notes
                </label>
                <Input
                  id="request-notes"
                  type="text"
                  placeholder="E.g. Preparing for weekend rush orders..."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="w-full bg-slate-950 border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => setShowCreateRequestModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateRequest}>
                Submit Request
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
