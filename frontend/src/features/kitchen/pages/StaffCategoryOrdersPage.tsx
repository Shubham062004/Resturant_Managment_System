import { ChefHat, Check, Play, CheckCheck, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useAppSelector } from '../../../app/store';
import apiClient from '../../../services/apiClient';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { useToast } from '../../../shared/components/ui/Toast';

interface KitchenTask {
  id: string;
  productId: string;
  quantity: number;
  notes?: string;
  status: string;
  product: { name: string };
}

interface KitchenOrder {
  id: string;
  orderId: string;
  status: 'QUEUED' | 'COOKING' | 'READY_FOR_PACKING' | 'PACKED' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  tasks: KitchenTask[];
  order: {
    orderNumber: string;
    notes?: string;
    orderType: string;
  };
}

export default function StaffCategoryOrdersPage() {
  const toast = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignedCategory, setAssignedCategory] = useState<string>('');

  const fetchStaffCategoryOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/kitchen/staff/${user.id}/orders`);
      setOrders(response.data.data.orders || []);
      setAssignedCategory(response.data.data.assignedCategory || 'All Stations');
    } catch (error) {
      console.error('Error fetching staff category orders:', error);
      toast.error('Could not load your station queue orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffCategoryOrders();
  }, [user]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/kitchen/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Ticket status successfully changed to ${newStatus.replace('_', ' ')}.`);
      fetchStaffCategoryOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Could not change ticket status.');
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <RefreshCw className="animate-spin text-orange-500 w-10 h-10 mb-3" />
        <p className="font-display font-medium text-sm">Synchronizing Station Queue...</p>
      </div>
    );
  }

  const queuedOrders = orders.filter((o) => o.status === 'QUEUED');
  const cookingOrders = orders.filter((o) => o.status === 'COOKING');
  const readyOrders = orders.filter((o) => o.status === 'READY_FOR_PACKING');

  return (
    <div className="space-y-6 p-6 text-white bg-slate-950 min-h-screen">
      {/* Header and Station name */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/20 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/35">
            <ChefHat className="text-orange-500 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display tracking-wide uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Kitchen Station Queue
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Station category assignment:{' '}
              <span className="text-primary font-bold">{assignedCategory}</span>
            </p>
          </div>
        </div>
        <Button
          onClick={fetchStaffCategoryOrders}
          variant="outline"
          className="border-border bg-slate-900 text-slate-100 hover:bg-slate-800 flex items-center gap-1.5"
        >
          <RefreshCw size={14} /> Refresh Queue
        </Button>
      </div>

      {/* Grid containing categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* NEW TICKETS */}
        <Card className="border-border/40 bg-slate-900/30 backdrop-blur-md rounded-2xl p-5 min-h-[500px] flex flex-col">
          <div className="flex justify-between items-center pb-3 border-b border-border/20 mb-4">
            <h3 className="font-bold font-display text-sm tracking-widest text-slate-300 uppercase">
              New Tickets
            </h3>
            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold px-2 py-0.5 text-xs">
              {queuedOrders.length}
            </Badge>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4">
            {queuedOrders.length === 0 ? (
              <p className="text-slate-600 text-xs text-center italic py-8">
                No new tickets queued
              </p>
            ) : (
              queuedOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-slate-950/70 border border-border/20 rounded-xl space-y-3"
                >
                  <div className="flex justify-between">
                    <span className="font-bold text-sm text-slate-200">
                      Ticket #{order.order.orderNumber}
                    </span>
                    <Badge
                      variant={
                        order.priority === 'URGENT' || order.priority === 'HIGH'
                          ? 'error'
                          : 'neutral'
                      }
                      className="text-[9px]"
                    >
                      {order.priority}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-slate-400">
                    {order.tasks.map((t) => (
                      <div key={t.id} className="flex justify-between">
                        <span>{t.product.name}</span>
                        <span className="font-bold text-slate-200">x{t.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleUpdateStatus(order.id, 'COOKING')}
                    className="w-full bg-orange-600 text-white font-bold text-xs py-2 hover:bg-orange-700 mt-2 flex items-center justify-center gap-1.5"
                  >
                    <Play size={12} /> Start Cooking
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* COOKING */}
        <Card className="border-border/40 bg-slate-900/30 backdrop-blur-md rounded-2xl p-5 min-h-[500px] flex flex-col">
          <div className="flex justify-between items-center pb-3 border-b border-border/20 mb-4">
            <h3 className="font-bold font-display text-sm tracking-widest text-slate-300 uppercase">
              In Cook Station
            </h3>
            <Badge className="bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold px-2 py-0.5 text-xs">
              {cookingOrders.length}
            </Badge>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4">
            {cookingOrders.length === 0 ? (
              <p className="text-slate-600 text-xs text-center italic py-8">
                No active cooking tickets
              </p>
            ) : (
              cookingOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-slate-950/70 border border-border/25 rounded-xl space-y-3"
                >
                  <div className="flex justify-between">
                    <span className="font-bold text-sm text-slate-200">
                      Ticket #{order.order.orderNumber}
                    </span>
                    <Badge variant="warning" className="text-[9px]">
                      Cooking
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-slate-400">
                    {order.tasks.map((t) => (
                      <div key={t.id} className="flex justify-between">
                        <span>{t.product.name}</span>
                        <span className="font-bold text-slate-200">x{t.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleUpdateStatus(order.id, 'READY_FOR_PACKING')}
                    className="w-full bg-green-600 text-white font-bold text-xs py-2 hover:bg-green-700 mt-2 flex items-center justify-center gap-1.5"
                  >
                    <Check size={12} /> Mark Cooked
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* COOKED / READY */}
        <Card className="border-border/40 bg-slate-900/30 backdrop-blur-md rounded-2xl p-5 min-h-[500px] flex flex-col">
          <div className="flex justify-between items-center pb-3 border-b border-border/20 mb-4">
            <h3 className="font-bold font-display text-sm tracking-widest text-slate-300 uppercase">
              Ready for Packing
            </h3>
            <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold px-2 py-0.5 text-xs">
              {readyOrders.length}
            </Badge>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4">
            {readyOrders.length === 0 ? (
              <p className="text-slate-600 text-xs text-center italic py-8">No ready tickets</p>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-slate-950/70 border border-border/20 rounded-xl space-y-3"
                >
                  <div className="flex justify-between">
                    <span className="font-bold text-sm text-slate-200">
                      Ticket #{order.order.orderNumber}
                    </span>
                    <Badge variant="success" className="text-[9px]">
                      Ready
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-slate-400">
                    {order.tasks.map((t) => (
                      <div key={t.id} className="flex justify-between">
                        <span>{t.product.name}</span>
                        <span className="font-bold text-slate-200">x{t.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleUpdateStatus(order.id, 'PACKED')}
                    className="w-full bg-blue-600 text-white font-bold text-xs py-2 hover:bg-blue-700 mt-2 flex items-center justify-center gap-1.5"
                  >
                    <CheckCheck size={12} /> Complete & Pack
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
