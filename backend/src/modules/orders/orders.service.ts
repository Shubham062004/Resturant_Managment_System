import { prisma } from '../../config/db';
import AppError from '../../utils/appError';
import { getIO } from '../../config/socket';
import { OrderStatus, OrderType } from '@prisma/client';
import logger from '../../utils/logger';

export class OrdersService {
  /**
   * Convert cart to an Order
   */
  public static async createOrderFromCart(
    userId: string,
    data: {
      restaurantId?: string;
      branchId?: string;
      addressId?: string;
      paymentId?: string;
      orderType?: OrderType;
      notes?: string;
    },
  ) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty. Cannot place an order.', 400);
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum: number, item: any) => sum + Number(item.price) * item.quantity,
      0,
    );
    const tax = subtotal * 0.05; // Fixed 5% tax for simplicity
    const deliveryFee = data.orderType === 'DELIVERY' ? 5.0 : 0.0;
    const discount = 0.0; // Extend to support coupons later
    const totalAmount = subtotal + tax + deliveryFee - discount;

    const order = await prisma.order.create({
      data: {
        userId,
        restaurantId: data.restaurantId,
        branchId: data.branchId,
        addressId: data.addressId,
        paymentId: data.paymentId,
        orderType: data.orderType || 'DELIVERY',
        notes: data.notes,
        subtotal,
        tax,
        deliveryFee,
        discount,
        totalAmount,
        status: OrderStatus.PLACED,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        statusHistory: {
          create: {
            newStatus: OrderStatus.PLACED,
            changedBy: userId,
          },
        },
        kitchenOrder: {
          create: {
            priority: 'MEDIUM',
            status: 'QUEUED',
            tasks: {
              create: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            },
          },
        },
      },
      include: { items: true, kitchenOrder: { include: { tasks: true } } },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Emit Socket.io event to restaurant staff
    try {
      getIO().to('staff_room').emit('new_order', order);
      getIO().to('staff_room').emit('kds_new_order', order.kitchenOrder);
    } catch (e) {
      logger.error(e, 'Socket error emitting new_order');
    }

    return order;
  }

  /**
   * Get all orders for the user
   */
  public static async getMyOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        restaurant: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single order by ID
   */
  public static async getOrderById(orderId: string, userId: string, role: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        statusHistory: { orderBy: { timestamp: 'desc' } },
        restaurant: true,
        address: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (role === 'CUSTOMER' && order.userId !== userId) {
      throw new AppError('Unauthorized access to order', 403);
    }

    return order;
  }

  /**
   * Update order status (Admin/Staff)
   */
  public static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    changerId: string,
  ) {
    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) throw new AppError('Order not found', 404);

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        statusHistory: {
          create: {
            oldStatus: existing.status,
            newStatus: newStatus,
            changedBy: changerId,
          },
        },
      },
      include: { items: true },
    });

    // Emit socket event to customer tracking room
    try {
      getIO().to(`order_${orderId}`).emit('order_status_update', updated);
    } catch (e) {
      logger.error(e, 'Socket error emitting order_status_update');
    }

    return updated;
  }

  /**
   * Cancel Order
   */
  public static async cancelOrder(orderId: string, userId: string, role: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404);

    if (role === 'CUSTOMER' && order.userId !== userId) {
      throw new AppError('Unauthorized access to order', 403);
    }

    if (role === 'CUSTOMER') {
      if (order.status !== 'PLACED') {
        throw new AppError('Order cannot be cancelled at this stage by customer.', 400);
      }
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        statusHistory: {
          create: {
            oldStatus: order.status,
            newStatus: OrderStatus.CANCELLED,
            changedBy: userId,
          },
        },
      },
    });

    try {
      getIO().to(`order_${orderId}`).emit('order_status_update', updated);
      getIO().to('staff_room').emit('order_cancelled', updated);
    } catch (e) {
      logger.error(e, 'Socket error emitting order_cancelled');
    }

    return updated;
  }
}
