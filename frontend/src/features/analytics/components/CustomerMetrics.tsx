import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import { useAppSelector } from '../../../app/store';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';

export default function CustomerMetrics() {
  const { customer } = useAppSelector((state) => state.analytics);

  if (!customer) {
    return <div className="text-white p-4">No customer data available.</div>;
  }

  const retentionData = [
    { name: 'New Customers', value: customer.retention.new },
    { name: 'Returning', value: customer.retention.returning },
  ];

  const demoData = customer.demographics.map((d: any) => ({
    name: d.segment,
    value: d.percentage,
  }));

  const COLORS = ['#FF8C42', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-surface/50 border-border/50">
        <CardHeader>
          <h3 className="text-lg font-bold text-white">Customer Retention</h3>
        </CardHeader>
        <CardContent className="h-80 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={retentionData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {retentionData.map((entry: any, index: any) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-surface/50 border-border/50">
        <CardHeader>
          <h3 className="text-lg font-bold text-white">Demographics</h3>
        </CardHeader>
        <CardContent className="h-80 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={demoData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {demoData.map((entry: any, index: any) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
