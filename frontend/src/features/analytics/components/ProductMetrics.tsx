import React from 'react';
import { useAppSelector } from '../../../app/store';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Badge from '../../../shared/components/ui/Badge';

export default function ProductMetrics() {
  const { product } = useAppSelector((state) => state.analytics);

  if (!product) {
    return <div className="text-white p-4">No product data available.</div>;
  }

  const { topProducts } = product;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-surface/50 border-border/50">
        <CardHeader>
          <h3 className="text-lg font-bold text-white">Top Performing Products</h3>
        </CardHeader>
        <CardContent className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#ffffff20"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                stroke="#ffffff60"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="productName"
                type="category"
                stroke="#ffffff60"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                cursor={{ fill: '#ffffff10' }}
              />
              <Bar dataKey="quantity" fill="#B22222" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-surface/50 border-border/50">
        <CardHeader>
          <h3 className="text-lg font-bold text-white">Top Products Details</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((p: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg"
              >
                <div>
                  <p className="font-bold text-white">{p.productName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Category: {p.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{p.quantity} Units</p>
                  <Badge variant="success" className="mt-1">
                    ${p.revenue.toFixed(2)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
