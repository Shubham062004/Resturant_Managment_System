import { z } from 'zod';

export const createTableSchema = {
  body: z.object({
    branchId: z.string().uuid(),
    number: z.string(),
    capacity: z.number().int().positive(),
    x: z.number().default(0),
    y: z.number().default(0),
  }),
};

export const updateTableSchema = {
  body: z.object({
    number: z.string().optional(),
    capacity: z.number().int().positive().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    status: z.enum(['AVAILABLE', 'RESERVED', 'OCCUPIED', 'BILLING', 'CLEANING', 'OUT_OF_SERVICE']).optional(),
    active: z.boolean().optional(),
  }),
};
