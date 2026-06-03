import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { fetchPredictions } from '../store/forecastSlice';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { BrainCircuit, TrendingUp, AlertTriangle } from 'lucide-react';
import Badge from '../../../shared/components/ui/Badge';

export default function AdminAIInsightsPage() {
  const dispatch = useAppDispatch();
  const { demand, inventory, status } = useAppSelector(state => state.forecast);

  useEffect(() => {
    // Hardcoded branchId for demo purposes
    dispatch(fetchPredictions({ branchId: 'demo-branch-1', type: 'demand' }));
    dispatch(fetchPredictions({ branchId: 'demo-branch-1', type: 'inventory' }));
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-3">
        <BrainCircuit size={32} className="text-primary" />
        <div>
          <h1 className="text-3xl font-display font-bold text-white">AI Insights Dashboard</h1>
          <p className="text-muted-foreground mt-1">Smart forecasting and operational recommendations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demand Forecasting */}
        <Card className="bg-surface/50 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2 text-white">
              <TrendingUp className="text-blue-500" />
              <h3 className="font-bold text-lg">Demand Forecasting</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'loading' ? (
              <p className="text-muted-foreground">Generating demand predictions...</p>
            ) : demand ? (
              <>
                <p className="text-sm text-muted-foreground italic mb-4">"{demand.aiAnalysis}"</p>
                <div className="space-y-3">
                  {demand.forecasts?.map((f: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                      <p className="text-white font-medium">{new Date(f.date).toLocaleDateString()}</p>
                      <div className="text-right">
                        <p className="text-primary font-bold">{f.expectedOrders} Orders Expected</p>
                        <p className="text-xs text-muted-foreground">{(f.confidence * 100).toFixed(0)}% Confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Inventory Forecasting */}
        <Card className="bg-surface/50 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2 text-white">
              <AlertTriangle className="text-warning" />
              <h3 className="font-bold text-lg">Inventory Risks</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'loading' ? (
              <p className="text-muted-foreground">Analyzing inventory levels...</p>
            ) : inventory ? (
              <>
                <p className="text-sm text-muted-foreground italic mb-4">"{inventory.aiAnalysis}"</p>
                <div className="space-y-3">
                  {inventory.risks?.map((r: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-danger/10 border border-danger/20 rounded-lg">
                      <div>
                        <p className="text-white font-bold flex items-center gap-2">
                          {r.ingredient} <Badge variant="error">Low Stock</Badge>
                        </p>
                        <p className="text-sm text-muted-foreground">{r.daysLeft} days of stock remaining</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Suggested Restock</p>
                        <p className="text-white font-bold">{r.suggestedRestockQty} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No risks detected.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
