import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class HistoryService {
  async getOrders(filters: any) {
    const {
      page = 1,
      limit = 50,
      branchId,
      startDate,
      endDate,
      status,
      search,
    } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (branchId) whereClause.branchId = branchId;
    if (status) whereClause.status = status;
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          branch: { select: { id: true, name: true } },
          items: true,
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
    const { page = 1, limit = 50, branchId, role, status, search } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (role) whereClause.role = role;
    if (status) whereClause.isActive = status === 'ACTIVE';
    if (branchId) {
      whereClause.workAssignments = {
        some: { branchId },
      };
    }
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

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
    const {
      page = 1,
      limit = 50,
      branchId,
      status,
      search,
      startDate,
      endDate,
    } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (branchId) whereClause.branchId = branchId;
    if (status) whereClause.status = status;
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        {
          requestedBy: { firstName: { contains: search, mode: 'insensitive' } },
        },
        {
          requestedBy: { lastName: { contains: search, mode: 'insensitive' } },
        },
      ];
    }

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
    const { page = 1, limit = 50, search } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [ingredients, total] = await Promise.all([
      prisma.ingredient.findMany({
        where: whereClause,
        include: {
          consumptionLogs: { take: 5, orderBy: { date: 'desc' } },
          stockMovements: { take: 5, orderBy: { createdAt: 'desc' } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ingredient.count({ where: whereClause }),
    ]);

    return {
      data: ingredients,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async getSuppliers(filters: any) {
    const { page = 1, limit = 50, search } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where: whereClause,
        include: {
          purchaseOrders: {
            orderBy: { orderedAt: 'desc' },
          },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplier.count({ where: whereClause }),
    ]);

    return { data: suppliers, total, page: Number(page), limit: Number(limit) };
  }

  async getBranches(filters: any) {
    const { page = 1, limit = 50, search } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

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
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.branch.count({ where: whereClause }),
    ]);

    return { data: branches, total, page: Number(page), limit: Number(limit) };
  }

  async getCustomers(filters: any) {
    const { page = 1, limit = 50, search } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = { role: 'CUSTOMER' };
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
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
      prisma.user.count({ where: whereClause }),
    ]);

    return { data: customers, total, page: Number(page), limit: Number(limit) };
  }

  async getFinance(filters: any) {
    const { startDate, endDate, branchId } = filters;
    const orderWhere: any = {};
    const payrollWhere: any = {};
    const purchaseWhere: any = {};
    const refundWhere: any = {};

    if (branchId) {
      orderWhere.branchId = branchId;
      purchaseWhere.branchId = branchId;
      // Note: PayrollRecord doesn't have branchId directly in schema, but we can filter by user workAssignments
      payrollWhere.user = {
        workAssignments: {
          some: { branchId },
        },
      };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      orderWhere.createdAt = { gte: start, lte: end };
      payrollWhere.payrollDate = { gte: start, lte: end };
      purchaseWhere.createdAt = { gte: start, lte: end };
      refundWhere.createdAt = { gte: start, lte: end };
    }

    const [totalRevenue, totalPayroll, totalPurchases, totalRefunds] =
      await Promise.all([
        prisma.order.aggregate({
          where: { ...orderWhere, status: 'DELIVERED' },
          _sum: { totalAmount: true, tax: true },
        }),
        prisma.payrollRecord.aggregate({
          where: payrollWhere,
          _sum: { netPaid: true },
        }),
        prisma.purchaseOrder.aggregate({
          where: { ...purchaseWhere, status: 'RECEIVED' },
          _sum: { totalAmount: true },
        }),
        prisma.refund.aggregate({
          where: { ...refundWhere, status: 'COMPLETED' },
          _sum: { amount: true },
        }),
      ]);

    const revenue = Number(totalRevenue._sum.totalAmount || 0);
    const payroll = Number(totalPayroll._sum.netPaid || 0);
    const purchases = Number(totalPurchases._sum.totalAmount || 0);
    const refunds = Number(totalRefunds._sum.amount || 0);
    const taxes = Number(totalRevenue._sum.tax || 0);

    const expenses = payroll + purchases + refunds + taxes;
    const profit = revenue - expenses;

    return {
      revenue,
      payroll,
      expenses,
      profit,
      purchases,
      refunds,
      taxes,
    };
  }

  async getAttendance(filters: any) {
    const {
      page = 1,
      limit = 50,
      branchId,
      date,
      startDate,
      endDate,
      search,
    } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (branchId) whereClause.branchId = branchId;

    if (date) {
      const d = new Date(date);
      whereClause.date = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    } else if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (search) {
      whereClause.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
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

    return {
      data: attendance,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async getSalary(filters: any) {
    const { page = 1, limit = 50, search, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (startDate && endDate) {
      whereClause.payrollDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (search) {
      whereClause.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [salary, total] = await Promise.all([
      prisma.payrollRecord.findMany({
        where: whereClause,
        include: {
          user: { select: { firstName: true, lastName: true, role: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { payrollDate: 'desc' },
      }),
      prisma.payrollRecord.count({ where: whereClause }),
    ]);

    return { data: salary, total, page: Number(page), limit: Number(limit) };
  }

  async getAudit(filters: any) {
    const {
      page = 1,
      limit = 50,
      action,
      userId,
      search,
      startDate,
      endDate,
    } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (action) whereClause.action = action;
    if (userId) whereClause.userId = userId;
    if (startDate && endDate) {
      whereClause.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (search) {
      whereClause.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { entity: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [auditLogs, total] = await Promise.all([
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
        take: Number(limit),
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count({ where: whereClause }),
    ]);

    return { data: auditLogs, total, page: Number(page), limit: Number(limit) };
  }
}

export const historyService = new HistoryService();
