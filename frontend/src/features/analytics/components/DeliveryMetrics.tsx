import React from 'react';
import { useAppSelector } from '../../../app/store';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import Avatar from '../../../shared/components/ui/Avatar';

export default function DeliveryMetrics() {
  const { delivery } = useAppSelector(state => state.analytics);

  if (!delivery) {
    return <div className="text-white p-4">No delivery data available.</div>;
  }

  const { averageDeliveryTime, lateOrdersCount, topDrivers } = delivery;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-surface/50 border-border/50 md:col-span-1 h-fit">
        <CardHeader>
          <h3 className="text-lg font-bold text-white">Delivery KPIs</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-muted-foreground mb-1 text-sm">Average Delivery Time</p>
            <h2 className="text-4xl font-display font-bold text-success">{averageDeliveryTime}</h2>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm">Late Orders This Week</p>
            <h2 className="text-4xl font-display font-bold text-danger">{lateOrdersCount}</h2>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface/50 border-border/50 md:col-span-2">
        <CardHeader>
          <h3 className="text-lg font-bold text-white">Top Performing Drivers</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topDrivers.map((driver: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-4">
                  <Avatar name={driver.name} />
                  <div>
                    <h4 className="font-bold text-white">{driver.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Fleet Runner</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-right">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Completed</p>
                    <p className="font-bold text-white">{driver.completed} orders</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Rating</p>
                    <p className="font-bold text-warning flex items-center justify-end gap-1">
                      ★ {driver.rating}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
