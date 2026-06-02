import { Request, Response } from 'express';
import { CouponService } from './coupons.service';

export const validateCoupon = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { code, orderAmount } = req.body;

  const result = await CouponService.validateCoupon(code, userId, orderAmount);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getActiveCoupons = async (req: Request, res: Response) => {
  const coupons = await CouponService.getActiveCoupons();

  res.status(200).json({
    success: true,
    data: coupons,
  });
};
