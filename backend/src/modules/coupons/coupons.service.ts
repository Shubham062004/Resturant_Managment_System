import { prisma } from '../../config/db';
import AppError from '../../utils/appError';

export class CouponService {
  /**
   * Validate a coupon code for an order — database only
   */
  public static async validateCoupon(
    code: string,
    userId: string | undefined,
    orderAmount: number
  ) {
    const uppercaseCode = code.toUpperCase();

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
        `Minimum order amount of ₹${coupon.minimumAmount} required`,
        400
      );
    }

    if (userId) {
      const usage = await prisma.couponUsage.findFirst({
        where: { couponId: coupon.id, userId },
      });

      if (usage) {
        throw new AppError('You have already used this coupon', 400);
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (orderAmount * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else if (coupon.discountType === 'FIXED_AMOUNT') {
      discountAmount = Number(coupon.discountValue);
    }

    return { coupon, discountAmount };
  }

  /**
   * Get all active coupons from database
   */
  public static async getActiveCoupons(branchId?: string) {
    const now = new Date();
    const where: Record<string, unknown> = {
      active: true,
      startDate: { lte: now },
      endDate: { gte: now },
    };

    if (branchId) {
      where.OR = [
        { offerType: 'GLOBAL' },
        { offerType: 'BRANCH', branchId },
        { offerType: 'SEASONAL', isSeasonal: true },
        { offerType: 'BIRTHDAY', isBirthday: true },
      ];
    }

    return prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
