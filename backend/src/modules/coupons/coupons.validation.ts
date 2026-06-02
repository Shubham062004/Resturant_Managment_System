import { z } from 'zod';

export const validateCouponSchema = {
  body: z.object({
    code: z.string().min(1, 'Coupon code is required'),
    orderAmount: z.number().min(0, 'Order amount must be at least 0'),
  }),
};
