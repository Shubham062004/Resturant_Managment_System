import { prisma } from '../../config/db';
import AppError from '../../utils/appError';

export class CouponService {
  /**
   * Validate a coupon code for an order
   */
  public static async validateCoupon(
    code: string,
    userId: string,
    orderAmount: number
  ) {
    const uppercaseCode = code.toUpperCase();
    const hardcodedCoupons: Record<
      string,
      { discountValue: number; minimumAmount: number; description: string }
    > = {
      WELCOME50: {
        discountValue: 50,
        minimumAmount: 499,
        description: 'Get ₹50 off on orders of ₹499 or more',
      },
      SAVE100: {
        discountValue: 100,
        minimumAmount: 999,
        description: 'Get ₹100 off on orders of ₹999 or more',
      },
      PARTY200: {
        discountValue: 200,
        minimumAmount: 1499,
        description: 'Get ₹200 off on orders of ₹1499 or more',
      },
      SUPER300: {
        discountValue: 300,
        minimumAmount: 1999,
        description: 'Get ₹300 off on orders of ₹1999 or more',
      },
      MEGA500: {
        discountValue: 500,
        minimumAmount: 2999,
        description: 'Get ₹500 off on orders of ₹2999 or more',
      },
    };

    if (hardcodedCoupons[uppercaseCode]) {
      const match = hardcodedCoupons[uppercaseCode];
      if (orderAmount < match.minimumAmount) {
        throw new AppError(
          `Minimum order amount of ₹${match.minimumAmount} required`,
          400
        );
      }
      return {
        coupon: {
          id: `hardcoded-${uppercaseCode}`,
          code: uppercaseCode,
          discountType: 'FIXED_AMOUNT' as const,
          discountValue: match.discountValue.toString(),
          minimumAmount: match.minimumAmount.toString(),
          description: match.description,
          active: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          usedCount: 0,
        },
        discountAmount: match.discountValue,
      };
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: uppercaseCode },
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
      throw new AppError(
        `Minimum order amount of ${coupon.minimumAmount} required`,
        400
      );
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
