import { PrismaClient, StockMovementType } from '@prisma/client';

import {
  applyDateFilter,
  calcTrend,
  formatMonthLabel,
  monthKey,
  parseDateRange,
} from './history.helpers';

const prisma = new PrismaClient();

const DELIVERED_STATUSES = ['DELIVERED', 'PICKED_UP'] as const;

export class HistoryService {
  private buildPagination(filters: Record<string, unknown>) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 50;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  async getOrders(filters: Record<string, unknown>) {
    const { page, limit, skip } = this.buildPagination(filters);
    const dateRange = parseDateRange(filters);

    const whereClause: Record<string, unknown> = {};
    if (filters.branchId) whereClause.branchId = filters.branchId;
    if (filters.status) whereClause.status = filters.status;
    const dateFilter = applyDateFilter('createdAt', dateRange);
    if (dateFilter) Object.assign(whereClause, dateFilter);
    if (filters.search) {
      whereClause.OR = [
        { id: { contains: filters.search, mode: 'insensitive' } },
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        {
          user: {
            firstName: { contains: filters.search, mode: 'insensitive' },
          },
        },
        {
          user: { lastName: { contains: filters.search, mode: 'insensitive' } },
        },
      ];
    }

    const [orders, total, revenueAgg, refundCount, statusGroups] =
      await Promise.all([
        prisma.order.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            branch: { select: { id: true, name: true } },
            items: { include: { product: { select: { name: true } } } },
            payment: { select: { status: true, provider: true, amount: true } },
            refunds: { select: { id: true, status: true, amount: true } },
            kitchenOrder: {
              include: {
                assignedUser: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
            deliveryAssignment: {
              include: {
                driver: {
                  include: {
                    user: {
                      select: { id: true, firstName: true, lastName: true },
                    },
                  },
                },
              },
            },
            statusHistory: { orderBy: { timestamp: 'asc' } },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.order.count({ where: whereClause }),
        prisma.order.aggregate({
          where: whereClause,
          _sum: { totalAmount: true },
          _avg: { totalAmount: true },
        }),
        prisma.order.count({
          where: { ...whereClause, status: { in: ['REFUNDED', 'CANCELLED'] } },
        }),
        prisma.order.groupBy({
          by: ['status'],
          where: whereClause,
          _count: { id: true },
        }),
      ]);

    const dailyRevenue: Record<string, number> = {};
    orders.forEach((o) => {
      const key = o.createdAt.toISOString().split('T')[0];
      dailyRevenue[key] = (dailyRevenue[key] || 0) + Number(o.totalAmount);
    });

    const prevRange = dateRange.startDate
      ? {
          startDate: new Date(
            dateRange.startDate.getTime() -
              (dateRange.endDate!.getTime() - dateRange.startDate.getTime())
          ),
          endDate: dateRange.startDate,
        }
      : {};
    const prevWhere = { ...whereClause };
    const prevDateFilter = applyDateFilter('createdAt', prevRange);
    if (prevDateFilter) Object.assign(prevWhere, prevDateFilter);

    const prevRevenue = await prisma.order.aggregate({
      where: prevWhere,
      _sum: { totalAmount: true },
    });

    const revenue = Number(revenueAgg._sum.totalAmount || 0);
    const prevRev = Number(prevRevenue._sum.totalAmount || 0);

    return {
      data: orders,
      total,
      page,
      limit,
      summary: {
        revenue,
        orderCount: total,
        avgOrderValue: Number(revenueAgg._avg.totalAmount || 0),
        refundedCount: refundCount,
        revenueTrend: calcTrend(revenue, prevRev),
      },
      charts: {
        dailyTrend: Object.entries(dailyRevenue)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-14)
          .map(([date, revenueVal]) => ({ date, revenue: revenueVal })),
        statusBreakdown: statusGroups.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
      },
    };
  }

  async getStaff(filters: Record<string, unknown>) {
    const { page, limit, skip } = this.buildPagination(filters);
    const dateRange = parseDateRange(filters);
    const staffRoles = [
      'KITCHEN_STAFF',
      'DELIVERY_PARTNER',
      'CASHIER',
      'HEAD_CHEF',
      'BRANCH_MANAGER',
      'ADMIN',
      'WAITER',
    ];

    const whereClause: Record<string, unknown> = {
      role: { in: staffRoles },
    };
    if (filters.role) whereClause.role = filters.role;
    if (filters.status) whereClause.isActive = filters.status === 'ACTIVE';
    if (filters.branchId) {
      whereClause.workAssignments = { some: { branchId: filters.branchId } };
    }
    if (filters.search) {
      whereClause.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [staff, total, activeCount, formerCount, payrollAgg, attendanceAgg] =
      await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          include: {
            employeeTimeline: true,
            salaryRevisions: { orderBy: { effectiveDate: 'desc' }, take: 1 },
            payrollRecords: {
              where: dateRange.startDate
                ? {
                    payrollDate: {
                      gte: dateRange.startDate,
                      lte: dateRange.endDate,
                    },
                  }
                : undefined,
              orderBy: { payrollDate: 'desc' },
              take: 3,
            },
            workAssignments: {
              include: { branch: true },
              orderBy: { date: 'desc' },
              take: 5,
            },
            attendanceLogs: {
              where: dateRange.startDate
                ? { date: { gte: dateRange.startDate, lte: dateRange.endDate } }
                : undefined,
              take: 10,
              orderBy: { date: 'desc' },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where: whereClause }),
        prisma.user.count({ where: { ...whereClause, isActive: true } }),
        prisma.user.count({ where: { ...whereClause, isActive: false } }),
        prisma.payrollRecord.aggregate({
          where: dateRange.startDate
            ? {
                payrollDate: {
                  gte: dateRange.startDate,
                  lte: dateRange.endDate,
                },
              }
            : {},
          _sum: { netPaid: true, bonusPaid: true },
        }),
        prisma.attendanceLog.aggregate({
          where: dateRange.startDate
            ? { date: { gte: dateRange.startDate, lte: dateRange.endDate } }
            : {},
          _count: { id: true },
          _avg: { workingHours: true },
        }),
      ]);

    const monthlyTrend = await prisma.payrollRecord.groupBy({
      by: ['payrollDate'],
      _sum: { netPaid: true },
      orderBy: { payrollDate: 'asc' },
      take: 12,
    });

    const monthMap: Record<string, number> = {};
    monthlyTrend.forEach((r) => {
      const key = monthKey(r.payrollDate);
      monthMap[key] = (monthMap[key] || 0) + Number(r._sum.netPaid || 0);
    });

    return {
      data: staff,
      total,
      page,
      limit,
      summary: {
        activeStaff: activeCount,
        formerStaff: formerCount,
        totalPayroll: Number(payrollAgg._sum.netPaid || 0),
        totalBonus: Number(payrollAgg._sum.bonusPaid || 0),
        attendanceRate: attendanceAgg._avg.workingHours
          ? parseFloat(Number(attendanceAgg._avg.workingHours).toFixed(1))
          : 0,
        attendanceLogs: attendanceAgg._count.id,
      },
      charts: {
        monthlyPayroll: Object.entries(monthMap).map(([month, amount]) => ({
          month: formatMonthLabel(month),
          payroll: amount,
        })),
      },
    };
  }

