import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { fetchInventory, fetchAnalytics, socketInventoryUpdate } from '../store/inventorySlice';
import { io } from 'socket.io-client';
import { Card } from '../../../shared/components/ui/Card';
import { Package, AlertTriangle, ArrowRightLeft, Trash2, ShoppingCart } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function InventoryDashboardPage() {
  const dispatch = useAppDispatch();
  const { inventory, analytics, status } = useAppSelector((state) => state.inventory);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchInventory());
    dispatch(fetchAnalytics());
  }, [dispatch]);

  useEffect(() => {
    if (status !== 'idle') return undefined;
    const token = localStorage.getItem('token');
    const newSocket = io(API_BASE_URL, { auth: { token }, withCredentials: true });

    newSocket.on('inventory-updated', (updatedInv: any) => {
      dispatch(socketInventoryUpdate(updatedInv));
    });

    return () => { newSocket.disconnect(); };
  }, [user, dispatch]);

  const lowStockItems = inventory.filter(inv => inv.availableQuantity <= (inv.ingredient?.reorderPoint || 0));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Real-time stock, suppliers, and waste analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-surface/50 border-border/50 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-primary w-5 h-5" />
            <h2 className="text-muted-foreground font-semibold">Total Stock Items</h2>
          </div>
          <p className="text-4xl font-bold text-white">{analytics.totalIngredients || 0}</p>
        </Card>
        
        <Card className="bg-surface/50 border-border/50 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-warning w-5 h-5" />
            <h2 className="text-muted-foreground font-semibold">Low Stock Alerts</h2>
          </div>
          <p className="text-4xl font-bold text-warning">{lowStockItems.length}</p>
        </Card>
        
        <Card className="bg-surface/50 border-border/50 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="text-success w-5 h-5" />
            <h2 className="text-muted-foreground font-semibold">Active POs</h2>
          </div>
          <p className="text-4xl font-bold text-white">{analytics.activePOs || 0}</p>
        </Card>

        <Card className="bg-surface/50 border-border/50 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <Trash2 className="text-destructive w-5 h-5" />
            <h2 className="text-muted-foreground font-semibold">Waste Today (Units)</h2>
          </div>
          <p className="text-4xl font-bold text-destructive">{analytics.wasteToday || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white">Current Stock Levels</h2>
          {status === 'loading' ? (
            <p className="text-muted-foreground">Loading inventory...</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/50 bg-surface/30">
              <table className="w-full text-left text-sm text-muted-foreground">
                <thead className="bg-surface border-b border-border/50 text-white">
                  <tr>
                    <th className="px-6 py-4 font-medium">Ingredient</th>
                    <th className="px-6 py-4 font-medium">SKU</th>
                    <th className="px-6 py-4 font-medium">Quantity</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {inventory.map((inv, i) => {
                    const isLow = inv.availableQuantity <= (inv.ingredient?.reorderPoint || 0);
                    return (
                      <tr key={inv.id || i} className="hover:bg-surface/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{inv.ingredient?.name || 'Unknown'}</td>
                        <td className="px-6 py-4">{inv.ingredient?.sku || '-'}</td>
                        <td className="px-6 py-4 font-medium">
                          {inv.availableQuantity.toFixed(2)} {inv.ingredient?.unit}
                        </td>
                        <td className="px-6 py-4">
                          {isLow ? (
                            <Badge variant="warning">Low Stock</Badge>
                          ) : (
                            <Badge variant="success">Optimal</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center">No inventory records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          <div className="space-y-4">
            <Card className="bg-surface/50 border-border/50 p-4 hover:border-primary/50 cursor-pointer transition-colors flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-lg"><ShoppingCart className="text-primary w-5 h-5" /></div>
              <div>
                <h3 className="text-white font-medium">New Purchase Order</h3>
                <p className="text-xs text-muted-foreground">Order from supplier</p>
              </div>
            </Card>
            <Card className="bg-surface/50 border-border/50 p-4 hover:border-primary/50 cursor-pointer transition-colors flex items-center gap-4">
              <div className="bg-warning/20 p-3 rounded-lg"><ArrowRightLeft className="text-warning w-5 h-5" /></div>
              <div>
                <h3 className="text-white font-medium">Transfer Stock</h3>
                <p className="text-xs text-muted-foreground">Move items between branches</p>
              </div>
            </Card>
            <Card className="bg-surface/50 border-border/50 p-4 hover:border-primary/50 cursor-pointer transition-colors flex items-center gap-4">
              <div className="bg-destructive/20 p-3 rounded-lg"><Trash2 className="text-destructive w-5 h-5" /></div>
              <div>
                <h3 className="text-white font-medium">Log Waste</h3>
                <p className="text-xs text-muted-foreground">Record spoiled/damaged items</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
