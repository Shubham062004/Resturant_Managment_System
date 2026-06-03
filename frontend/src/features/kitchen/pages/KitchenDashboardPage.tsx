import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { fetchActiveOrders, updateOrderStatus, receiveNewOrder, receiveOrderStatusUpdate } from '../store/kitchenSlice';
import OrderTicket from '../components/OrderTicket';
import { io } from 'socket.io-client';
import { Flame, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const COLUMNS = [
  { id: 'QUEUED', title: 'New Orders' },
  { id: 'COOKING', title: 'Cooking' },
  { id: 'READY_FOR_PACKING', title: 'Ready to Pack' },
  { id: 'PACKED', title: 'Packed' },
];

export default function KitchenDashboardPage() {
  const dispatch = useAppDispatch();
  const { orders, status } = useAppSelector((state) => state.kitchen);
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    dispatch(fetchActiveOrders());

    const token = localStorage.getItem('token');
    const socket = io(API_BASE_URL, { auth: { token }, withCredentials: true });

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('kds_new_order', (kitchenOrder: any) => {
      dispatch(receiveNewOrder(kitchenOrder));
    });

    socket.on('kds_status_update', (kitchenOrder: any) => {
      dispatch(receiveOrderStatusUpdate(kitchenOrder));
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (draggedOrderId) {
      const order = orders.find((o: any) => o.id === draggedOrderId);
      if (order && order.status !== targetStatus) {
        await dispatch(updateOrderStatus({ id: draggedOrderId, status: targetStatus }));
      }
    }
    setDraggedOrderId(null);
  };

  if (status === 'loading' && orders.length === 0) {
    return <div className="p-8 text-white flex items-center justify-center min-h-screen">Loading Kitchen Board...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 md:p-6 overflow-hidden max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/50">
            <Flame className="text-orange-500 w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-display">Kitchen Display System</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Activity size={14} className={socketConnected ? 'text-green-500' : 'text-red-500'} />
                {socketConnected ? 'Live Sync Active' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/" className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/80 font-medium">
            Exit KDS
          </Link>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="flex-1 min-w-[300px] flex flex-col bg-surface/40 rounded-2xl border border-border/50 overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="p-4 border-b border-border/50 bg-card/50 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-white tracking-wide">{col.title}</h2>
              <span className="bg-secondary px-2.5 py-1 rounded-full text-xs font-bold text-muted-foreground">
                {orders.filter((o: any) => o.status === col.id).length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {orders
                .filter((o: any) => o.status === col.id)
                .map((order: any) => (
                  <OrderTicket key={order.id} order={order} onDragStart={handleDragStart} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
