import { prisma } from '../../config/db';
import AppError from '../../utils/appError';
import { RefundStatus } from '@prisma/client';

export class RefundsService {
  /**
   * Create a new refund (Mock for Stripe/Razorpay)
   */
  public static async processRefund(orderId: string, amount: number, reason?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { refunds: true },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const totalRefunded = order.refunds.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
    if (totalRefunded + amount > Number(order.totalAmount)) {
      throw new AppError('Refund amount exceeds order total', 400);
    }

    // In a real app, this would call Stripe/Razorpay API
    // const paymentIntent = await stripe.refunds.create({ charge: order.paymentId, amount });

    const refund = await prisma.refund.create({
      data: {
        orderId,
        paymentId: order.paymentId,
        amount,
        reason,
        status: RefundStatus.COMPLETED, // Automatically mark as completed for now
      },
    });

    return refund;
  }

  /**
   * Get single refund by ID
   */
  public static async getRefundById(refundId: string) {
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: { order: true },
    });

    if (!refund) {
      throw new AppError('Refund not found', 404);
    }

    return refund;
  }
}
