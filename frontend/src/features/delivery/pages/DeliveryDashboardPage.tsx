import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
  fetchAssignedOrders,
  acceptOrder,
  pickupOrder,
  deliverOrder,
  socketAssignmentUpdate,
  DeliveryAssignment,
} from '../store/deliverySlice';
import { io } from 'socket.io-client';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Package, Navigation, CheckCircle2 } from 'lucide-react';
import { DeliveryTrackingMap } from '../components/DeliveryTrackingMap';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function DeliveryDashboardPage() {
  const dispatch = useAppDispatch();
  const { assignments, status } = useAppSelector((state) => state.delivery);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAssignedOrders());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return undefined;

    const token = localStorage.getItem('token');
    const newSocket = io(API_BASE_URL, { auth: { token }, withCredentials: true });

    newSocket.on('new_assignment', (assignment: DeliveryAssignment) => {
      dispatch(socketAssignmentUpdate(assignment));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, dispatch]);

  const handleAction = async (assignment: DeliveryAssignment) => {
    if (assignment.status === 'ASSIGNED') {
      await dispatch(acceptOrder(assignment.orderId));
    } else if (assignment.status === 'ACCEPTED' || assignment.status === 'AT_RESTAURANT') {
      await dispatch(pickupOrder(assignment.orderId));
    } else if (assignment.status === 'PICKED_UP' || assignment.status === 'OUT_FOR_DELIVERY') {
      await dispatch(
        deliverOrder({ orderId: assignment.orderId, proof: { notes: 'Delivered safely' } }),
      );
    }
  };

  const getButtonProps = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return { label: 'Accept Order', icon: CheckCircle2, variant: 'primary' as const };
      case 'ACCEPTED':
      case 'AT_RESTAURANT':
        return { label: 'Confirm Pickup', icon: Package, variant: 'outline' as const };
      case 'PICKED_UP':
      case 'OUT_FOR_DELIVERY':
        return { label: 'Mark Delivered', icon: Navigation, variant: 'success' as const };
      default:
        return { label: 'Completed', icon: CheckCircle2, variant: 'secondary' as const };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Delivery Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your active and pending assignments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white">Active Assignments</h2>
          {status === 'loading' ? (
            <p className="text-muted-foreground">Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <Card className="bg-surface/50 border-border/50 p-12 text-center border-dashed">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Active Orders</h3>
              <p className="text-muted-foreground">Waiting for new assignments...</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments
                .filter((a) => !['DELIVERED', 'FAILED'].includes(a.status))
                .map((assignment) => {
                  const btnProps = getButtonProps(assignment.status);
                  const BtnIcon = btnProps.icon;
                  return (
                    <Card
                      key={assignment.id}
                      className="bg-surface/50 border-border/50 p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:border-primary/50 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-white text-lg">
                            Order #{assignment.order.orderNumber}
                          </h3>
                          <Badge variant="info">{assignment.status.replace(/_/g, ' ')}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-white">Pickup:</span>{' '}
                          {assignment.order.restaurant?.name || 'Oven Xpress Kitchen'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-white">Dropoff:</span>{' '}
                          {assignment.order.address?.addressLine1}, {assignment.order.address?.city}
                        </p>
                      </div>
                      <Button
                        variant={btnProps.variant}
                        onClick={() => handleAction(assignment)}
                        className="w-full md:w-auto shrink-0 shadow-lg"
                      >
                        <BtnIcon className="w-4 h-4 mr-2" />
                        {btnProps.label}
                      </Button>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Live Navigation</h2>
          <DeliveryTrackingMap
            driverLocation={{ latitude: 0, longitude: 0 }}
            destination={{ latitude: 1, longitude: 1 }}
          />
        </div>
      </div>
    </div>
  );
}
