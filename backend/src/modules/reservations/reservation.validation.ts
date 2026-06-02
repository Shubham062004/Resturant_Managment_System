import { z } from 'zod';

export const createReservationSchema = {
  body: z.object({
    branchId: z.string().uuid(),
    tableId: z.string().uuid().optional(),
    reservationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    reservationTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm'),
    guestCount: z.number().int().positive(),
    specialRequest: z.string().optional(),
  }),
};

export const updateReservationStatusSchema = {
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
    tableId: z.string().uuid().optional(),
  }),
};
