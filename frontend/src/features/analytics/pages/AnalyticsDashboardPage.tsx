import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
  fetchExecutiveSummary,
  fetchSalesTrends,
  fetchCustomerAnalytics,
  fetchProductAnalytics,
  fetchDeliveryAnalytics,
} from '../store/analyticsSlice';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import Tabs from '../../../shared/components/ui/Tabs';
import RevenueChart from '../components/RevenueChart';
import CustomerMetrics from '../components/CustomerMetrics';
import ProductMetrics from '../components/ProductMetrics';
import DeliveryMetrics from '../components/DeliveryMetrics';
export default function AnalyticsDashboardPage() {
  const dispatch = useAppDispatch();
  const { executive, status } = useAppSelector((state) => state.analytics);
  const [activeTab, setActiveTab] = useState('executive');

  useEffect(() => {
    dispatch(fetchExecutiveSummary());
    dispatch(fetchSalesTrends());
    dispatch(fetchCustomerAnalytics());
    dispatch(fetchProductAnalytics());
    dispatch(fetchDeliveryAnalytics());
  }, [dispatch]);

  const tabs = [
    {
      id: 'executive',
      label: 'Executive Summary',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-6">
                <p className="text-primary font-medium mb-1">{"Today's Revenue"}</p>
                <h3 className="text-3xl font-bold text-white">
                  ${executive?.revenueToday?.toFixed(2) || '0.00'}
                </h3>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="p-6">
                <p className="text-blue-500 font-medium mb-1">Orders Today</p>
                <h3 className="text-3xl font-bold text-white">
                  {executive?.totalOrdersToday || 0}
                </h3>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="p-6">
                <p className="text-green-500 font-medium mb-1">Active Staff</p>
                <h3 className="text-3xl font-bold text-white">
                  {executive?.activeStaffCount || 0}
                </h3>
              </CardContent>
            </Card>
            <Card className="bg-orange-500/10 border-orange-500/20">
              <CardContent className="p-6">
                <p className="text-orange-500 font-medium mb-1">Active Customers</p>
                <h3 className="text-3xl font-bold text-white">{executive?.activeCustomers || 0}</h3>
              </CardContent>
            </Card>
          </div>
          <RevenueChart />
        </div>
      ),
    },
    {
      id: 'revenue',
      label: 'Revenue & Sales',
      content: <RevenueChart />,
    },
    {
      id: 'customers',
      label: 'Customer Insights',
      content: <CustomerMetrics />,
    },
    {
      id: 'products',
      label: 'Products & Inventory',
      content: <ProductMetrics />,
    },
    {
      id: 'delivery',
      label: 'Delivery Performance',
      content: <DeliveryMetrics />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Analytics & Business Intelligence
          </h1>
          <p className="text-muted-foreground">
            Comprehensive reporting and data visualization engine.
          </p>
        </div>
      </div>

      {status === 'loading' && !executive ? (
        <div className="text-white">Loading BI Dashboard...</div>
      ) : (
        <Tabs tabs={tabs} activeTabId={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}
