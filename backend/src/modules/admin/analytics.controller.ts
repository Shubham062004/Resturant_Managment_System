import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';

export class AnalyticsController {
  public static async getExecutiveSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string;
      const branchFilter = branchId ? { branchId } : {};

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [revenueToday, totalOrders, activeStaff] = await Promise.all([
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { ...branchFilter, createdAt: { gte: today }, status: { in: ['DELIVERED', 'PICKED_UP', 'COMPLETED'] } }
        }),
        prisma.order.count({
          where: { ...branchFilter, createdAt: { gte: today } }
        }),
        prisma.user.count({
          where: { role: { in: ['KITCHEN_STAFF', 'DELIVERY_PARTNER', 'CASHIER', 'HEAD_CHEF', 'BRANCH_MANAGER'] } }
        })
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          revenueToday: revenueToday._sum.totalAmount || 0,
          totalOrdersToday: totalOrders,
          activeStaffCount: activeStaff,
          activeCustomers: 45 // mock data for now
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getSalesTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string;
      const branchFilter = branchId ? { branchId } : {};

      const days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        return d;
      }).reverse();

      const trends = await Promise.all(days.map(async (day) => {
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);

        const sum = await prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: {
            ...branchFilter,
            createdAt: { gte: day, lt: nextDay },
            status: { in: ['DELIVERED', 'PICKED_UP', 'COMPLETED'] }
          }
        });

        const count = await prisma.order.count({
          where: {
            ...branchFilter,
            createdAt: { gte: day, lt: nextDay }
          }
        });

        return {
          date: day.toISOString().split('T')[0],
          revenue: sum._sum?.totalAmount ? Number(sum._sum.totalAmount) : 0,
          orders: count
        };
      }));

      res.status(200).json({ status: 'success', data: trends });
    } catch (error) {
      next(error);
    }
  }

  public static async getCustomerAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      // Mocked up response due to complex querying logic required for retention
      res.status(200).json({
        status: 'success',
        data: {
          retention: { new: 30, returning: 70 },
          demographics: [
            { segment: '18-24', percentage: 25 },
            { segment: '25-34', percentage: 45 },
            { segment: '35-44', percentage: 20 },
            { segment: '45+', percentage: 10 }
          ],
          averageOrderValue: 42.50
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getProductAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string;
      
      const items = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 8
      });

      const populatedItems = await Promise.all(items.map(async (item) => {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        return {
          productName: product?.name || 'Unknown Product',
          quantity: item._sum.quantity || 0,
          revenue: item._sum.subtotal ? Number(item._sum.subtotal) : 0,
          category: product?.categoryId || 'Unknown'
        };
      }));

      // Mock categories
      const categoryBreakdown = [
        { name: 'Pizzas', value: 45 },
        { name: 'Burgers', value: 25 },
        { name: 'Drinks', value: 20 },
        { name: 'Desserts', value: 10 }
      ];

      res.status(200).json({ status: 'success', data: { topProducts: populatedItems, categories: categoryBreakdown } });
    } catch (error) {
      next(error);
    }
  }

  public static async getDeliveryAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      // Mock response for delivery analytics
      res.status(200).json({
        status: 'success',
        data: {
          averageDeliveryTime: '32 mins',
          lateOrdersCount: 14,
          topDrivers: [
            { name: 'John Doe', completed: 142, rating: 4.8 },
            { name: 'Sarah Smith', completed: 128, rating: 4.9 },
            { name: 'Mike Ross', completed: 95, rating: 4.6 }
          ]
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
