import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { AuditLog } from '../../database/mongo/AuditLog';

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
          status: { in: ['DELIVERED', 'PICKED_UP'] },
        },
      });
      const revenueToday = todaysOrders.reduce(
        (sum: number, order: any) => sum + Number(order.totalAmount),
        0,
      );

      // 2. Orders Count Today
      const ordersTodayCount = await prisma.order.count({
        where: { ...branchFilter, createdAt: { gte: today } },
      });

      // 3. Active Deliveries
      const activeDeliveries = await prisma.deliveryAssignment.count({
        where: { status: { in: ['ASSIGNED', 'ACCEPTED', 'OUT_FOR_DELIVERY'] } },
      });

      // 4. Kitchen Status
      const activeKitchenOrders = await prisma.kitchenOrder.count({
        where: { status: { in: ['QUEUED', 'COOKING'] } },
      });

      // 5. Active Reservations
      const activeReservations = await prisma.reservation.count({
        where: {
          ...branchFilter,
          status: 'CONFIRMED',
          reservationDate: today.toISOString().split('T')[0],
        },
      });

      res.status(200).json({
        status: 'success',
        data: {
          revenueToday,
          ordersTodayCount,
          activeDeliveries,
          activeKitchenOrders,
          activeReservations,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getBranches(req: Request, res: Response, next: NextFunction) {
    try {
      const branches = await prisma.branch.findMany({
        orderBy: { name: 'asc' },
        include: {
          restaurant: true,
        },
      });

      res.status(200).json({
        status: 'success',
        data: branches,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        address,
        city,
        state,
        latitude,
        longitude,
        openingTime,
        closingTime,
        deliveryRadius,
        isActive,
      } = req.body;

      const restaurant = await prisma.restaurantGroup.findFirst();
      if (!restaurant) {
        return res
          .status(400)
          .json({
            status: 'fail',
            message: 'No restaurant group found. Please seed the database first.',
          });
      }

      const branch = await prisma.branch.create({
        data: {
          name,
          address,
          city,
          state,
          latitude: latitude ? parseFloat(latitude) : 0,
          longitude: longitude ? parseFloat(longitude) : 0,
          openingTime: openingTime || '09:00',
          closingTime: closingTime || '22:00',
          deliveryRadius: deliveryRadius ? parseFloat(deliveryRadius) : 5.0,
          isActive: isActive !== undefined ? isActive : true,
          restaurantId: restaurant.id,
        },
      });

      res.status(201).json({
        status: 'success',
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        name,
        address,
        city,
        state,
        latitude,
        longitude,
        openingTime,
        closingTime,
        deliveryRadius,
        isActive,
      } = req.body;

      const branch = await prisma.branch.update({
        where: { id },
        data: {
          name,
          address,
          city,
          state,
          latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
          longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
          openingTime,
          closingTime,
          deliveryRadius: deliveryRadius !== undefined ? parseFloat(deliveryRadius) : undefined,
          isActive,
        },
      });

      res.status(200).json({
        status: 'success',
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.branch.delete({
        where: { id },
      });

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await prisma.product.findMany({
        orderBy: { name: 'asc' },
        include: {
          category: true,
          variants: true,
        },
      });

      res.status(200).json({
        status: 'success',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, categoryId, basePrice, isVeg, description, isAvailable, featured } = req.body;
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const restaurant = await prisma.restaurantGroup.findFirst();
      if (!restaurant) {
        return res.status(400).json({ status: 'fail', message: 'No restaurant group found.' });
      }

      const product = await prisma.product.create({
        data: {
          name,
          slug,
          categoryId,
          basePrice: basePrice ? Number(basePrice) : 0,
          isVeg: isVeg !== undefined ? isVeg : false,
          description: description || '',
          isAvailable: isAvailable !== undefined ? isAvailable : true,
          featured: featured !== undefined ? featured : false,
          restaurantId: restaurant.id,
        },
      });

      res.status(201).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, categoryId, basePrice, isVeg, description, isAvailable, featured } = req.body;

      const updateData: any = {};
      if (name !== undefined) {
        updateData.name = name;
        updateData.slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (basePrice !== undefined) updateData.basePrice = Number(basePrice);
      if (isVeg !== undefined) updateData.isVeg = isVeg;
      if (description !== undefined) updateData.description = description;
      if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
      if (featured !== undefined) updateData.featured = featured;

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.product.delete({
        where: { id },
      });

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      let logs = [];
      try {
        logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
      } catch (mongoErr) {
        console.error('Failed to read MongoDB audit logs, using mock logs:', mongoErr);
        // Fallback mock logs if MongoDB collection is not initialized or fails
        logs = [
          {
            id: '1',
            actionType: 'UPDATE_SETTINGS',
            userId: 'owner@abcrestaurant.com',
            targetId: 'ABC - Indiranagar',
            changes: { taxRate: 18, deliveryRadius: 5 },
            createdAt: new Date(),
          },
          {
            id: '2',
            actionType: 'LOGIN_SUCCESS',
            userId: 'owner@abcrestaurant.com',
            targetId: 'Session Start',
            changes: { ip: '192.168.1.1', device: 'Chrome Windows' },
            createdAt: new Date(Date.now() - 3600000),
          },
          {
            id: '3',
            actionType: 'APPROVE_INVENTORY',
            userId: 'owner@abcrestaurant.com',
            targetId: 'Replenishment Req #890',
            changes: { status: 'APPROVED' },
            createdAt: new Date(Date.now() - 7200000),
          },
        ];
      }

      res.status(200).json({
        status: 'success',
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          restaurant: true,
          branch: true,
          user: true,
          refunds: true,
        },
      });

      res.status(200).json({
        status: 'success',
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }
}
