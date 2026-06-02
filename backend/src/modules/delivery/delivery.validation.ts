import { z } from 'zod';

export const locationUpdateSchema = z.object({
  body: z.object({
    orderId: z.string().uuid().optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    heading: z.number().min(0).max(360).optional(),
    speed: z.number().min(0).optional(),
  }),
});

export const deliveryProofSchema = z.object({
  body: z.object({
    imageUrl: z.string().url().optional(),
    signatureUrl: z.string().url().optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export const assignmentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    driverId: z.string().uuid(),
  }),
});
