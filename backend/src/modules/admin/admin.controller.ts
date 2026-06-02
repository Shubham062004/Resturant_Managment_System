import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';

export class AdminController {
  public static async getDashboardOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // We use base query object to optionally filter by branch if provided
      const branchFilter = branchId ? { branchId } : {};

      // 1. Today's Revenue
      const todaysOrders = await prisma.order.findMany({
        where: {
          ...branchFilter,
          createdAt: { gte: today },
          status: { in: ['DELIVERED', 'PICKED_UP'] }
        }
      });
      const revenueToday = todaysOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

      // 2. Orders Count Today
      const ordersTodayCount = await prisma.order.count({
        where: { ...branchFilter, createdAt: { gte: today } }
      });

      // 3. Active Deliveries
      const activeDeliveries = await prisma.deliveryAssignment.count({
        where: { status: { in: ['ASSIGNED', 'ACCEPTED', 'OUT_FOR_DELIVERY'] } }
      });

      // 4. Kitchen Status
      const activeKitchenOrders = await prisma.kitchenOrder.count({
        where: { status: { in: ['QUEUED', 'COOKING'] } }
      });

      // 5. Active Reservations
      const activeReservations = await prisma.reservation.count({
        where: { ...branchFilter, status: 'CONFIRMED', reservationDate: today.toISOString().split('T')[0] }
      });

      res.status(200).json({
        status: 'success',
        data: {
          revenueToday,
          ordersTodayCount,
          activeDeliveries,
          activeKitchenOrders,
          activeReservations
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