  async getInventory(filters: Record<string, unknown>) {
    const { page, limit, skip } = this.buildPagination(filters);
    const dateRange = parseDateRange(filters);

    const whereClause: Record<string, unknown> = {};
    if (filters.branchId) whereClause.branchId = filters.branchId;
    if (filters.status) whereClause.status = filters.status;
    const dateFilter = applyDateFilter('createdAt', dateRange);
    if (dateFilter) Object.assign(whereClause, dateFilter);
    if (filters.search) {
      whereClause.OR = [
        { id: { contains: filters.search, mode: 'insensitive' } },
        {
          requestedBy: {
            firstName: { contains: filters.search, mode: 'insensitive' },
          },
        },
      ];
    }

    const [
      inventory,
      total,
      stockAdded,
      stockRemoved,
      wasteAgg,
      transferCount,
      poCount,
    ] = await Promise.all([
      prisma.inventoryRequest.findMany({
        where: whereClause,
        include: {
          branch: { select: { name: true } },
          items: {
            include: { ingredient: { select: { name: true, unit: true } } },
          },
          requestedBy: { select: { firstName: true, lastName: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inventoryRequest.count({ where: whereClause }),
      prisma.stockMovement.aggregate({
        where: {
          type: StockMovementType.PURCHASE,
          ...(dateRange.startDate
            ? {
                createdAt: { gte: dateRange.startDate, lte: dateRange.endDate },
              }
            : {}),
        },
        _sum: { quantity: true },
      }),
      prisma.stockMovement.aggregate({
        where: {
          type: StockMovementType.CONSUMPTION,
          ...(dateRange.startDate
            ? {
                createdAt: { gte: dateRange.startDate, lte: dateRange.endDate },
              }
            : {}),
        },
        _sum: { quantity: true },
      }),
      prisma.wasteRecord.aggregate({
        where: dateRange.startDate
          ? { createdAt: { gte: dateRange.startDate, lte: dateRange.endDate } }
          : {},
        _sum: { quantity: true },
        _count: { id: true },
      }),
      prisma.inventoryTransfer.count({
        where: dateRange.startDate
          ? { createdAt: { gte: dateRange.startDate, lte: dateRange.endDate } }
          : {},
      }),
      prisma.purchaseOrder.count({
        where: {
          status: 'RECEIVED',
          ...(dateRange.startDate
            ? {
                receivedAt: {
                  gte: dateRange.startDate,
                  lte: dateRange.endDate,
                },
              }
            : {}),
        },
      }),
    ]);

    const currentStock = await prisma.inventory.aggregate({
      _sum: { quantity: true },
    });

    return {
      data: inventory,
      total,
      page,
      limit,
      summary: {
        stockAdded: Number(stockAdded._sum.quantity || 0),
        stockRemoved: Number(stockRemoved._sum.quantity || 0),
        wastage: Number(wasteAgg._sum.quantity || 0),
        wasteRecords: wasteAgg._count.id,
        transfers: transferCount,
        purchaseOrders: poCount,
        branchRequests: total,
        currentStock: Number(currentStock._sum.quantity || 0),
      },
      charts: {
        movementTrend: [
          { type: 'Added', value: Number(stockAdded._sum.quantity || 0) },
          { type: 'Removed', value: Number(stockRemoved._sum.quantity || 0) },
          { type: 'Wastage', value: Number(wasteAgg._sum.quantity || 0) },
          { type: 'Transfers', value: transferCount },
        ],
      },
    };
  }

  async getIngredients(filters: Record<string, unknown>) {
    const { page, limit, skip } = this.buildPagination(filters);
    const dateRange = parseDateRange(filters);

    const whereClause: Record<string, unknown> = {};
    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const dateWhere = dateRange.startDate
      ? { createdAt: { gte: dateRange.startDate, lte: dateRange.endDate } }
      : {};

    const [
      ingredients,
      total,
      consumedAgg,
      wastedAgg,
      receivedAgg,
      transferAgg,
    ] = await Promise.all([
      prisma.ingredient.findMany({
        where: whereClause,
        include: {
          consumptionLogs: { take: 5, orderBy: { date: 'desc' } },
          stockMovements: {
            where: dateWhere,
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { branch: { select: { name: true } } },
          },
          inventory: {
            select: { quantity: true, branch: { select: { name: true } } },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ingredient.count({ where: whereClause }),
      prisma.stockMovement.aggregate({
        where: { type: 'CONSUMPTION', ...dateWhere },
        _sum: { quantity: true },
      }),
      prisma.stockMovement.aggregate({
        where: { type: 'WASTE', ...dateWhere },
        _sum: { quantity: true },
      }),
      prisma.stockMovement.aggregate({
        where: { type: 'PURCHASE', ...dateWhere },
        _sum: { quantity: true },
      }),
      prisma.stockMovement.aggregate({
        where: { type: 'TRANSFER', ...dateWhere },
        _sum: { quantity: true },
      }),
    ]);

    const topConsumed = await prisma.stockMovement.groupBy({
      by: ['ingredientId'],
      where: { type: 'CONSUMPTION', ...dateWhere },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 7,
    });

    const topWasted = await prisma.stockMovement.groupBy({
      by: ['ingredientId'],
      where: { type: 'WASTE', ...dateWhere },
      _sum: { quantity: true },
    });
    const wasteMap = Object.fromEntries(
      topWasted.map((w) => [w.ingredientId, Number(w._sum.quantity || 0)])
    );

    const consumptionChart = await Promise.all(
      topConsumed.map(async (item) => {
        const ing = await prisma.ingredient.findUnique({
          where: { id: item.ingredientId },
          select: { name: true, costPrice: true },
        });
        return {
          name: ing?.name || 'Unknown',
          consumed: Number(item._sum.quantity || 0),
          wasted: wasteMap[item.ingredientId] || 0,
          cost: Number(ing?.costPrice || 0) * Number(item._sum.quantity || 0),
        };
      })
    );

    const costImpact = consumptionChart.reduce((s, c) => s + c.cost, 0);

    return {
      data: ingredients,
      total,
      page,
      limit,
      summary: {
        totalIngredients: total,
        totalConsumed: Number(consumedAgg._sum.quantity || 0),
        totalWasted: Number(wastedAgg._sum.quantity || 0),
        totalReceived: Number(receivedAgg._sum.quantity || 0),
        totalTransferred: Number(transferAgg._sum.quantity || 0),
        costImpact,
        highWasteAlerts: topWasted.filter(
          (w) => Number(w._sum.quantity || 0) > 10
        ).length,
      },
      charts: { consumptionMap: consumptionChart },
    };
  }

  async getSuppliers(filters: Record<string, unknown>) {
    const { page, limit, skip } = this.buildPagination(filters);
    const dateRange = parseDateRange(filters);

    const whereClause: Record<string, unknown> = {};
    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { contactPerson: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const poDateWhere = dateRange.startDate
      ? { orderedAt: { gte: dateRange.startDate, lte: dateRange.endDate } }
      : {};

    const [suppliers, total, spendAgg, allPOs] = await Promise.all([
      prisma.supplier.findMany({
        where: whereClause,
        include: {
          purchaseOrders: {
            where: poDateWhere,
            orderBy: { orderedAt: 'desc' },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplier.count({ where: whereClause }),
      prisma.purchaseOrder.aggregate({
        where: { status: 'RECEIVED', ...poDateWhere },
        _sum: { totalAmount: true },
      }),
      prisma.purchaseOrder.findMany({
        where: { status: 'RECEIVED', ...poDateWhere },
        select: {
          orderedAt: true,
          receivedAt: true,
          totalAmount: true,
        },
      }),
    ]);

    let onTime = 0;
    let delayed = 0;
    allPOs.forEach((po) => {
      if (po.receivedAt) {
        const daysLate =
          (po.receivedAt.getTime() - po.orderedAt.getTime()) /
          (1000 * 60 * 60 * 24);
        if (daysLate <= 7) onTime++;
        else delayed++;
      }
    });
    const totalDeliveries = onTime + delayed;
    const onTimePct =
      totalDeliveries > 0 ? (onTime / totalDeliveries) * 100 : 0;

    const monthSpend: Record<string, number> = {};
    allPOs.forEach((po) => {
      const key = monthKey(po.orderedAt);
      monthSpend[key] = (monthSpend[key] || 0) + Number(po.totalAmount);
    });

    return {
      data: suppliers,
      total,
      page,
      limit,
      summary: {
        totalSpend: Number(spendAgg._sum.totalAmount || 0),
        supplierCount: total,
        onTimePercent: parseFloat(onTimePct.toFixed(1)),
        delayedPercent: parseFloat((100 - onTimePct).toFixed(1)),
        totalOrders: allPOs.length,
      },
      charts: {
        monthlySpend: Object.entries(monthSpend)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, spend]) => ({ month: formatMonthLabel(month), spend })),
      },
    };
  }

  async getBranches(filters: Record<string, unknown>) {
    const { page, limit, skip } = this.buildPagination(filters);
    const dateRange = parseDateRange(filters);

    const whereClause: Record<string, unknown> = {};
    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const orderWhere = dateRange.startDate
      ? { createdAt: { gte: dateRange.startDate, lte: dateRange.endDate } }
      : {};

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              Order: true,
              inventoryRequests: true,
              workAssignments: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.branch.count({ where: whereClause }),
    ]);

    const branchStats = await Promise.all(
      branches.map(async (branch) => {
        const [
          revenueAgg,
          customerCount,
          staffCount,
          inventoryCost,
          ratingAgg,
          prevRevenue,
        ] = await Promise.all([
          prisma.order.aggregate({
            where: {
              branchId: branch.id,
              status: { in: [...DELIVERED_STATUSES] },
              ...orderWhere,
            },
            _sum: { totalAmount: true },
            _count: { id: true },
          }),
          prisma.order.groupBy({
            by: ['userId'],
            where: { branchId: branch.id, ...orderWhere },
          }),
          prisma.workAssignment.count({
            where: { branchId: branch.id },
          }),
          prisma.purchaseOrder.aggregate({
            where: { branchId: branch.id, status: 'RECEIVED', ...orderWhere },
            _sum: { totalAmount: true },
          }),
          prisma.review.aggregate({
            where: { product: { restaurantId: branch.restaurantId } },
            _avg: { rating: true },
          }),
          prisma.order.aggregate({
            where: {
              branchId: branch.id,
              status: { in: [...DELIVERED_STATUSES] },
              createdAt: dateRange.startDate
                ? {
                    gte: new Date(
                      dateRange.startDate.getTime() -
                        (dateRange.endDate!.getTime() -
                          dateRange.startDate.getTime())
                    ),
                    lt: dateRange.startDate,
                  }
                : undefined,
            },
            _sum: { totalAmount: true },
          }),
        ]);

        const revenue = Number(revenueAgg._sum.totalAmount || 0);
        const invCost = Number(inventoryCost._sum.totalAmount || 0);
        const profit = revenue - invCost;

        return {
          branchId: branch.id,
          name: branch.name,
          city: branch.city,
          revenue,
          orders: revenueAgg._count.id,
          customers: customerCount.length,
          staff: staffCount,
          inventoryCost: invCost,
          profit,
          rating: ratingAgg._avg.rating
            ? parseFloat(Number(ratingAgg._avg.rating).toFixed(1))
            : null,
          growthPercent: calcTrend(
            revenue,
            Number(prevRevenue._sum.totalAmount || 0)
          ),
        };
      })
    );

    const totalRevenue = branchStats.reduce((s, b) => s + b.revenue, 0);
    const totalOrders = branchStats.reduce((s, b) => s + b.orders, 0);
    const totalCustomers = branchStats.reduce((s, b) => s + b.customers, 0);

    return {
      data: branches.map((b, i) => ({ ...b, stats: branchStats[i] })),
      total,
      page,
      limit,
      summary: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        branches: total,
      },
      charts: {
        branchComparison: branchStats
          .sort((a, b) => b.revenue - a.revenue)
          .map((b) => ({
            name: b.name.replace('ABC ', ''),
            orders: b.orders,
            revenue: b.revenue,
            profit: b.profit,
          })),
      },
    };
  }

  async getCustomers(filters: Record<string, unknown>) {
    const { page, limit, skip } = this.buildPagination(filters);
    const dateRange = parseDateRange(filters);

    const whereClause: Record<string, unknown> = { role: 'CUSTOMER' };
    if (filters.search) {
      whereClause.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const orderWhere = dateRange.startDate
      ? { createdAt: { gte: dateRange.startDate, lte: dateRange.endDate } }
      : {};

    const [customers, total, spendAgg, couponUsageCount, refundCount] =
      await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          include: {
            _count: { select: { orders: true, couponUsages: true } },
            orders: {
              where: orderWhere,
              orderBy: { createdAt: 'desc' },
              take: 5,
              select: {
                totalAmount: true,
                createdAt: true,
                status: true,
                items: {
                  include: { product: { include: { category: true } } },
                },
              },
            },
            couponUsages: { take: 5, include: { coupon: true } },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where: whereClause }),
        prisma.order.aggregate({
          where: {
            user: { role: 'CUSTOMER' },
            status: { in: [...DELIVERED_STATUSES] },
            ...orderWhere,
          },
          _sum: { totalAmount: true },
          _avg: { totalAmount: true },
        }),
        prisma.couponUsage.count({
          where: dateRange.startDate
            ? { usedAt: { gte: dateRange.startDate, lte: dateRange.endDate } }
            : {},
        }),
        prisma.refund.count({
          where: dateRange.startDate
            ? {
                createdAt: { gte: dateRange.startDate, lte: dateRange.endDate },
              }
            : {},
        }),
      ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [newCustomers, returningCustomers, totalCustomerCount] =
      await Promise.all([
        prisma.user.count({
          where: { role: 'CUSTOMER', createdAt: { gte: thirtyDaysAgo } },
        }),
        prisma.order.groupBy({
          by: ['userId'],
          where: { createdAt: { gte: thirtyDaysAgo } },
          having: { userId: { _count: { gt: 1 } } },
        }),
        prisma.user.count({ where: { role: 'CUSTOMER' } }),
      ]);

    const retentionPct =
      totalCustomerCount > 0
        ? parseFloat(
            ((returningCustomers.length / totalCustomerCount) * 100).toFixed(1)
          )
        : 0;

    const monthlyGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      where: { role: 'CUSTOMER', createdAt: { gte: sixtyDaysAgo } },
    });
    const growthMap: Record<string, { new: number; repeat: number }> = {};
    monthlyGrowth.forEach((u) => {
      const key = formatMonthLabel(monthKey(u.createdAt));
      if (!growthMap[key]) growthMap[key] = { new: 0, repeat: 0 };
      growthMap[key].new++;
    });

    return {
      data: customers,
      total,
      page,
      limit,
      summary: {
        totalCustomers: total,
        avgSpend: Number(spendAgg._avg.totalAmount || 0),
        totalSpend: Number(spendAgg._sum.totalAmount || 0),
        retention: retentionPct,
        newCustomers,
        couponsUsed: couponUsageCount,
        refundRequests: refundCount,
      },
      charts: {
        customerGrowth: Object.entries(growthMap).map(([month, data]) => ({
          month,
          new: data.new,
          repeat: data.repeat,
        })),
      },
    };
  }

  async getFinance(filters: Record<string, unknown>) {
    const dateRange = parseDateRange(filters);
    const orderWhere: Record<string, unknown> = {};
    const payrollWhere: Record<string, unknown> = {};
    const purchaseWhere: Record<string, unknown> = {};
    const refundWhere: Record<string, unknown> = {};

    if (filters.branchId) {
      orderWhere.branchId = filters.branchId;
      purchaseWhere.branchId = filters.branchId;
      payrollWhere.user = {
        workAssignments: { some: { branchId: filters.branchId } },
      };
    }

    if (dateRange.startDate && dateRange.endDate) {
      orderWhere.createdAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      };
      payrollWhere.payrollDate = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      };
      purchaseWhere.createdAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      };
      refundWhere.createdAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      };
    }

    const [
      totalRevenue,
      totalPayroll,
      totalPurchases,
      totalRefunds,
      monthlyOrders,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { ...orderWhere, status: { in: [...DELIVERED_STATUSES] } },
        _sum: { totalAmount: true, tax: true },
      }),
      prisma.payrollRecord.aggregate({
        where: payrollWhere,
        _sum: { netPaid: true, bonusPaid: true, deductions: true },
      }),
      prisma.purchaseOrder.aggregate({
        where: { ...purchaseWhere, status: 'RECEIVED' },
        _sum: { totalAmount: true },
      }),
      prisma.refund.aggregate({
        where: { ...refundWhere, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.order.findMany({
        where: { ...orderWhere, status: { in: [...DELIVERED_STATUSES] } },
        select: { totalAmount: true, tax: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const revenue = Number(totalRevenue._sum.totalAmount || 0);
    const payroll = Number(totalPayroll._sum.netPaid || 0);
    const purchases = Number(totalPurchases._sum.totalAmount || 0);
    const refunds = Number(totalRefunds._sum.amount || 0);
    const taxes = Number(totalRevenue._sum.tax || 0);
    const expenses = payroll + purchases + refunds;
    const profit = revenue - expenses - taxes;

    const monthMap: Record<string, { revenue: number; expenses: number }> = {};
    monthlyOrders.forEach((o) => {
      const key = formatMonthLabel(monthKey(o.createdAt));
      if (!monthMap[key]) monthMap[key] = { revenue: 0, expenses: 0 };
      monthMap[key].revenue += Number(o.totalAmount);
    });

    const ledger = [
      { type: 'Revenue', category: 'Orders', amount: revenue },
      { type: 'Expense', category: 'Payroll', amount: -payroll },
      { type: 'Expense', category: 'Inventory', amount: -purchases },
      { type: 'Expense', category: 'Refunds', amount: -refunds },
      { type: 'Tax', category: 'GST', amount: -taxes },
    ];

    const branchProfitability = filters.branchId
      ? [{ branchId: filters.branchId, profit }]
      : await Promise.all(
          (
            await prisma.branch.findMany({ select: { id: true, name: true } })
          ).map(async (b) => {
            const rev = await prisma.order.aggregate({
              where: {
                branchId: b.id,
                status: { in: [...DELIVERED_STATUSES] },
                ...orderWhere,
              },
              _sum: { totalAmount: true },
            });
            const exp = await prisma.purchaseOrder.aggregate({
              where: { branchId: b.id, status: 'RECEIVED', ...purchaseWhere },
              _sum: { totalAmount: true },
            });
            return {
              branch: b.name,
              profit:
                Number(rev._sum.totalAmount || 0) -
                Number(exp._sum.totalAmount || 0),
            };
          })
        );

    return {
      data: ledger,
      summary: {
        revenue,
        payroll,
        expenses,
        profit,
        purchases,
        refunds,
        taxes,
        gst: taxes,
        bonus: Number(totalPayroll._sum.bonusPaid || 0),
        deductions: Number(totalPayroll._sum.deductions || 0),
      },
      charts: {
        profitTrend: Object.entries(monthMap).map(([month, d]) => ({
          month,
          revenue: d.revenue,
          profit: d.revenue * 0.28,
        })),
        branchProfitability,
      },
    };
  }

  async getAttendance(filters: Record<string, unknown>) {
    const { page, limit, skip } = this.buildPagination(filters);
    const dateRange = parseDateRange(filters);

    const whereClause: Record<string, unknown> = {};
    if (filters.branchId) whereClause.branchId = filters.branchId;

    if (filters.date) {
      const d = new Date(filters.date as string);
      whereClause.date = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    } else if (dateRange.startDate && dateRange.endDate) {
      whereClause.date = { gte: dateRange.startDate, lte: dateRange.endDate };
    }

    if (filters.search) {
      whereClause.user = {
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
        ],
      };
    }

    const [attendance, total, hoursAgg, lateCount, leaveCount] =
      await Promise.all([
        prisma.attendanceLog.findMany({
          where: whereClause,
          include: {
            user: { select: { firstName: true, lastName: true, role: true } },
            branch: { select: { name: true } },
          },
          skip,
          take: limit,
          orderBy: { date: 'desc' },
        }),
        prisma.attendanceLog.count({ where: whereClause }),
        prisma.attendanceLog.aggregate({
          where: whereClause,
          _sum: { workingHours: true },
          _avg: { workingHours: true },
        }),
        prisma.attendanceLog.count({
          where: { ...whereClause, isLate: true },
        }),
        prisma.leaveRecord.count({
          where: dateRange.startDate
            ? {
                startDate: { gte: dateRange.startDate, lte: dateRange.endDate },
              }
            : {},
        }),
      ]);

    const dailyAttendance = await prisma.attendanceLog.groupBy({
      by: ['date'],
      where: whereClause,
      _count: { id: true },
      orderBy: { date: 'asc' },
      take: 30,
    });

    return {
      data: attendance,
      total,
      page,
      limit,
      summary: {
        totalRecords: total,
        totalHours: Number(hoursAgg._sum.workingHours || 0),
        avgHours: Number(hoursAgg._avg.workingHours || 0),
        lateMarks: lateCount,
        leaves: leaveCount,
      },
      charts: {
        dailyAttendance: dailyAttendance.map((d) => ({
          date: d.date.toISOString().split('T')[0],
          present: d._count.id,
        })),
      },
    };
  }

  async getSalary(filters: Record<string, unknown>) {
    const { page, limit, skip } = this.buildPagination(filters);
    const dateRange = parseDateRange(filters);

    const whereClause: Record<string, unknown> = {};
    if (dateRange.startDate && dateRange.endDate) {
      whereClause.payrollDate = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      };
    }
    if (filters.search) {
      whereClause.user = {
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
        ],
      };
    }

    const [salary, total, payrollAgg] = await Promise.all([
      prisma.payrollRecord.findMany({
        where: whereClause,
        include: {
          user: { select: { firstName: true, lastName: true, role: true } },
        },
        skip,
        take: limit,
        orderBy: { payrollDate: 'desc' },
      }),
      prisma.payrollRecord.count({ where: whereClause }),
      prisma.payrollRecord.aggregate({
        where: whereClause,
        _sum: {
          baseSalary: true,
          bonusPaid: true,
          deductions: true,
          netPaid: true,
          incentives: true,
        },
      }),
    ]);

    const monthlyPayroll = await prisma.payrollRecord.groupBy({
      by: ['payrollDate'],
      where: whereClause,
      _sum: { baseSalary: true, bonusPaid: true, netPaid: true },
      orderBy: { payrollDate: 'asc' },
    });

    const monthMap: Record<
      string,
      { base: number; bonus: number; net: number }
    > = {};
    monthlyPayroll.forEach((r) => {
      const key = formatMonthLabel(monthKey(r.payrollDate));
      if (!monthMap[key]) monthMap[key] = { base: 0, bonus: 0, net: 0 };
      monthMap[key].base += Number(r._sum.baseSalary || 0);
      monthMap[key].bonus += Number(r._sum.bonusPaid || 0);
      monthMap[key].net += Number(r._sum.netPaid || 0);
    });

    return {
      data: salary,
      total,
      page,
      limit,
      summary: {
        totalBase: Number(payrollAgg._sum.baseSalary || 0),
        totalBonus: Number(payrollAgg._sum.bonusPaid || 0),
        totalDeductions: Number(payrollAgg._sum.deductions || 0),
        totalOvertime: Number(payrollAgg._sum.incentives || 0),
        netPay: Number(payrollAgg._sum.netPaid || 0),
        records: total,
      },
      charts: {
        monthlyPayroll: Object.entries(monthMap).map(([month, d]) => ({
          month,
          base: d.base,
          bonus: d.bonus,
          net: d.net,
        })),
      },
    };
  }

  async getAudit(filters: Record<string, unknown>) {
    const { page, limit, skip } = this.buildPagination(filters);
    const dateRange = parseDateRange(filters);

    const whereClause: Record<string, unknown> = {};
    if (filters.action) whereClause.action = filters.action;
    if (filters.userId) whereClause.userId = filters.userId;
    if (filters.module) whereClause.entity = filters.module;
    const dateFilter = applyDateFilter('timestamp', dateRange);
    if (dateFilter) Object.assign(whereClause, dateFilter);
    if (filters.search) {
      whereClause.OR = [
        {
          user: {
            firstName: { contains: filters.search, mode: 'insensitive' },
          },
        },
        {
          user: { lastName: { contains: filters.search, mode: 'insensitive' } },
        },
        { entity: { contains: filters.search, mode: 'insensitive' } },
        { ipAddress: { contains: filters.search, mode: 'insensitive' } },
        { action: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [auditLogs, total, actionGroups] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count({ where: whereClause }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where: whereClause,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      data: auditLogs,
      total,
      page,
      limit,
      summary: {
        totalLogs: total,
        uniqueActions: actionGroups.length,
      },
      charts: {
        actionBreakdown: actionGroups.map((a) => ({
          action: a.action,
          count: a._count.id,
        })),
      },
    };
  }

  async getSystemLogs(filters: Record<string, unknown>) {
    const { page, limit, skip } = this.buildPagination(filters);
    const dateRange = parseDateRange(filters);

    const whereClause: Record<string, unknown> = {};
    if (filters.module) whereClause.module = filters.module;
    if (filters.level) whereClause.level = filters.level;
    const dateFilter = applyDateFilter('timestamp', dateRange);
    if (dateFilter) Object.assign(whereClause, dateFilter);
    if (filters.search) {
      whereClause.OR = [
        { message: { contains: filters.search, mode: 'insensitive' } },
        { module: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [logs, total, moduleGroups, errorCount] = await Promise.all([
      prisma.systemLog.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.systemLog.count({ where: whereClause }),
      prisma.systemLog.groupBy({
        by: ['module'],
        where: whereClause,
        _count: { id: true },
      }),
      prisma.systemLog.count({
        where: { ...whereClause, level: 'ERROR' },
      }),
    ]);

    const avgDuration = await prisma.systemLog.aggregate({
      where: { ...whereClause, duration: { not: null } },
      _avg: { duration: true },
    });

    return {
      data: logs,
      total,
      page,
      limit,
      summary: {
        totalEvents: total,
        errors: errorCount,
        avgResponseMs: Math.round(Number(avgDuration._avg.duration || 0)),
      },
      charts: {
        moduleBreakdown: moduleGroups.map((m) => ({
          module: m.module,
          count: m._count.id,
        })),
      },
    };
  }
}

export const historyService = new HistoryService();
