import { PaymentStatus } from '@prisma/client';

import { prisma } from '../../config/db';
import { getIO } from '../../config/socket';
import { DeliveryEvent } from '../../database/mongo/DeliveryEvent';
import { DriverLocation } from '../../database/mongo/DriverLocation';
import AppError from '../../utils/appError';
import { OrdersService } from '../orders/orders.service';

export class DeliveryService {
  static async assignOrder(orderId: string, driverId?: string) {
    let assignedDriverId = driverId;

    if (!assignedDriverId) {
      // Auto-assign: Find an active driver with least active assignments (Mock nearest driver logic)
      const availableDrivers = await prisma.deliveryPartner.findMany({
        where: { activeStatus: true },
        include: {
          assignments: {
            where: { status: { notIn: ['DELIVERED', 'FAILED'] } },
          },
        },
      });

      if (availableDrivers.length === 0)
        throw new AppError('No drivers available for auto-assignment', 404);

      // Simple heuristic: pick driver with fewest active assignments
      availableDrivers.sort(
        (a: any, b: any) => a.assignments.length - b.assignments.length
      );
      assignedDriverId = availableDrivers[0].id;
    }

    const assignment = await prisma.deliveryAssignment.create({
      data: {
        orderId,
        driverId: assignedDriverId,
        status: 'ASSIGNED',
      },
    });

    await DeliveryEvent.create({
      orderId,
      driverId: assignedDriverId,
      eventType: 'ASSIGNED',
    });

    // Notify the assigned driver
    const io = getIO();
    const driver = await prisma.deliveryPartner.findUnique({
      where: { id: assignedDriverId },
    });
    if (driver) {
      io.to(`driver_${driver.userId}`).emit('new_assignment', assignment);
    }
    io.to('staff_room').emit('delivery_update', assignment);

    return assignment;
  }

  static async getAssignedOrders(driverUserId: string) {
    const driver = await prisma.deliveryPartner.findUnique({
      where: { userId: driverUserId },
    });
    if (!driver) throw new AppError('Delivery Partner profile not found', 404);

    return prisma.deliveryAssignment.findMany({
      where: { driverId: driver.id },
      include: {
        order: {
          include: {
            address: true,
            restaurant: true,
            items: { include: { product: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async acceptOrder(driverUserId: string, orderId: string) {
    const driver = await prisma.deliveryPartner.findUnique({
      where: { userId: driverUserId },
    });
    if (!driver) throw new AppError('Delivery Partner not found', 404);

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { orderId },
    });

    if (!assignment) throw new AppError('Assignment not found', 404);
    if (assignment.driverId !== driver.id)
      throw new AppError('Unauthorized', 403);
    if (assignment.status !== 'ASSIGNED')
      throw new AppError('Order already accepted or processed', 400);

    const updated = await prisma.deliveryAssignment.update({
      where: { id: assignment.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    await DeliveryEvent.create({
      orderId,
      driverId: driver.id,
      eventType: 'ACCEPTED',
    });

    const io = getIO();
    io.to(`order_${orderId}`).emit('driver_accepted', updated);
    io.to('staff_room').emit('delivery_update', updated);

    return updated;
  }

  static async pickupOrder(driverUserId: string, orderId: string) {
    const driver = await prisma.deliveryPartner.findUnique({
      where: { userId: driverUserId },
    });
    if (!driver) throw new AppError('Delivery Partner not found', 404);

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { orderId },
    });
    if (!assignment || assignment.driverId !== driver.id)
      throw new AppError('Unauthorized', 403);

    const updated = await prisma.deliveryAssignment.update({
      where: { id: assignment.id },
      data: {
        status: 'PICKED_UP',
        pickedUpAt: new Date(),
      },
    });

    // Update main order status via OrdersService
    await OrdersService.updateOrderStatus(
      orderId,
      'OUT_FOR_DELIVERY',
      driver.userId
    );

    await DeliveryEvent.create({
      orderId,
      driverId: driver.id,
      eventType: 'PICKED_UP',
    });

    const io = getIO();
    io.to(`order_${orderId}`).emit('order_picked_up', updated);
    io.to('staff_room').emit('delivery_update', updated);

    return updated;
  }

  static async deliverOrder(driverUserId: string, orderId: string, proof: any) {
    const driver = await prisma.deliveryPartner.findUnique({
      where: { userId: driverUserId },
    });
    if (!driver) throw new AppError('Delivery Partner not found', 404);

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { orderId },
      include: { order: true },
    });
    if (!assignment || assignment.driverId !== driver.id)
      throw new AppError('Unauthorized', 403);

    const updated = await prisma.deliveryAssignment.update({
      where: { id: assignment.id },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
        proof: {
          create: {
            imageUrl: proof.imageUrl,
            signatureUrl: proof.signatureUrl,
            notes: proof.notes,
          },
        },
      },
    });

    // Update main order status via OrdersService
    await OrdersService.updateOrderStatus(orderId, 'DELIVERED', driver.userId);

    // If COD, update payment status to PAID
    if (assignment.order.paymentId) {
      await prisma.payment.updateMany({
        where: { id: assignment.order.paymentId, provider: 'COD' },
        data: { status: PaymentStatus.PAID },
      });
    }

    // Calculate Earnings (Flat 5 + 5% of order subtotal)
    const orderValue = Number(assignment.order.subtotal);
    const earningsAmount = 5.0 + orderValue * 0.05;

    await prisma.driverEarnings.create({
      data: {
        driverId: driver.id,
        orderId,
        earnings: earningsAmount,
      },
    });

    await DeliveryEvent.create({
      orderId,
      driverId: driver.id,
      eventType: 'DELIVERED',
      metadata: proof,
    });

    const io = getIO();
    io.to(`order_${orderId}`).emit('order_delivered', updated);
    io.to('staff_room').emit('delivery_update', updated);

    return updated;
  }

  static async updateLocation(driverUserId: string, locationData: any) {
    const driver = await prisma.deliveryPartner.findUnique({
      where: { userId: driverUserId },
    });
    if (!driver) throw new AppError('Delivery Partner not found', 404);

    const loc = await DriverLocation.create({
      driverId: driver.id,
      ...locationData,
    });

    const io = getIO();
    if (locationData.orderId) {
      io.to(`order_${locationData.orderId}`).emit(
        'driver_location_update',
        loc
      );
    }
    return loc;
  }

  static async getEarnings(driverUserId: string) {
    const driver = await prisma.deliveryPartner.findUnique({
      where: { userId: driverUserId },
    });
    if (!driver) throw new AppError('Delivery Partner not found', 404);

    const earnings = await prisma.driverEarnings.findMany({
      where: { driverId: driver.id },
      orderBy: { createdAt: 'desc' },
      include: { order: true },
    });

    const totalEarnings = earnings.reduce(
      (sum: number, e: any) => sum + Number(e.earnings) + Number(e.bonus || 0),
      0
    );

    return { totalEarnings, history: earnings };
  }
}
