import { z } from 'zod';

export const createStationSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
  }),
};

export const updateOrderStatusSchema = {
  body: z.object({
    status: z.enum([
      'QUEUED',
      'COOKING',
      'READY_FOR_PACKING',
      'PACKED',
      'COMPLETED',
    ]),
  }),
};

export const assignOrderSchema = {
  body: z.object({
    stationId: z.string().uuid().optional(),
    assignedTo: z.string().uuid().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  }),
};
