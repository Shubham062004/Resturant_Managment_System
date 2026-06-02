import { z } from 'zod';

export const createRefundSchema = {
  body: z.object({
    orderId: z.string().uuid('Valid Order ID is required'),
    amount: z.number().min(1, 'Refund amount must be greater than 0'),
    reason: z.string().optional(),
  }),
};
