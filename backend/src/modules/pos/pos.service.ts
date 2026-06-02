import { prisma } from '../../config/db';
import AppError from '../../utils/appError';
import { getIO } from '../../config/socket';
import { OrderStatus, OrderType, POSOrderStatus, POSPaymentMethod } from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';
import { POSActivityLog } from '../../database/mongo/POSActivityLog';
import { POSAnalyticsEvent } from '../../database/mongo/POSAnalyticsEvent';

export class POSService {
  public static async createTerminal(data: { branchId: string; terminalName: string }) {
    return prisma.pOSTerminal.create({ data });
  }

  public static async getTerminals(branchId: string) {
    return prisma.pOSTerminal.findMany({ where: { branchId } });
  }

  public static async startShift(cashierId: string, terminalId: string, openingAmount: number) {
    const activeDrawer = await prisma.cashDrawer.findFirst({
      where: { terminalId, status: 'OPEN' }
    });

    if (activeDrawer) {
      throw new AppError('A shift is already open on this terminal.', 400);
    }

    return prisma.cashDrawer.create({
      data: {
        terminalId,
        cashierId,
        openingAmount,
        currentBalance: openingAmount,
      }
    });
  }

  public static async endShift(drawerId: string, closingAmount: number, notes?: string) {
    const drawer = await prisma.cashDrawer.findUnique({ where: { id: drawerId }, include: { terminal: true } });
    if (!drawer) throw new AppError('Drawer not found.', 404);
    if (drawer.status === 'CLOSED') throw new AppError('Shift already closed.', 400);

    const updated = await prisma.cashDrawer.update({
      where: { id: drawerId },
      data: {
        closingAmount,
        status: 'CLOSED',
        closedAt: new Date(),
        notes
      }
    });

    await POSAnalyticsEvent.create({
      terminalId: drawer.terminalId,
      branchId: drawer.terminal.branchId,
      cashierId: drawer.cashierId,
      eventType: 'SHIFT_ENDED',
      metrics: { expected: Number(drawer.currentBalance), actual: closingAmount, variance: closingAmount - Number(drawer.currentBalance) }
    });

    return updated;
  }

  public static async createPOSOrder(cashierId: string, data: any) {
    const terminal = await prisma.pOSTerminal.findUnique({ where: { id: data.terminalId } });
    if (!terminal) throw new AppError('Terminal not found', 404);

    // Calculate totals
    const products = await prisma.product.findMany({
      where: { id: { in: data.items.map((i: any) => i.productId) } }
    });

    let subtotal = 0;
    const orderItemsForCreate: any[] = [];
    const kitchenTasksForCreate: any[] = [];

    for (const item of data.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;
      // In reality, match variant price if present. Fallback to basePrice.
      subtotal += Number(product.basePrice) * item.quantity;
      
      orderItemsForCreate.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: product.basePrice,
      });

