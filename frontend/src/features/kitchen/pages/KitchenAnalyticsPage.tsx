import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import { BarChart3, ChefHat, Clock, TrendingUp } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import MainLayout from '../../../layouts/MainLayout';

export default function KitchenAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiClient.get('/kitchen/analytics');
        setData(response.data.data.analytics);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8 text-white">Loading Analytics...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-display font-bold text-white mb-8">Kitchen Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-primary font-medium mb-1">Total Orders</p>
                  <h3 className="text-3xl font-bold text-white">{data?.totalOrders || 0}</h3>
                </div>
                <div className="p-3 bg-primary/20 rounded-xl">
                  <BarChart3 className="text-primary w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-500 font-medium mb-1">Completed</p>
                  <h3 className="text-3xl font-bold text-white">{data?.completedOrders || 0}</h3>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <ChefHat className="text-green-500 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-500 font-medium mb-1">Avg Prep Time</p>
                  <h3 className="text-3xl font-bold text-white">
                    {data?.metrics?.[0]?.avgPreparationTime || 0} min
                  </h3>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Clock className="text-blue-500 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-500/10 border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-orange-500 font-medium mb-1">Efficiency Score</p>
                  <h3 className="text-3xl font-bold text-white">94%</h3>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <TrendingUp className="text-orange-500 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
