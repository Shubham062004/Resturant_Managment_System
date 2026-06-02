import { prisma } from '../../config/db';
import AppError from '../../utils/appError';

export class CouponService {
  /**
   * Validate a coupon code for an order
   */
  public static async validateCoupon(code: string, userId: string, orderAmount: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new AppError('Invalid coupon code', 400);
    }

    if (!coupon.active) {
      throw new AppError('This coupon is no longer active', 400);
    }

    const now = new Date();
    if (now < coupon.startDate) {
      throw new AppError('This coupon is not yet valid', 400);
    }
    if (now > coupon.endDate) {
      throw new AppError('This coupon has expired', 400);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('This coupon has reached its usage limit', 400);
    }

    if (orderAmount < Number(coupon.minimumAmount)) {
      throw new AppError(`Minimum order amount of ${coupon.minimumAmount} required`, 400);
    }

    // Check if user already used this coupon (optional rule: one use per user)
    const usage = await prisma.couponUsage.findFirst({
      where: { couponId: coupon.id, userId },
    });

    if (usage) {
      throw new AppError('You have already used this coupon', 400);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (orderAmount * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else if (coupon.discountType === 'FIXED_AMOUNT') {
      discountAmount = Number(coupon.discountValue);
    } else if (coupon.discountType === 'FREE_DELIVERY') {
      // Free delivery logic handled by pricing engine, but we validate it here
      discountAmount = 0; // Value is calculated at checkout based on delivery fee
    }

    return {
      coupon,
      discountAmount,
    };
  }

  /**
   * Get all active coupons (for listing on Offers page)
   */
  public static async getActiveCoupons() {
    const now = new Date();
    return prisma.coupon.findMany({
      where: {
        active: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
