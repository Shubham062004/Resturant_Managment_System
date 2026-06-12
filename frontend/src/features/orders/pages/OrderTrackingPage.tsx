import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { fetchOrderById, cancelOrder } from '../store/orderSlice';
import {
  setConnected,
  updateLiveStatus,
  updateDriverLocation,
  addLog,
} from '../store/trackingSlice';
import { io } from 'socket.io-client';
import { Card, CardHeader, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { CheckCircle2, Clock, MapPin, Package, ShoppingBag, Truck, XCircle } from 'lucide-react';
import { DeliveryTrackingMap } from '../../delivery/components/DeliveryTrackingMap';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = API_BASE_URL;

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentOrder, status } = useAppSelector((state) => state.orders);
  const { liveStatus, connected, driverLocation } = useAppSelector((state) => state.tracking);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (!currentOrder) return undefined;

    // Initialize Socket.io
    const token = localStorage.getItem('token'); // Fallback if using cookie
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      dispatch(setConnected(true));
      newSocket.emit('join_order_room', currentOrder.id);
      dispatch(addLog('Connected to tracking server.'));
    });

    newSocket.on('order_status_update', (updatedOrder: any) => {
      dispatch(updateLiveStatus(updatedOrder.status));
    });

    newSocket.on('driver_location_update', (location: any) => {
      dispatch(
        updateDriverLocation({ latitude: location.latitude, longitude: location.longitude }),
      );
    });

    newSocket.on('disconnect', () => {
      dispatch(setConnected(false));
    });

    return () => {
      newSocket.emit('leave_order_room', currentOrder.id);
      newSocket.disconnect();
    };
  }, [currentOrder, dispatch]);

  const handleCancel = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await dispatch(cancelOrder(id));
    }
  };

  if (status === 'loading') return <div className="p-8 text-white">Loading...</div>;
  if (!currentOrder) return <div className="p-8 text-white">Order not found.</div>;

  const displayStatus = liveStatus || currentOrder.status;

  const timelineSteps = [
    { status: 'PLACED', label: 'Order Placed', icon: ShoppingBag },
    { status: 'ACCEPTED', label: 'Accepted by Restaurant', icon: CheckCircle2 },
    { status: 'PREPARING', label: 'Preparing', icon: Clock },
    { status: 'READY', label: 'Ready for Delivery', icon: Package },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { status: 'DELIVERED', label: 'Delivered', icon: MapPin },
  ];

  const currentStepIndex = timelineSteps.findIndex((step) => step.status === displayStatus);
  const isCancelled = displayStatus === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-white">
          Tracking Order #{currentOrder.orderNumber}
        </h1>
        <Badge variant={connected ? 'success' : 'warning'}>
          {connected ? 'Live Sync Active' : 'Connecting...'}
        </Badge>
      </div>

      <Card className="bg-surface/50 border-border/50 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Order Status: <span className="text-primary">{displayStatus}</span>
            </h2>
            <p className="text-muted-foreground text-sm">
              Placed on {new Date(currentOrder.createdAt).toLocaleString()}
            </p>
          </div>
          {displayStatus === 'PLACED' && (
            <Button variant="danger" onClick={handleCancel}>
              Cancel Order
            </Button>
          )}
        </div>

        {!isCancelled ? (
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border/50 -translate-x-1/2 hidden md:block"></div>
            <div className="space-y-6 md:space-y-0 md:flex md:justify-between relative">
              {timelineSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isActive = index === currentStepIndex;
                const Icon = step.icon;

                return (
                  <div
                    key={step.status}
                    className="flex flex-row md:flex-col items-center gap-4 md:gap-2 z-10 relative"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        isCompleted
                          ? 'bg-primary border-primary text-white'
                          : 'bg-surface border-border/50 text-muted-foreground'
                      } ${isActive ? 'ring-4 ring-primary/30' : ''}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="md:text-center">
                      <p
                        className={`font-semibold text-sm ${isCompleted ? 'text-white' : 'text-muted-foreground'}`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-4">
            <XCircle className="text-danger w-8 h-8" />
            <div>
              <h3 className="font-bold text-white">Order Cancelled</h3>
              <p className="text-muted-foreground text-sm">
                Your order has been cancelled and a refund has been initiated.
              </p>
            </div>
          </div>
        )}
      </Card>

      {(displayStatus === 'OUT_FOR_DELIVERY' || displayStatus === 'PICKED_UP') && (
        <Card className="bg-surface/50 border-border/50">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Live Driver Location</h3>
          </CardHeader>
          <CardContent className="p-0 border-t border-border/50">
            <DeliveryTrackingMap
              driverLocation={driverLocation || undefined}
              destination={
                (currentOrder as any)?.address
                  ? {
                      latitude: (currentOrder as any).address.latitude || 0,
                      longitude: (currentOrder as any).address.longitude || 0,
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      )}

      <Card className="bg-surface/50 border-border/50">
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Order Items</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentOrder.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-white">
                {item.quantity} x {item.product.name}
              </span>
              <span className="text-muted-foreground">
                ₹{(Number(item.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="border-t border-border/50 pt-4 flex justify-between font-bold text-white">
            <span>Total</span>
            <span>₹{Number(currentOrder.totalAmount).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
