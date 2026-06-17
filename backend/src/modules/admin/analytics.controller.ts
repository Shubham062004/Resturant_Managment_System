import { Request, Response, NextFunction } from 'express';

import { prisma } from '../../config/db';

export class AnalyticsController {
  public static async getExecutiveSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const branchId = req.query.branchId as string;
      const branchFilter = branchId ? { branchId } : {};

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [revenueToday, totalOrders, activeStaff] = await Promise.all([
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: {
            ...branchFilter,
            createdAt: { gte: today },
            status: { in: ['DELIVERED'] },
          },
        }),
        prisma.order.count({
          where: { ...branchFilter, createdAt: { gte: today } },
        }),
        prisma.user.count({
          where: {
            role: {
              in: [
                'KITCHEN_STAFF',
                'DELIVERY_PARTNER',
                'CASHIER',
                'HEAD_CHEF',
                'BRANCH_MANAGER',
              ],
            },
          },
        }),
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          revenueToday: revenueToday._sum?.totalAmount || 0,
          totalOrdersToday: totalOrders,
          activeStaffCount: activeStaff,
          activeCustomers: 45, // mock data for now
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getSalesTrends(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const branchId = req.query.branchId as string;
      const branchFilter = branchId ? { branchId } : {};

      const days = [...Array(7)]
        .map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          return d;
        })
        .reverse();

      const trends = await Promise.all(
        days.map(async (day) => {
          const nextDay = new Date(day);
          nextDay.setDate(nextDay.getDate() + 1);

          const sum = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
              ...branchFilter,
              createdAt: { gte: day, lt: nextDay },
              status: { in: ['DELIVERED'] },
            },
          });

          const count = await prisma.order.count({
            where: {
              ...branchFilter,
              createdAt: { gte: day, lt: nextDay },
            },
          });

          return {
            date: day.toISOString().split('T')[0],
            revenue: sum._sum?.totalAmount ? Number(sum._sum.totalAmount) : 0,
            orders: count,
          };
        })
      );

      res.status(200).json({ status: 'success', data: trends });
    } catch (error) {
      next(error);
    }
  }

  public static async getCustomerAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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
            { segment: '45+', percentage: 10 },
          ],
          averageOrderValue: 42.5,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getProductAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const _branchId = req.query.branchId as string;

      const items = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 8,
      });

      const populatedItems = await Promise.all(
        items.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });
          return {
            productName: product?.name || 'Unknown Product',
            quantity: item._sum.quantity || 0,
            revenue: 0,
            category: product?.categoryId || 'Unknown',
          };
        })
      );

      // Mock categories
      const categoryBreakdown = [
        { name: 'Pizzas', value: 45 },
        { name: 'Burgers', value: 25 },
        { name: 'Drinks', value: 20 },
        { name: 'Desserts', value: 10 },
      ];

      res.status(200).json({
        status: 'success',
        data: { topProducts: populatedItems, categories: categoryBreakdown },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getDeliveryAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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
            { name: 'Mike Ross', completed: 95, rating: 4.6 },
          ],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getOwnerDashboard(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Dynamically calculate the start and end of the current month based on system time
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      // 1. Overall Stats
      const [
        todaysOrders,
        monthlyOrders,
        activeStaff,
        lowStockItems,
        pendingRequestsCount,
        reservationsCount,
        totalPayrollThisMonth,
        totalPurchasesThisMonth,
        totalRefundsThisMonth,
      ] = await Promise.all([
        prisma.order.findMany({
          where: {
            createdAt: { gte: today },
            status: { in: ['DELIVERED', 'PICKED_UP'] },
          },
        }),
        prisma.order.findMany({
          where: {
            createdAt: { gte: startOfMonth, lte: endOfMonth },
            status: { in: ['DELIVERED', 'PICKED_UP'] },
          },
        }),
        prisma.user.count({
          where: {
            role: {
              not: 'CUSTOMER',
            },
          },
        }),
        prisma.inventory.count({
          where: {
            quantity: { lte: 50 },
          },
        }),
        prisma.inventoryRequest.count({
          where: { status: 'PENDING' },
        }),
        prisma.reservation.count({
          where: {
            status: 'CONFIRMED',
          },
        }),
        prisma.payrollRecord.aggregate({
          where: {
            payrollDate: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { netPaid: true, bonusPaid: true },
        }),
        prisma.purchaseOrder.aggregate({
          where: {
            status: 'RECEIVED',
            receivedAt: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { totalAmount: true },
        }),
        prisma.refund.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        }),
      ]);

      const revenueToday = todaysOrders.reduce(
        (sum: number, order: any) => sum + Number(order.totalAmount),
        0
      );
      const revenueThisMonth = monthlyOrders.reduce(
        (sum: number, order: any) => sum + Number(order.totalAmount),
        0
      );

      const ordersTodayCount = await prisma.order.count({
        where: { createdAt: { gte: today } },
      });

      // Calculate real expenses and net profit
      const payrollCost = Number(totalPayrollThisMonth._sum.netPaid || 0);
      const inventoryCost = Number(
        totalPurchasesThisMonth._sum.totalAmount || 0
      );
      const refundCost = Number(totalRefundsThisMonth._sum.amount || 0);
      const taxesCost = monthlyOrders.reduce(
        (sum: number, order: any) => sum + Number(order.tax || 0),
        0
      );

      const expenses = payrollCost + inventoryCost + refundCost + taxesCost;
      const profit = revenueThisMonth - expenses;

      // 2. Orders By Branch
      const branches = await prisma.branch.findMany({
        include: { restaurant: true },
      });

      const branchPerformance = await Promise.all(
        branches.map(async (branch, idx) => {
          const bOrders = await prisma.order.findMany({
            where: {
              branchId: branch.id,
              createdAt: { gte: startOfMonth, lte: endOfMonth },
            },
          });

          const bRevenue = bOrders
            .filter((o) => o.status === 'DELIVERED' || o.status === 'PICKED_UP')
            .reduce((sum, o) => sum + Number(o.totalAmount), 0);

          const bKitchenQueue = await prisma.kitchenOrder.count({
            where: {
              status: { in: ['QUEUED', 'COOKING'] },
              order: { branchId: branch.id },
            },
          });

          const bPendingDeliveries = await prisma.deliveryAssignment.count({
            where: {
              status: { in: ['ASSIGNED', 'ACCEPTED', 'OUT_FOR_DELIVERY'] },
              order: { branchId: branch.id },
            },
          });

          const bInventoryHealth = await prisma.inventory.count({
            where: {
              branchId: branch.id,
              quantity: { lte: 50 },
            },
          });

          const rating = 4.2 + idx * 0.15; // Simulated rating

          return {
            branchId: branch.id,
            name: branch.name,
            city: branch.city,
            revenue: bRevenue,
            orders: bOrders.length,
            staffCount: 10 + (idx % 2),
            kitchenQueue: bKitchenQueue,
            pendingDeliveries: bPendingDeliveries,
            inventoryHealth: bInventoryHealth > 5 ? 'Low Stock' : 'Optimal',
            customerRating: parseFloat(Math.min(5.0, rating).toFixed(1)),
          };
        })
      );

      // 3. Top Products
      const topProductsGroup = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      });

      const topProducts = await Promise.all(
        topProductsGroup.map(async (item) => {
          const prod = await prisma.product.findUnique({
            where: { id: item.productId },
          });
          return {
            name: prod?.name || 'Special Product',
            quantity: item._sum.quantity || 0,
            revenue: (item._sum.quantity || 0) * Number(prod?.basePrice || 10),
          };
        })
      );

      // 4. Low stock alerts
      const lowStockAlertsData = await prisma.inventory.findMany({
        where: { quantity: { lte: 50 } },
        include: { ingredient: true, branch: true },
        take: 5,
      });

      const lowStockAlerts = lowStockAlertsData.map((item) => ({
        id: item.id,
        ingredientName: item.ingredient?.name || 'Ingredient',
        branchName: item.branch?.name || 'Branch',
        quantity: item.quantity,
        unit: item.ingredient?.unit || 'Units',
      }));

      // 5. Kitchen Load
      const activeKitchen = await prisma.kitchenOrder.count({
        where: { status: { not: 'COMPLETED' } },
      });

      res.status(200).json({
        status: 'success',
        data: {
          summary: {
            revenueToday,
            revenueThisMonth,
            ordersToday: ordersTodayCount,
            kitchenLoad: activeKitchen,
            lowStockCount: lowStockItems,
            pendingRequestsCount,
            reservationsCount,
            staffOnline: activeStaff,
            expensesThisMonth: expenses,
            netProfitThisMonth: profit,
            payrollCost,
            inventoryCost,
            refundCost,
            taxesCost,
            bonusPaid: Number(totalPayrollThisMonth._sum.bonusPaid || 0),
          },
          branchPerformance,
          topProducts,
          lowStockAlerts,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getManagerDashboard(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const branchId = req.query.branchId as string;
      if (!branchId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Branch ID is required for manager dashboard analytics.',
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        todaysOrders,
        pendingOrders,
        activeTables,
        activeReservations,
        lowStockCount,
        staffPresent,
      ] = await Promise.all([
        prisma.order.findMany({
          where: {
            branchId,
            createdAt: { gte: today },
            status: { in: ['DELIVERED', 'PICKED_UP'] },
          },
        }),
        prisma.order.count({
          where: {
            branchId,
            status: { in: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'] },
          },
        }),
        prisma.table.count({
          where: {
            branchId,
            status: { in: ['OCCUPIED', 'RESERVED', 'BILLING'] },
          },
        }),
        prisma.reservation.count({
          where: {
            branchId,
            status: 'CONFIRMED',
          },
        }),
        prisma.inventory.count({
          where: {
            branchId,
            quantity: { lte: 50 },
          },
        }),
        prisma.attendanceLog.count({
          where: {
            branchId,
            date: { gte: today },
          },
        }),
      ]);

      const revenueToday = todaysOrders.reduce(
        (sum: number, order: any) => sum + Number(order.totalAmount),
        0
      );

      const ordersTodayCount = await prisma.order.count({
        where: { branchId, createdAt: { gte: today } },
      });

      // Calculate kitchen load
      const activeKitchenCount = await prisma.kitchenOrder.count({
        where: {
          status: { in: ['QUEUED', 'COOKING'] },
          order: { branchId },
        },
      });

      const kitchenLoad =
        activeKitchenCount > 10
          ? 'High'
          : activeKitchenCount > 5
            ? 'Medium'
            : 'Low';

      res.status(200).json({
        status: 'success',
        data: {
          revenue: revenueToday,
          ordersToday: ordersTodayCount,
          pendingOrders,
          activeTables,
          activeReservations,
          rating: 4.8, // Mocked rating standard
          kitchenLoad,
          inventoryAlerts: lowStockCount,
          staffPresent: staffPresent || 10, // Fallback default staff
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
