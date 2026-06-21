import {
  KitchenOrderStatus,
  KitchenPriority,
  OrderStatus,
} from '@prisma/client';

import { prisma } from '../../config/db';
import { getIO } from '../../config/socket';
import { KitchenEvent } from '../../database/mongo/KitchenEvent';
import { KitchenMetric } from '../../database/mongo/KitchenMetric';
import AppError from '../../utils/appError';
import { DeliveryService } from '../delivery/delivery.service';
import { InventoryService } from '../inventory/inventory.service';
import { OrdersService } from '../orders/orders.service';

export class KitchenService {
  /**
   * Get all active kitchen orders
   */
  public static async getActiveOrders(assignedCategory?: string) {
    const orders = await prisma.kitchenOrder.findMany({
      where: {
        status: {
          not: 'COMPLETED',
        },
        order: {
          status: {
            notIn: ['CANCELLED', 'REFUNDED'],
          },
        },
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
        station: true,
        assignedUser: true,
        tasks: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });

    if (assignedCategory) {
      return orders
        .map((ko) => {
          if (!ko.order) return null;
          const matchedItems = ko.order.items.filter((item: any) => {
            const catSlug = item.product.category.slug.toLowerCase();
            const catName = item.product.category.name.toLowerCase();
            const filterSlug = assignedCategory.toLowerCase();
            return (
              catSlug.includes(filterSlug) ||
              catName.includes(filterSlug) ||
              filterSlug.includes(catSlug)
            );
          });

          if (matchedItems.length === 0) return null;

          return {
            ...ko,
            order: {
              ...ko.order,
              items: matchedItems,
            },
          };
        })
        .filter((o): o is NonNullable<typeof o> => o !== null);
    }

    return orders;
  }

  /**
   * Get kitchen orders for a specific staff member
   */
  public static async getStaffOrders(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new AppError('User not found', 404);

    const assignedCategory = user.assignedCategory;

    // Fetch all active or completed today orders
    const orders = await prisma.kitchenOrder.findMany({
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
        station: true,
        assignedUser: true,
        tasks: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    if (assignedCategory) {
      return orders
        .map((ko) => {
          if (!ko.order) return null;
          const matchedItems = ko.order.items.filter((item) => {
            const catSlug = item.product.category.slug.toLowerCase();
            const catName = item.product.category.name.toLowerCase();
            const filterSlug = assignedCategory.toLowerCase();
            return (
              catSlug.includes(filterSlug) ||
              catName.includes(filterSlug) ||
              filterSlug.includes(catSlug)
            );
          });

          if (matchedItems.length === 0) return null;

          return {
            ...ko,
            order: {
              ...ko.order,
              items: matchedItems,
            },
          };
        })
        .filter((o): o is NonNullable<typeof o> => o !== null);
    }

    return orders;
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
  public static async updateOrderStatus(
    id: string,
    status: KitchenOrderStatus,
    changerId?: string
  ) {
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
    try {
      getIO().to('staff_room').emit('kds_status_update', updated);
    } catch {}

    // Sync status with parent Order
    try {
      let nextOrderStatus: OrderStatus | null = null;
      if (status === 'COOKING') {
        nextOrderStatus = OrderStatus.PREPARING;
      } else if (status === 'READY_FOR_PACKING') {
        nextOrderStatus = OrderStatus.PREPARING;
      } else if (status === 'PACKED') {
        nextOrderStatus = OrderStatus.READY;
      } else if (status === 'COMPLETED') {
        const parentOrder = await prisma.order.findUnique({
          where: { id: kOrder.orderId },
        });
        if (parentOrder) {
          if (parentOrder.orderType === 'DINE_IN') {
            nextOrderStatus = OrderStatus.DELIVERED;
          } else if (parentOrder.orderType === 'PICKUP') {
            nextOrderStatus = OrderStatus.READY_FOR_PICKUP;
          } else {
            nextOrderStatus = OrderStatus.READY;
          }
        }
      }

      if (nextOrderStatus) {
        await OrdersService.updateOrderStatus(
          kOrder.orderId,
          nextOrderStatus,
          changerId || kOrder.assignedTo || 'system'
        );
      }
    } catch (e: any) {
      console.error('Failed to sync parent order status:', e.message);
    }

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
  public static async assignOrder(
    id: string,
    stationId?: string,
    assignedTo?: string,
    priority?: KitchenPriority
  ) {
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
    try {
      getIO().to('staff_room').emit('kds_assignment_update', updated);
    } catch {}

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
