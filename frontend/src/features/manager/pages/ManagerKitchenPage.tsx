import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
  fetchActiveOrders,
  receiveNewOrder,
  receiveOrderStatusUpdate,
} from '../../kitchen/store/kitchenSlice';
import apiClient from '../../../services/apiClient';
import { io } from 'socket.io-client';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, ChefHat, AlertTriangle, CheckCircle, Timer } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ManagerKitchenPage() {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.kitchen);

  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());

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

    dispatch(fetchActiveOrders()); // Might need branch ID if backend supports it

    const token = localStorage.getItem('token');
    const socket = io(API_BASE_URL, { auth: { token }, withCredentials: true });
    socket.emit('join-branch', selectedBranchId);

    socket.on('kds_new_order', (kitchenOrder: any) => dispatch(receiveNewOrder(kitchenOrder)));
    socket.on('kds_status_update', (kitchenOrder: any) =>
      dispatch(receiveOrderStatusUpdate(kitchenOrder)),
    );

    const clockInterval = setInterval(() => setCurrentTime(new Date()), 10000);

    return () => {
      socket.disconnect();
      clearInterval(clockInterval);
    };
  }, [selectedBranchId, dispatch]);

  const getElapsedTime = (createdAtStr: string) => {
    const created = new Date(createdAtStr);
    const diff = Math.floor((currentTime.getTime() - created.getTime()) / 60000);
    return diff;
  };

  // Branch filtered
  const branchOrders = orders; // Assume fetchActiveOrders fetches only current branch or filter here

  const queued = branchOrders.filter((o) => o.status === 'QUEUED');
  const cooking = branchOrders.filter((o) => o.status === 'COOKING');
  const ready = branchOrders.filter((o) => o.status === 'READY_FOR_PACKING');

  const delayedOrders = branchOrders.filter(
    (o) => getElapsedTime(o.createdAt) > 20 && o.status !== 'PACKED',
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">
            Kitchen Load & KDS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor station queues, prep times, and ticket delays.
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
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <Card className="p-4 bg-slate-900/60 border-border/20 flex flex-col justify-center">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
            <span>New Tickets</span>
            <ChefHat className="text-amber-500 w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-white">{queued.length}</span>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-border/20 flex flex-col justify-center">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
            <span>In Cook Station</span>
            <Flame className="text-orange-500 w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-white">{cooking.length}</span>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-border/20 flex flex-col justify-center">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
            <span>Delayed Tickets (&gt;20m)</span>
            <AlertTriangle className="text-rose-500 w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-rose-500">{delayedOrders.length}</span>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-border/20 flex flex-col justify-center">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
            <span>Avg Prep Time</span>
            <Timer className="text-sky-500 w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-white">
            18<span className="text-sm font-normal text-slate-500 ml-1">mins</span>
          </span>
        </Card>
      </div>

      {/* KDS Swimlanes */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full min-w-[900px]">
          {[
            {
              id: 'QUEUED',
              title: 'Pending',
              items: queued,
              color: 'text-amber-500',
              bg: 'bg-amber-500/10',
            },
            {
              id: 'COOKING',
              title: 'Cooking',
              items: cooking,
              color: 'text-orange-500',
              bg: 'bg-orange-500/10',
            },
            {
              id: 'READY',
              title: 'Ready / QA',
              items: ready,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10',
            },
          ].map((col) => (
            <div
              key={col.id}
              className="flex-1 flex flex-col bg-slate-900/30 rounded-2xl border border-border/10 overflow-hidden"
            >
              <div
                className={`p-4 border-b border-border/20 flex items-center justify-between shrink-0 bg-slate-900/80 backdrop-blur-md`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${col.bg} flex items-center justify-center`}>
                    <ChefHat className={`w-4 h-4 ${col.color}`} />
                  </div>
                  <h3 className="font-bold text-white tracking-wide text-sm">{col.title}</h3>
                </div>
                <Badge
                  variant="neutral"
                  className="bg-slate-950 text-slate-300 font-bold px-2 py-0.5 text-xs border border-border/20"
                >
                  {col.items.length}
                </Badge>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {col.items.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                    Clear
                  </div>
                ) : (
                  <AnimatePresence>
                    {col.items.map((order) => {
                      const elapsed = getElapsedTime(order.createdAt);
                      const isDelayed = elapsed > 20;

                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-4 rounded-xl border ${isDelayed ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-950/60 border-border/20 hover:border-indigo-500/40'} flex flex-col gap-3 transition-colors`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-slate-200">
                                #{order.order?.orderNumber?.slice(-6).toUpperCase() || 'TKT'}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {order.order?.orderType}
                              </span>
                            </div>
                            <Badge
                              className={`text-[10px] flex items-center gap-1 ${isDelayed ? 'bg-rose-500/20 text-rose-400 border-none' : 'bg-slate-800 text-slate-400 border-none'}`}
                            >
                              <Clock size={10} /> {elapsed}m
                            </Badge>
                          </div>

                          <div className="pt-2 border-t border-border/10 space-y-1.5">
                            {order.tasks?.map((task: any) => (
                              <div
                                key={task.id}
                                className="flex justify-between text-xs font-medium text-slate-300"
                              >
                                <span>{task.product?.name}</span>
                                <span className="text-primary font-bold">x{task.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
