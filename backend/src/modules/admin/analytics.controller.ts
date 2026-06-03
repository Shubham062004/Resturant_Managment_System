import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';

export class AnalyticsController {
  public static async getSalesTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string;
      const branchFilter = branchId ? { branchId } : {};

      // Very simple aggregation for past 7 days
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
            status: { in: ['DELIVERED', 'PICKED_UP'] }
          }
        });

        return {
          date: day.toISOString().split('T')[0],
          revenue: sum._sum?.totalAmount ? Number(sum._sum.totalAmount) : 0
        };
      }));

      res.status(200).json({ status: 'success', data: trends });
    } catch (error) {
      next(error);
    }
  }

  public static async getPopularProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const _branchId = req.query.branchId as string;
      // Note: This relies on aggregating order items. For simplicity, we just fetch a mockup or basic raw query.
      const items = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      });

      const populatedItems = await Promise.all(items.map(async (item) => {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        return {
          productName: product?.name || 'Unknown',
          quantity: item._sum.quantity
        };
      }));

      res.status(200).json({ status: 'success', data: populatedItems });
    } catch (error) {
      next(error);
    }
  }
}
