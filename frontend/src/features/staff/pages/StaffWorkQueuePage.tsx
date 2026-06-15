import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat,
  Clock,
  UtensilsCrossed,
  CheckCircle,
  Play,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import apiClient from '../../../services/apiClient';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function StaffWorkQueuePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Since we don't have assignedCategory in DB yet, we simulate it here.
  // In a real app, `assignedCategory` comes directly from the logged-in user profile.
  const [assignedCategory, setAssignedCategory] = useState<string>('ALL');

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // 1. Fetch active orders
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Note: The backend should ideally filter tasks specifically for the chef's category
        // For demonstration, we fetch all active orders and filter locally.
        const res = await apiClient.get('/orders/active');
        setOrders(res.data.data || []);
      } catch (err) {
        console.error('Failed to load active orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // 2. Setup WebSocket for live order updates
    const token = localStorage.getItem('token');
    const socket = io(API_BASE_URL, { auth: { token }, withCredentials: true });

    // Listen for new orders or status updates
    socket.on('kds_new_order', (kitchenOrder: any) => {
      setOrders((prev) => [kitchenOrder, ...prev]);
    });

    socket.on('kds_status_update', (kitchenOrder: any) => {
      setOrders((prev) => prev.map((o) => (o.id === kitchenOrder.id ? kitchenOrder : o)));
    });

    // 3. Setup interval for live timers
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 10000);

    return () => {
      socket.disconnect();
      clearInterval(clockInterval);
    };
  }, []);

  // Format Elapsed Time
  const getElapsedTime = (createdAtStr: string) => {
    const created = new Date(createdAtStr);
    const diff = Math.floor((currentTime.getTime() - created.getTime()) / 60000);
    return diff;
  };

  // Status Action Handler
  const handleUpdateItemStatus = async (orderId: string, taskId: string, newStatus: string) => {
    try {
      // Optimistic update
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            tasks: order.tasks.map((task: any) =>
              task.id === taskId ? { ...task, status: newStatus } : task,
            ),
          };
        }),
      );

      // In real app, call API to update item status
      // await apiClient.patch(`/kitchen/tasks/${taskId}/status`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Flatten and Filter Tasks based on assigned category
  const assignedTasks: any[] = [];

  orders.forEach((order) => {
    // Determine order-level elapsed time
    const elapsed = getElapsedTime(order.createdAt);

    order.tasks?.forEach((task: any) => {
      // Category filtering:
      // Assuming product.category exists. For mock, if assignedCategory === 'ALL', show all.
      // Else, we try to match category. If category is missing, we randomly mock it or hide it.
      const taskCategory = task.product?.category?.name?.toUpperCase() || 'UNKNOWN';

      if (assignedCategory === 'ALL' || taskCategory.includes(assignedCategory)) {
        // Skip packed/delivered items
        if (task.status !== 'PACKED' && task.status !== 'DELIVERED') {
          assignedTasks.push({
            ...task,
            orderId: order.id,
            orderNumber: order.order?.orderNumber || order.id.slice(-6).toUpperCase(),
            orderType: order.order?.orderType,
            tableNumber: order.order?.tableNumber,
            customerName: order.order?.user?.firstName || 'Walk-in',
            notes: order.order?.notes,
            priority: elapsed > 20 ? 'HIGH' : 'NORMAL',
            elapsed,
            orderCreatedAt: order.createdAt,
          });
        }
      }
    });
  });

  // Sort tasks: High priority first, then older tasks first
  assignedTasks.sort((a, b) => b.elapsed - a.elapsed);

  // Group by status for counters
  const pendingCount = assignedTasks.filter((t) => t.status === 'PENDING').length;
  const preparingCount = assignedTasks.filter((t) => t.status === 'COOKING').length;
  const readyCount = assignedTasks.filter((t) => t.status === 'READY').length;

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Work Queue</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage and prepare items assigned to your station.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-border/30 rounded-xl px-4 py-2">
            <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">
              Station:
            </span>
            <select
              value={assignedCategory}
              onChange={(e) => setAssignedCategory(e.target.value)}
              className="bg-transparent text-sm font-bold text-orange-500 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="ALL" className="bg-slate-900 text-white">
                ALL STATIONS
              </option>
              <option value="PIZZA" className="bg-slate-900 text-white">
                PIZZA
              </option>
              <option value="BURGERS" className="bg-slate-900 text-white">
                BURGERS
              </option>
              <option value="DESSERT" className="bg-slate-900 text-white">
                DESSERTS
              </option>
              <option value="DRINKS" className="bg-slate-900 text-white">
                BEVERAGES
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <Card className="p-4 bg-slate-900/60 border-border/20 flex flex-col justify-center">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
            <span>Pending</span>
            <Clock className="text-slate-500 w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-white">{pendingCount}</span>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-border/20 flex flex-col justify-center border-orange-500/30 bg-orange-500/5">
          <div className="flex justify-between items-center text-xs font-semibold text-orange-500 mb-2">
            <span>Preparing</span>
            <Flame className="text-orange-500 w-4 h-4 animate-pulse" />
          </div>
          <span className="text-2xl font-bold text-orange-500">{preparingCount}</span>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-border/20 flex flex-col justify-center">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
            <span>Ready for QA</span>
            <CheckCircle className="text-emerald-500 w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-white">{readyCount}</span>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-border/20 flex flex-col justify-center">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
            <span>Avg Prep Time</span>
            <UtensilsCrossed className="text-sky-500 w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-white">
            12<span className="text-sm text-slate-500 ml-1 font-normal">mins</span>
          </span>
        </Card>
      </div>

      {/* Task Queue List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-900/50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : assignedTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
            <ChefHat size={64} className="mb-4" />
            <h2 className="text-xl font-bold text-white">Station is Clear!</h2>
            <p className="text-sm mt-1">No items pending for {assignedCategory} station.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {assignedTasks.map((task, idx) => (
                <motion.div
                  key={`${task.orderId}-${task.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`p-5 rounded-2xl border flex flex-col gap-4 shadow-lg transition-colors ${
                    task.status === 'COOKING'
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : task.priority === 'HIGH'
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : 'bg-slate-900/80 border-border/20'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-200 font-mono">
                          #{task.orderNumber}
                        </span>
                        <Badge
                          variant="neutral"
                          className="text-[9px] bg-slate-800 text-slate-300 border-none px-1.5 py-0.5"
                        >
                          {task.orderType?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">
                        {task.tableNumber ? `Table ${task.tableNumber}` : task.customerName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {task.priority === 'HIGH' && (
                        <AlertTriangle size={14} className="text-rose-500 animate-pulse" />
                      )}
                      <Badge
                        className={`text-[10px] font-bold px-2 flex items-center gap-1 border-none ${
                          task.elapsed > 20
                            ? 'bg-rose-500/20 text-rose-400'
                            : task.elapsed > 10
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Clock size={10} /> {task.elapsed}m
                      </Badge>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="py-4 border-y border-border/10 flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {task.product?.name || 'Unknown Item'}
                      </h3>
                      <span className="text-xl font-black text-orange-500">x{task.quantity}</span>
                    </div>

                    {task.notes && (
                      <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-xs text-yellow-500 font-medium flex items-center gap-1">
                          <AlertTriangle size={12} /> {task.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Actions */}
                  <div className="pt-1 flex gap-2">
                    {(!task.status || task.status === 'PENDING') && (
                      <Button
                        className="w-full bg-slate-800 hover:bg-orange-600 text-white border-none font-bold"
                        onClick={() => handleUpdateItemStatus(task.orderId, task.id, 'COOKING')}
                      >
                        <Play size={16} className="mr-2" /> Start Preparing
                      </Button>
                    )}

                    {task.status === 'COOKING' && (
                      <Button
                        className="w-full bg-orange-600 hover:bg-emerald-600 text-white border-none font-bold animate-pulse"
                        onClick={() => handleUpdateItemStatus(task.orderId, task.id, 'READY')}
                      >
                        <CheckCircle size={16} className="mr-2" /> Mark Ready
                      </Button>
                    )}

                    {task.status === 'READY' && (
                      <Button
                        disabled
                        className="w-full bg-emerald-500/20 text-emerald-500 border-emerald-500/30 font-bold"
                      >
                        <CheckCircle size={16} className="mr-2" /> Waiting for QA
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
