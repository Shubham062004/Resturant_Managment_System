import { motion } from 'framer-motion';
import { Flame, Clock, Layers } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import { Badge } from '../../../shared/components/ui/Badge';
import {
  fetchActiveOrders,
  receiveNewOrder,
  receiveOrderStatusUpdate,
} from '../store/kitchenSlice';


const API_BASE_URL = import.meta.env.VITE_API_URL;

const COLUMNS = [
  {
    id: 'QUEUED',
    title: 'New Tickets',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'COOKING',
    title: 'In Cook Station',
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  },
  {
    id: 'READY_FOR_PACKING',
    title: 'Ready to Pack',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'PACKED',
    title: 'Completed / Packed',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
];

export default function KitchenMonitorPage() {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.kitchen);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    dispatch(fetchActiveOrders());

    const token = localStorage.getItem('token');
    const socket = io(API_BASE_URL, { auth: { token }, withCredentials: true });

    socket.on('kds_new_order', (kitchenOrder: any) => {
      dispatch(receiveNewOrder(kitchenOrder));
    });

    socket.on('kds_status_update', (kitchenOrder: any) => {
      dispatch(receiveOrderStatusUpdate(kitchenOrder));
    });

    // Clock update interval for live ticket aging timers
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);

    return () => {
      socket.disconnect();
      clearInterval(clockInterval);
    };
  }, [dispatch]);

  const getElapsedTime = (createdAtStr: string) => {
    const created = new Date(createdAtStr);
    const diff = Math.floor((currentTime.getTime() - created.getTime()) / 60000); // diff in minutes
    if (diff < 0) return 'Just now';
    return `${diff}m ago`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col p-6 overflow-hidden max-h-screen text-white">
      {/* KDS Monitor Header */}
      <div className="flex items-center justify-between mb-6 shrink-0 border-b border-border/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 flex items-center justify-center border border-orange-500/30">
            <Flame className="text-orange-500 w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold font-display tracking-wide uppercase bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
              Kitchen Queue Monitor
            </h1>
            <p className="text-xs text-slate-400 font-sans tracking-wide">
              Live kitchen throughput & preparation stages monitor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900 border border-border/20 rounded-xl px-4 py-2">
          <Layers size={16} className="text-primary" />
          <span className="text-xs font-semibold font-sans tracking-wider">
            Total Tickets: {orders.length}
          </span>
        </div>
      </div>

      {/* Grid Monitor Columns */}
      <div className="flex-1 flex gap-5 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.id);
          return (
            <div
              key={col.id}
              className="flex-1 min-w-[320px] flex flex-col bg-slate-900/30 rounded-2xl border border-border/40 overflow-hidden"
            >
              {/* Column Header */}
              <div
                className={`p-4 border-b border-border/30 flex justify-between items-center shrink-0 ${col.color}`}
              >
                <h2 className="font-extrabold font-display tracking-widest text-sm uppercase">
                  {col.title}
                </h2>
                <Badge className="bg-slate-950 text-white border border-border/10 font-bold px-2.5 py-1 text-xs">
                  {colOrders.length}
                </Badge>
              </div>

              {/* Column Body (Scrollable Tickets list) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {colOrders.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                    No active tickets
                  </div>
                ) : (
                  colOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`glass-card p-4 rounded-xl border border-border/25 space-y-3 bg-slate-950/60 transition-shadow hover:shadow-lg`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm font-black font-display tracking-wide text-slate-200">
                            Ticket #{order.order?.orderNumber || '0000'}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">
                            Type: {order.order?.orderType.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 font-sans text-xs">
                          <Clock size={12} className="text-slate-400" />
                          <span>{getElapsedTime(order.createdAt)}</span>
                        </div>
                      </div>

                      {/* Task items list */}
                      <div className="border-t border-border/10 pt-2 space-y-2">
                        {order.tasks?.map((task) => (
                          <div key={task.id} className="flex justify-between text-xs font-sans">
                            <span className="text-slate-300 font-medium">{task.product?.name}</span>
                            <span className="text-primary font-bold">x{task.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Notes if any */}
                      {order.order?.notes && (
                        <div className="bg-slate-900/50 p-2 rounded-lg border border-border/10">
                          <p className="text-[10px] text-yellow-400 italic">
                            * Note: {order.order.notes}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
