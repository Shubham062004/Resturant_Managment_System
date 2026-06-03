import { prisma } from '../../config/db';
import { KitchenEvent } from '../../database/mongo/KitchenEvent';
import { KitchenMetric } from '../../database/mongo/KitchenMetric';
import AppError from '../../utils/appError';
import { getIO } from '../../config/socket';
import { KitchenOrderStatus, KitchenPriority } from '@prisma/client';
import { DeliveryService } from '../delivery/delivery.service';
import { InventoryService } from '../inventory/inventory.service';

export class KitchenService {
  /**
   * Get all active kitchen orders
   */
  public static async getActiveOrders() {
    return prisma.kitchenOrder.findMany({
      where: {
        status: {
          not: 'COMPLETED',
        },
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        station: true,
        assignedUser: true,
        tasks: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });
  }

  /**
   * Get all kitchen stations
   */
  public static async getStations() {
    return prisma.kitchenStation.findMany({
      where: { active: true },
    });
  }

  /**
   * Create a new kitchen station
   */
  public static async createStation(name: string, description?: string) {
    return prisma.kitchenStation.create({
      data: { name, description },
    });
  }

  /**
   * Update order status
   */
  public static async updateOrderStatus(id: string, status: KitchenOrderStatus) {
    const kOrder = await prisma.kitchenOrder.findUnique({ where: { id } });
    if (!kOrder) throw new AppError('Kitchen order not found', 404);

    const updateData: any = { status };
    if (status === 'COOKING' && !kOrder.startedAt) {
      updateData.startedAt = new Date();
      // Auto Deduct Inventory when cooking starts
      try {
        await InventoryService.deductForOrder(kOrder.orderId);
      } catch (e: any) {
        console.error('Failed to auto-deduct inventory:', e.message);
      }
    }
    if (status === 'COMPLETED' || status === 'PACKED') {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.kitchenOrder.update({
      where: { id },
      data: updateData,
      include: { order: true, station: true },
    });

    // Log to MongoDB
    await KitchenEvent.create({
      orderId: updated.orderId,
      stationId: updated.stationId,
      eventType: `STATUS_CHANGED_${status}`,
      metadata: { previousStatus: kOrder.status },
    });

    // Broadcast to KDS via Socket.io
    try { getIO().to('staff_room').emit('kds_status_update', updated); } catch {}

    // Auto-assign delivery driver when packed
    if (status === 'PACKED') {
      try {
        await DeliveryService.assignOrder(updated.orderId);
      } catch (e: any) {
        // We log it but do not fail the kitchen update if no driver is available
        console.error('Failed to auto-assign delivery driver:', e.message);
      }
    }

    return updated;
  }

  /**
   * Assign order to station or chef, and update priority
   */
  public static async assignOrder(id: string, stationId?: string, assignedTo?: string, priority?: KitchenPriority) {
    const kOrder = await prisma.kitchenOrder.findUnique({ where: { id } });
    if (!kOrder) throw new AppError('Kitchen order not found', 404);

    const data: any = {};
    if (stationId) data.stationId = stationId;
    if (assignedTo) data.assignedTo = assignedTo;
    if (priority) data.priority = priority;

    const updated = await prisma.kitchenOrder.update({
      where: { id },
      data,
      include: { order: true, station: true, assignedUser: true },
    });

    // Log to MongoDB
    await KitchenEvent.create({
      orderId: updated.orderId,
      stationId: updated.stationId,
      eventType: `ORDER_ASSIGNED`,
      metadata: data,
    });

    // Broadcast
    try { getIO().to('staff_room').emit('kds_assignment_update', updated); } catch {}

    return updated;
  }

  /**
   * Get Kitchen Analytics from MongoDB & Prisma
   */
  public static async getAnalytics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalOrders = await prisma.kitchenOrder.count({
      where: { createdAt: { gte: today } },
    });

    const completedOrders = await prisma.kitchenOrder.count({
      where: { createdAt: { gte: today }, status: 'COMPLETED' },
    });

    // Aggregation pipeline from MongoDB could be used here. For simplicity, we return mock metrics or basic Prisma stats.
    const metrics = await KitchenMetric.find({ date: { $gte: today } });

    return {
      totalOrders,
      completedOrders,
      metrics,
    };
  }
}
