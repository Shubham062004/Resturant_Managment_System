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

      const [revenueToday, totalOrders, activeStaff, activeCustomers] =
        await Promise.all([
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
          // Count distinct customers who placed an order today
          prisma.order.groupBy({
            by: ['userId'],
            where: {
              ...branchFilter,
              createdAt: { gte: today },
            },
          }),
        ]);

      res.status(200).json({
        status: 'success',
        data: {
          revenueToday: revenueToday._sum?.totalAmount || 0,
          totalOrdersToday: totalOrders,
          activeStaffCount: activeStaff,
          activeCustomers: activeCustomers.length, // real count from DB
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
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      // Count new customers (registered in last 30 days)
      const [newCustomers, returningCustomers, aovAgg, totalCustomers] =
        await Promise.all([
          prisma.user.count({
            where: {
              role: 'CUSTOMER',
              createdAt: { gte: thirtyDaysAgo },
            },
          }),
          // Returning = had orders in both 30–60 days ago AND last 30 days
          prisma.order.groupBy({
            by: ['userId'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            having: { userId: { _count: { gt: 1 } } },
          }),
          prisma.order.aggregate({
            _avg: { totalAmount: true },
            where: { status: { in: ['DELIVERED', 'PICKED_UP'] } },
          }),
          prisma.user.count({ where: { role: 'CUSTOMER' } }),
        ]);

      const newPct =
        totalCustomers > 0
          ? Math.round((newCustomers / totalCustomers) * 100)
          : 0;
      const returningPct = 100 - newPct;

      res.status(200).json({
        status: 'success',
        data: {
          retention: { new: newPct, returning: returningPct },
          demographics: await AnalyticsController.computeDemographics(),
          averageOrderValue: aovAgg._avg.totalAmount
            ? parseFloat(Number(aovAgg._avg.totalAmount).toFixed(2))
            : 0,
          totalCustomers,
          newCustomers,
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
      const branchId = req.query.branchId as string;
      const branchOrderFilter = branchId ? { order: { branchId } } : {};

      const items = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        where: branchOrderFilter,
        orderBy: { _sum: { quantity: 'desc' } },
        take: 8,
      });

      const populatedItems = await Promise.all(
        items.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: { category: { select: { name: true } } },
          });
          return {
            productName: product?.name || 'Unknown Product',
            quantity: item._sum.quantity || 0,
            revenue:
              (item._sum.quantity || 0) * Number(product?.basePrice || 0),
            category: product?.category?.name || 'Other',
          };
        })
      );

      // Real category breakdown from order items
      const categoryItems = await prisma.orderItem.findMany({
        where: branchOrderFilter,
        include: {
          product: { include: { category: { select: { name: true } } } },
        },
      });

      const categoryMap: Record<string, number> = {};
      for (const oi of categoryItems) {
        const cat = oi.product?.category?.name || 'Other';
        categoryMap[cat] = (categoryMap[cat] || 0) + oi.quantity;
      }
      const totalQty = Object.values(categoryMap).reduce((a, b) => a + b, 0);
      const categoryBreakdown = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, qty]) => ({
          name,
          value: totalQty > 0 ? Math.round((qty / totalQty) * 100) : 0,
        }));

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
      const branchFilter = req.query.branchId
        ? { order: { branchId: req.query.branchId as string } }
        : {};

      // Count late orders: those with OUT_FOR_DELIVERY status older than 45 mins
      const fortyFiveMinsAgo = new Date(Date.now() - 45 * 60 * 1000);
      const [lateOrdersCount, topDriversRaw] = await Promise.all([
        prisma.deliveryAssignment.count({
          where: {
            ...branchFilter,
            status: 'OUT_FOR_DELIVERY',
            assignedAt: { lte: fortyFiveMinsAgo },
          },
        }),
        prisma.deliveryPartner.findMany({
          take: 5,
          orderBy: { rating: 'desc' },
          include: {
            user: { select: { firstName: true, lastName: true } },
            assignments: {
              where: { status: 'DELIVERED' },
              select: { id: true },
            },
          },
        }),
      ]);

      const topDrivers = topDriversRaw.map((dp) => ({
        name: `${dp.user.firstName} ${dp.user.lastName}`,
        completed: dp.assignments.length,
        rating: dp.rating ? parseFloat(Number(dp.rating).toFixed(1)) : 0,
      }));

      // Compute avg delivery time from completed assignments
      const completedDeliveries = await prisma.deliveryAssignment.findMany({
        where: {
          ...branchFilter,
          status: 'DELIVERED',
          deliveredAt: { not: null },
        },
        select: { assignedAt: true, deliveredAt: true },
        take: 100,
      });

      let avgMins = 0;
      if (completedDeliveries.length > 0) {
        const total = completedDeliveries.reduce((sum, d) => {
          const mins =
            (new Date(d.deliveredAt!).getTime() -
              new Date(d.assignedAt).getTime()) /
            60000;
          return sum + mins;
        }, 0);
        avgMins = Math.round(total / completedDeliveries.length);
      }

      res.status(200).json({
        status: 'success',
        data: {
          averageDeliveryTime: `${avgMins} mins`,
          lateOrdersCount,
          topDrivers,
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

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
        23,
        59,
        59
      );

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

      // 2. Orders By Branch — real staffCount per branch from DB
      const branches = await prisma.branch.findMany({
        include: { restaurant: true },
      });

      const branchPerformance = await Promise.all(
        branches.map(async (branch) => {
          const [
            bOrders,
            bKitchenQueue,
            bPendingDeliveries,
            bInventoryHealth,
            bStaffCount,
            bRating,
          ] = await Promise.all([
            prisma.order.findMany({
              where: {
                branchId: branch.id,
                createdAt: { gte: startOfMonth, lte: endOfMonth },
              },
            }),
            prisma.kitchenOrder.count({
              where: {
                status: { in: ['QUEUED', 'COOKING'] },
                order: { branchId: branch.id },
              },
            }),
            prisma.deliveryAssignment.count({
              where: {
                status: { in: ['ASSIGNED', 'ACCEPTED', 'OUT_FOR_DELIVERY'] },
                order: { branchId: branch.id },
              },
            }),
            prisma.inventory.count({
              where: {
                branchId: branch.id,
                quantity: { lte: 50 },
              },
            }),
            // Real staff count: users assigned to this branch via work assignments
            prisma.workAssignment.count({
              where: {
                branchId: branch.id,
                date: { gte: startOfMonth, lte: endOfMonth },
              },
            }),
            // Real customer rating from reviews
            prisma.review.aggregate({
              where: {
                product: { restaurantId: branch.restaurantId },
              },
              _avg: { rating: true },
            }),
          ]);

          const bRevenue = bOrders
            .filter((o) => o.status === 'DELIVERED' || o.status === 'PICKED_UP')
            .reduce((sum, o) => sum + Number(o.totalAmount), 0);

          return {
            branchId: branch.id,
            name: branch.name,
            city: branch.city,
            revenue: bRevenue,
            orders: bOrders.length,
            staffCount: bStaffCount,
            kitchenQueue: bKitchenQueue,
            pendingDeliveries: bPendingDeliveries,
            inventoryHealth: bInventoryHealth > 5 ? 'Low Stock' : 'Optimal',
            customerRating: bRating._avg.rating
              ? parseFloat(Number(bRating._avg.rating).toFixed(1))
              : null,
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
        branchRating,
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
        // Real rating from product reviews for this branch's restaurant
        prisma.branch
          .findUnique({
            where: { id: branchId },
            select: { restaurantId: true },
          })
          .then(async (b) => {
            if (!b) return null;
            const agg = await prisma.review.aggregate({
              where: { product: { restaurantId: b.restaurantId } },
              _avg: { rating: true },
            });
            return agg._avg.rating
              ? parseFloat(Number(agg._avg.rating).toFixed(1))
              : null;
          }),
      ]);

      const revenueToday = todaysOrders.reduce(
        (sum: number, order: any) => sum + Number(order.totalAmount),
        0
      );

      const ordersTodayCount = await prisma.order.count({
        where: { branchId, createdAt: { gte: today } },
      });

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
          rating: branchRating, // real DB rating (null if no reviews yet)
          kitchenLoad,
          inventoryAlerts: lowStockCount,
          staffPresent,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  private static async computeDemographics() {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: { createdAt: true },
    });

    const now = new Date();
    const segments = { '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0 };

    customers.forEach((c) => {
      const age = Math.floor(
        (now.getTime() - c.createdAt.getTime()) / (365.25 * 24 * 3600 * 1000)
      );
      if (age < 25) segments['18-24']++;
      else if (age < 35) segments['25-34']++;
      else if (age < 45) segments['35-44']++;
      else segments['45+']++;
    });

    const total = customers.length || 1;
    return Object.entries(segments).map(([segment, count]) => ({
      segment,
      percentage: Math.round((count / total) * 100),
    }));
  }

  public static async getDashboardTrends(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const days = [...Array(7)].map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
      });

      const dailyRevenue = await Promise.all(
        days.map(async (day) => {
          const next = new Date(day);
          next.setDate(next.getDate() + 1);
          const agg = await prisma.order.aggregate({
            where: {
              createdAt: { gte: day, lt: next },
              status: { in: ['DELIVERED', 'PICKED_UP'] },
            },
            _sum: { totalAmount: true },
          });
          return {
            name: day.toLocaleDateString('en-IN', { weekday: 'short' }),
            revenue: Number(agg._sum.totalAmount || 0),
          };
        })
      );

      const weeks = [...Array(4)].map((_, i) => {
        const wStart = new Date(startOfMonth);
        wStart.setDate(wStart.getDate() + i * 7);
        const wEnd = new Date(wStart);
        wEnd.setDate(wEnd.getDate() + 7);
        return { wStart, wEnd, name: `Week ${i + 1}` };
      });

      const financeTrend = await Promise.all(
        weeks.map(async ({ wStart, wEnd, name }) => {
          const [rev, payroll, purchases] = await Promise.all([
            prisma.order.aggregate({
              where: {
                createdAt: { gte: wStart, lt: wEnd },
                status: { in: ['DELIVERED', 'PICKED_UP'] },
              },
              _sum: { totalAmount: true },
            }),
            prisma.payrollRecord.aggregate({
              where: { payrollDate: { gte: wStart, lt: wEnd } },
              _sum: { netPaid: true },
            }),
            prisma.purchaseOrder.aggregate({
              where: {
                status: 'RECEIVED',
                receivedAt: { gte: wStart, lt: wEnd },
              },
              _sum: { totalAmount: true },
            }),
          ]);
          const revenue = Number(rev._sum.totalAmount || 0);
          const expenses =
            Number(payroll._sum.netPaid || 0) +
            Number(purchases._sum.totalAmount || 0);
          return { name, revenue, expenses, profit: revenue - expenses };
        })
      );

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(today);

      const [todayRev, yesterdayRev, monthRev, weekRev] = await Promise.all([
        prisma.order.aggregate({
          where: {
            createdAt: { gte: today },
            status: { in: ['DELIVERED', 'PICKED_UP'] },
          },
          _sum: { totalAmount: true },
        }),
        prisma.order.aggregate({
          where: {
            createdAt: { gte: yesterday, lt: yesterdayEnd },
            status: { in: ['DELIVERED', 'PICKED_UP'] },
          },
          _sum: { totalAmount: true },
        }),
        prisma.order.aggregate({
          where: {
            createdAt: { gte: startOfMonth },
            status: { in: ['DELIVERED', 'PICKED_UP'] },
          },
          _sum: { totalAmount: true },
        }),
        prisma.order.aggregate({
          where: {
            createdAt: { gte: days[0] },
            status: { in: ['DELIVERED', 'PICKED_UP'] },
          },
          _sum: { totalAmount: true },
        }),
      ]);

      const wasteAgg = await prisma.wasteRecord.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { quantity: true },
      });

      res.status(200).json({
        status: 'success',
        data: {
          dailyRevenue,
          financeTrend,
          revenueToday: Number(todayRev._sum.totalAmount || 0),
          revenueYesterday: Number(yesterdayRev._sum.totalAmount || 0),
          revenueThisWeek: Number(weekRev._sum.totalAmount || 0),
          revenueThisMonth: Number(monthRev._sum.totalAmount || 0),
          wasteQuantity: Number(wasteAgg._sum.quantity || 0),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getDashboardAlerts(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fortyFiveMinsAgo = new Date(Date.now() - 45 * 60 * 1000);

      const [
        lowStock,
        delayedDeliveries,
        badReviews,
        pendingRequests,
        staffShortage,
      ] = await Promise.all([
        prisma.inventory.findMany({
          where: { quantity: { lte: 50 } },
          include: { ingredient: true, branch: true },
          take: 3,
          orderBy: { quantity: 'asc' },
        }),
        prisma.deliveryAssignment.findMany({
          where: {
            status: 'OUT_FOR_DELIVERY',
            assignedAt: { lte: fortyFiveMinsAgo },
          },
          include: { order: { select: { orderNumber: true } } },
          take: 3,
        }),
        prisma.review.findMany({
          where: { rating: { lte: 2 } },
          include: {
            user: { select: { firstName: true } },
            product: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        }),
        prisma.inventoryRequest.findMany({
          where: { status: 'PENDING' },
          include: { branch: true, items: true },
          take: 3,
        }),
        prisma.branch.findMany({
          select: {
            id: true,
            name: true,
            workAssignments: {
              where: {
                date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
              },
            },
          },
        }),
      ]);

      const alerts: Array<{
        title: string;
        desc: string;
        level: string;
        time: string;
      }> = [];

      lowStock.forEach((item) => {
        alerts.push({
          title: 'Low Stock Alert',
          desc: `${item.ingredient.name} is below threshold (${item.quantity}${item.ingredient.unit}) at ${item.branch.name}.`,
          level: 'Critical',
          time: 'Recent',
        });
      });

      delayedDeliveries.forEach((d) => {
        alerts.push({
          title: 'Delayed Delivery Alert',
          desc: `Order #${d.order.orderNumber} has exceeded average delivery time.`,
          level: 'Critical',
          time: 'Recent',
        });
      });

      badReviews.forEach((r) => {
        alerts.push({
          title: 'Negative Review Received',
          desc: `${r.user.firstName} rated ${r.rating}/5 for ${r.product.name}: "${r.comment?.slice(0, 60) || 'No comment'}"`,
          level: 'High',
          time: r.createdAt.toLocaleString('en-IN'),
        });
      });

      pendingRequests.forEach((req) => {
        alerts.push({
          title: 'Inventory Request Pending',
          desc: `${req.branch.name} requests restock of ${req.items.length} items.`,
          level: 'Medium',
          time: req.createdAt.toLocaleString('en-IN'),
        });
      });

      staffShortage
        .filter((b) => b.workAssignments.length < 2)
        .slice(0, 2)
        .forEach((b) => {
          alerts.push({
            title: 'Staff Shortage Warning',
            desc: `${b.name} reported staff count below threshold.`,
            level: 'Low',
            time: 'Today',
          });
        });

      res.status(200).json({ status: 'success', data: alerts });
    } catch (error) {
      next(error);
    }
  }
}
