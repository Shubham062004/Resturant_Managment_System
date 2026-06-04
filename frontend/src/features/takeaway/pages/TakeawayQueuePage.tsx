import React, { useEffect, useState } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resturant-managment-system-qkow.onrender.com';

interface TakeawayOrder {
  id: string;
  orderNumber: string;
  status: string;
  customer?: any;
  items: any[];
}

export default function TakeawayQueuePage() {
  const [orders, setOrders] = useState<TakeawayOrder[]>([]);
  const branchId = 'default-branch-id';

  useEffect(() => {
    fetchOrders();

    const socket = io(API_BASE_URL, { withCredentials: true });
    socket.emit('join-branch', branchId);

    // Mock real-time logic for demonstration
    socket.on('pickup-ready', () => {
      fetchOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/orders?branchId=${branchId}&orderType=PICKUP`,
        {
          withCredentials: true,
        },
      );
      setOrders(response.data.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch takeaway orders', err);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/v1/orders/${id}/status`,
        { status },
        { withCredentials: true },
      );
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const columns = [
    { title: 'New', status: 'PLACED' },
    { title: 'Preparing', status: 'PREPARING' },
    { title: 'Ready', status: 'READY_FOR_PICKUP' },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Takeaway Pickup Queue</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.status} className="bg-slate-200 rounded-xl p-4 min-h-[500px]">
            <h2 className="text-lg font-bold text-slate-700 mb-4">{col.title}</h2>
            {orders
              .filter((o) => o.status === col.status)
              .map((order) => (
                <Card key={order.id} className="p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">#{order.orderNumber.substring(0, 8)}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    {order.customer?.firstName} {order.customer?.lastName}
                  </p>

                  {col.status === 'PLACED' && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                    >
                      Start Preparing
                    </Button>
                  )}
                  {col.status === 'PREPARING' && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => updateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                    >
                      Mark Ready
                    </Button>
                  )}
                  {col.status === 'READY_FOR_PICKUP' && (
                    <Button
                      variant="success"
                      className="w-full"
                      onClick={() => updateOrderStatus(order.id, 'PICKED_UP')}
                    >
                      Handed Over
                    </Button>
                  )}
                </Card>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
