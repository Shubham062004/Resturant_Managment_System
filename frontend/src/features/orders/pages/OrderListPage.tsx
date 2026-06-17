import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import { Badge } from '../../../shared/components/ui/Badge';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '../../../shared/components/ui/Card';
import { fetchMyOrders } from '../store/orderSlice';

export default function OrderListPage() {
  const dispatch = useAppDispatch();
  const { orders, status } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'primary';
      case 'ACCEPTED':
        return 'info';
      case 'PREPARING':
        return 'warning';
      case 'READY':
        return 'success';
      case 'OUT_FOR_DELIVERY':
        return 'info';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      case 'REFUNDED':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold text-white mb-6">
        Your Orders
      </h1>

      {status === 'loading' && <p className="text-white">Loading orders...</p>}
      {status === 'succeeded' && orders.length === 0 && (
        <p className="text-muted-foreground">You have no orders yet.</p>
      )}

      <div className="space-y-4">
        {orders.map((order: any) => (
          <Card key={order.id} className="bg-surface/50 border-border/50">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">
                  Order #{order.orderNumber}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={getStatusColor(order.status) as any}>
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {order.items.length} item(s) from{' '}
                  {order.restaurant?.name || 'ABC'}
                </span>
                <span className="font-bold text-white">
                  ${Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Link
                to={`/orders/${order.id}`}
                className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
              >
                View Details & Track
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
