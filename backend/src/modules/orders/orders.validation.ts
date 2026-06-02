import { z } from 'zod';

export const createOrderSchema = {
  body: z.object({
    restaurantId: z.string().uuid().optional(),
    branchId: z.string().uuid().optional(),
    addressId: z.string().uuid().optional(),
    paymentId: z.string().uuid().optional(),
    orderType: z.enum(['DINE_IN', 'DELIVERY', 'PICKUP']).default('DELIVERY'),
    notes: z.string().optional(),
  }),
};

export const updateOrderStatusSchema = {
  params: z.object({
    id: z.string().uuid('Valid Order ID is required'),
  }),
  body: z.object({
    status: z.enum([
      'PLACED',
      'ACCEPTED',
      'PREPARING',
      'READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED',
    ]),
  }),
};
