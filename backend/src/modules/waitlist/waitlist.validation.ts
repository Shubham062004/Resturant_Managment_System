import { z } from 'zod';

export const joinWaitlistSchema = {
  body: z.object({
    branchId: z.string().uuid(),
    guestCount: z.number().int().positive(),
  }),
};

export const updateWaitlistStatusSchema = {
  body: z.object({
    status: z.enum(['WAITING', 'NOTIFIED', 'SEATED', 'CANCELLED', 'NO_SHOW']),
  }),
};