      kitchenTasksForCreate.push({
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes
      });
    }

    const tax = subtotal * 0.05;
    const discount = data.discount || 0;
    const totalAmount = subtotal + tax - discount;

    const coreOrder = await prisma.order.create({
      data: {
        userId: cashierId, // Placeholder until Customer profile attaches
        branchId: terminal.branchId,
        tableId: data.tableId,
        orderType: data.orderType,
        subtotal,
        tax,
        deliveryFee: 0,
        discount,
        totalAmount,
        status: OrderStatus.PLACED,
        items: { create: orderItemsForCreate },
        statusHistory: { create: { newStatus: OrderStatus.PLACED, changedBy: cashierId } },
        kitchenOrder: {
          create: {
            priority: 'MEDIUM',
            status: 'QUEUED',
            tasks: { create: kitchenTasksForCreate }
          }
        }
      },
      include: { items: true, kitchenOrder: true }
    });

    const posOrder = await prisma.pOSOrder.create({
      data: {
        terminalId: terminal.id,
        cashierId,
        orderId: coreOrder.id,
        status: 'OPEN'
      },
      include: { order: { include: { items: true, kitchenOrder: true } } }
    });

    getIO().to(`branch_${terminal.branchId}`).emit('pos-order-created', posOrder);

    return posOrder;
  }

  public static async getPOSOrder(posOrderId: string) {
    return prisma.pOSOrder.findUnique({
      where: { id: posOrderId },
      include: {
        order: { include: { items: { include: { product: true } }, table: true } },
        payments: true,
        receipt: true,
        terminal: true
      }
    });
  }

  public static async processPayment(cashierId: string, posOrderId: string, payments: any[]) {
    const posOrder = await prisma.pOSOrder.findUnique({
      where: { id: posOrderId },
      include: { order: { include: { kitchenOrder: true } }, terminal: true, payments: true }
    });

    if (!posOrder) throw new AppError('POS Order not found', 404);
    if (posOrder.status === 'PAID') throw new AppError('Order is already paid', 400);

    const requiredTotal = Number(posOrder.order.totalAmount);
    const existingPaymentsTotal = posOrder.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const incomingTotal = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    if (existingPaymentsTotal + incomingTotal < requiredTotal) {
      // It's a partial payment
      await prisma.$transaction(
        payments.map(p => prisma.pOSPayment.create({
          data: { posOrderId, method: p.method, amount: p.amount, transactionReference: p.transactionReference }
        }))
      );
      
      // Update cash drawer for cash payments
      for (const p of payments) {
        if (p.method === 'CASH') {
          await prisma.cashDrawer.updateMany({
            where: { terminalId: posOrder.terminalId, status: 'OPEN' },
            data: { currentBalance: { increment: p.amount } }
          });
        }
      }

      return { status: 'PARTIAL', remaining: requiredTotal - existingPaymentsTotal - incomingTotal };
    }

    // Fully Paid
    const createdPayments = await prisma.$transaction(async (tx) => {
      const pmts = await Promise.all(payments.map(p => tx.pOSPayment.create({
        data: { posOrderId, method: p.method, amount: p.amount, transactionReference: p.transactionReference }
      })));

      // Mark POS Order as Paid
      await tx.pOSOrder.update({ where: { id: posOrderId }, data: { status: 'PAID' } });

      // Mark Core Order as ACCEPTED/PREPARING
      await tx.order.update({
        where: { id: posOrder.orderId },
        data: { status: OrderStatus.PREPARING }
      });

      // Update cash drawer
      for (const p of pmts) {
        if (p.method === 'CASH') {
          await tx.cashDrawer.updateMany({
            where: { terminalId: posOrder.terminalId, status: 'OPEN' },
            data: { currentBalance: { increment: p.amount } }
          });
        }
      }

      // Generate Receipt
      const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;
      await tx.receipt.create({
        data: { posOrderId, receiptNumber }
      });

      return pmts;
    });

    // Post Transaction side effects
    await POSActivityLog.create({ terminalId: posOrder.terminalId, cashierId, action: 'PAYMENT_COMPLETED', details: { posOrderId, amount: incomingTotal } });

    // Deduct Inventory automatically since it's going straight to prep
    try {
      await InventoryService.deductForOrder(posOrder.orderId);
    } catch (e) {
      console.error('Auto deduction failed in POS:', e);
    }

    // Emit real-time events
    getIO().to(`branch_${posOrder.terminal.branchId}`).emit('payment-completed', { posOrderId, status: 'PAID' });
    getIO().to('staff_room').emit('kds_new_order', posOrder.order.kitchenOrder);

    return { status: 'PAID', payments: createdPayments };
  }

  public static async getReceipt(posOrderId: string) {
    return prisma.receipt.findUnique({
      where: { posOrderId },
      include: {
        posOrder: {
          include: {
            order: { include: { items: { include: { product: true } } } },
            payments: true,
            terminal: true,
            cashier: true
          }
        }
      }
    });
  }

  public static async getTodayAnalytics(branchId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const posOrders = await prisma.pOSOrder.findMany({
      where: { terminal: { branchId }, createdAt: { gte: today }, status: 'PAID' },
      include: { order: true, payments: true }
    });

    const totalSales = posOrders.reduce((sum, o) => sum + Number(o.order.totalAmount), 0);
    const orderCount = posOrders.length;
    
    let cashSales = 0;
    let digitalSales = 0;

    posOrders.forEach(o => {
      o.payments.forEach(p => {
        if (p.method === 'CASH') cashSales += Number(p.amount);
        else digitalSales += Number(p.amount);
      });
    });

    return { totalSales, orderCount, cashSales, digitalSales };
  }
}
