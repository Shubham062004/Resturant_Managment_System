import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';
import { CartService } from '../cart/cart.service';
import { CouponService } from '../coupons/coupons.service';

export class CustomerController {
  public static async getBranches(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const branches = await CustomerService.getBranches();
      res.status(200).json({
        success: true,
        data: branches,
        message: 'Branches retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getBranchMenu(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { branchId } = req.query;
      if (!branchId || typeof branchId !== 'string') {
        res.status(400).json({
          success: false,
          message: 'branchId query parameter is required.',
        });
        return;
      }

      const result = await CustomerService.getBranchMenu(branchId);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Branch menu retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getBranchOffers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { branchId } = req.query;
      if (!branchId || typeof branchId !== 'string') {
        res.status(400).json({
          success: false,
          message: 'branchId query parameter is required.',
        });
        return;
      }

      const offers = await CustomerService.getBranchOffers(branchId);
      res.status(200).json({
        success: true,
        data: offers,
        message: 'Branch offers retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async mergeCart(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { guestItems, couponCode } = req.body;

      let updatedCart = null;
      if (guestItems && Array.isArray(guestItems) && guestItems.length > 0) {
        const itemsToMerge = guestItems.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: item.quantity,
        }));
        updatedCart = await CartService.mergeCart(userId, itemsToMerge);
      } else {
        updatedCart = await CartService.getCart(userId);
      }

      const subtotal = updatedCart.items.reduce((sum: number, item: any) => {
        return sum + Number(item.price) * item.quantity;
      }, 0);

      let discountAmount = 0;
      let coupon = null;
      let couponError = null;

      if (couponCode) {
        try {
          const validationResult = await CouponService.validateCoupon(
            couponCode,
            userId,
            subtotal
          );
          coupon = validationResult.coupon;
          discountAmount = validationResult.discountAmount;
        } catch (err: any) {
          couponError = err.message || 'Coupon validation failed';
        }
      }

      const deliveryFee = subtotal === 0 ? 0 : (subtotal >= 200 ? 0 : 20);
      const taxableAmount = Math.max(0, subtotal - discountAmount);
      const gst = taxableAmount * 0.05;
      const grandTotal = taxableAmount + deliveryFee + gst;

      const responseData = {
        ...updatedCart,
        coupon,
        discountAmount,
        couponError,
        totals: {
          subtotal,
          discount: discountAmount,
          deliveryFee,
          gst,
          grandTotal,
        },
      };

      res.status(200).json({
        success: true,
        data: responseData,
        message: 'Cart merged successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}
