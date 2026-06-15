import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class HistoryService {
  async getOrders(filters: any) {
    const { page = 1, limit = 50, branchId, startDate, endDate, status } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (branchId) whereClause.branchId = branchId;
    if (status) whereClause.orderStatus = status;
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true } },
          branch: { select: { id: true, name: true } },
          items: true,
          kitchenOrders: {
            include: {
              assignedUser: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          deliveryAssignment: {
            include: {
              driver: {
                include: { user: { select: { id: true, firstName: true, lastName: true } } },
              },
            },
          },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    return { data: orders, total, page: Number(page), limit: Number(limit) };
  }

  async getStaff(filters: any) {
    const { page = 1, limit = 50, branchId, role, status } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (role) whereClause.role = role;
    if (status) whereClause.isActive = status === 'ACTIVE';
    // To filter by branch we would need to check WorkAssignments

    const [staff, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          employeeTimeline: true,
          salaryRevisions: true,
          workAssignments: {
            include: { branch: true },
            orderBy: { date: 'desc' },
            take: 1,
          },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return { data: staff, total, page: Number(page), limit: Number(limit) };
  }

  async getInventory(filters: any) {
    const { page = 1, limit = 50, branchId, status } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (branchId) whereClause.branchId = branchId;
    if (status) whereClause.status = status;

    const [inventory, total] = await Promise.all([
      prisma.inventoryRequest.findMany({
        where: whereClause,
        include: {
          branch: { select: { name: true } },
          items: { include: { ingredient: { select: { name: true } } } },
          requestedBy: { select: { firstName: true, lastName: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inventoryRequest.count({ where: whereClause }),
    ]);

    return { data: inventory, total, page: Number(page), limit: Number(limit) };
  }

  async getIngredients(filters: any) {
    const { page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const [ingredients, total] = await Promise.all([
      prisma.ingredient.findMany({
        include: {
          consumptions: { take: 5, orderBy: { date: 'desc' } },
          stockMovements: { take: 5, orderBy: { createdAt: 'desc' } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ingredient.count(),
    ]);

    return { data: ingredients, total, page: Number(page), limit: Number(limit) };
  }

  async getSuppliers(filters: any) {
    const { page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        include: {
          purchaseOrders: {
            orderBy: { orderedAt: 'desc' },
          },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplier.count(),
    ]);

    return { data: suppliers, total, page: Number(page), limit: Number(limit) };
  }

  async getBranches(filters: any) {
    const { page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        include: {
          _count: {
            select: { Order: true, inventoryRequests: true, workAssignments: true },
          },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.branch.count(),
    ]);

    return { data: branches, total, page: Number(page), limit: Number(limit) };
  }

  async getCustomers(filters: any) {
    const { page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        include: {
          _count: {
            select: { orders: true, couponUsages: true },
          },
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { totalAmount: true, createdAt: true },
          },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);

    return { data: customers, total, page: Number(page), limit: Number(limit) };
  }

  async getFinance(filters: any) {
    // Simple mock finance aggregation due to DB complexity for a single query
    // You would typically do GroupBy or raw queries here
    const { startDate, endDate } = filters;
    const whereClause: any = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const totalRevenue = await prisma.order.aggregate({
      where: whereClause,
      _sum: { totalAmount: true },
    });

    const totalPayroll = await prisma.payrollRecord.aggregate({
      where: {
        payrollDate: whereClause.createdAt,
      },
      _sum: { netPaid: true },
    });

    return {
      revenue: totalRevenue._sum.totalAmount || 0,
      payroll: totalPayroll._sum.netPaid || 0,
      expenses: 0,
      profit: Number(totalRevenue._sum.totalAmount || 0) - Number(totalPayroll._sum.netPaid || 0),
    };
  }

  async getAttendance(filters: any) {
    const { page = 1, limit = 50, branchId, date } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (branchId) whereClause.branchId = branchId;
    if (date) {
      const d = new Date(date);
      whereClause.date = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const [attendance, total] = await Promise.all([
      prisma.attendanceLog.findMany({
        where: whereClause,
        include: {
          user: { select: { firstName: true, lastName: true, role: true } },
          branch: { select: { name: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { date: 'desc' },
      }),
      prisma.attendanceLog.count({ where: whereClause }),
    ]);

    return { data: attendance, total, page: Number(page), limit: Number(limit) };
  }

  async getSalary(filters: any) {
    const { page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const [salary, total] = await Promise.all([
      prisma.payrollRecord.findMany({
        include: {
          user: { select: { firstName: true, lastName: true, role: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { payrollDate: 'desc' },
      }),
      prisma.payrollRecord.count(),
    ]);

    return { data: salary, total, page: Number(page), limit: Number(limit) };
  }

  async getAudit(filters: any) {
    const { page = 1, limit = 50, action, userId } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (action) whereClause.action = action;
    if (userId) whereClause.userId = userId;

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count({ where: whereClause }),
    ]);

    return { data: auditLogs, total, page: Number(page), limit: Number(limit) };
  }
}

export const historyService = new HistoryService();
