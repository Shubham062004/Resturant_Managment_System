import React from 'react';
import { useAppSelector } from '../../../app/store';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

export default function RevenueChart() {
  const { revenueTrends } = useAppSelector((state) => state.analytics);

  if (!revenueTrends || revenueTrends.length === 0) {
    return <div className="text-white p-4">No revenue data available.</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-surface/50 border-border/50">
        <CardHeader>
          <h3 className="text-lg font-bold text-white">7-Day Revenue Trend</h3>
        </CardHeader>
        <CardContent className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrends}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B22222" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#B22222" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#ffffff60"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#ffffff60"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                itemStyle={{ color: '#FF8C42' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#B22222"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-surface/50 border-border/50">
        <CardHeader>
          <h3 className="text-lg font-bold text-white">7-Day Order Volume</h3>
        </CardHeader>
        <CardContent className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#ffffff60"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="#ffffff60" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
