import { Request, Response, NextFunction } from 'express';

import { prisma } from '../../config/db';

export class ReportsController {
  public static async getDailyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const branchFilter = branchId ? { branchId } : {};

      const orders = await prisma.order.findMany({
        where: { ...branchFilter, createdAt: { gte: today } },
        include: { user: true },
      });

      const reportData = orders.map((o) => ({
        orderNumber: o.orderNumber,
        customerName: o.user.firstName + ' ' + o.user.lastName,
        amount: o.totalAmount,
        type: o.orderType,
        status: o.status,
        time: o.createdAt.toISOString(),
      }));

      res.status(200).json({ status: 'success', data: reportData });
    } catch (error) {
      next(error);
    }
  }
}
