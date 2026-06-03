import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';

export class SuperAdminController {
  public static async getGlobalDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const totalOrganizations = await prisma.organization.count();
      const totalBranches = await prisma.branch.count();
      const totalOrders = await prisma.order.count();

      const revenueAggr = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['DELIVERED', 'PICKED_UP'] } },
      });

      res.status(200).json({
        status: 'success',
        data: {
          totalOrganizations,
          totalBranches,
          totalOrders,
          globalRevenue: revenueAggr._sum.totalAmount ? Number(revenueAggr._sum.totalAmount) : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getPlatformHealth(req: Request, res: Response, next: NextFunction) {
    try {
      // Mock health data
      res.status(200).json({
        status: 'success',
        data: {
          api: 'HEALTHY',
          database: 'HEALTHY',
          redis: 'HEALTHY',
          activeConnections: Math.floor(Math.random() * 1000),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
