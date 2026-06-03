import { z } from 'zod';

export const createTerminalSchema = {
  body: z.object({
    branchId: z.string().uuid(),
    terminalName: z.string().min(2),
  }),
};

export const startShiftSchema = {
  body: z.object({
    terminalId: z.string().uuid(),
    openingAmount: z.number().min(0),
  }),
};

export const endShiftSchema = {
  body: z.object({
    closingAmount: z.number().min(0),
    notes: z.string().optional(),
  }),
};

export const createPOSOrderSchema = {
  body: z.object({
    terminalId: z.string().uuid(),
    orderType: z.enum(['DINE_IN', 'TAKEAWAY', 'WALK_IN']),
    tableId: z.string().uuid().optional(),
    customerDetails: z
      .object({
        name: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          variantId: z.string().uuid().optional(),
          quantity: z.number().int().positive(),
          notes: z.string().optional(),
        }),
      )
      .min(1),
    discount: z.number().min(0).optional(),
  }),
};

export const processPaymentSchema = {
  body: z.object({
    posOrderId: z.string().uuid(),
    payments: z
      .array(
        z.object({
          method: z.enum(['CASH', 'UPI', 'CARD', 'WALLET', 'SPLIT']),
          amount: z.number().positive(),
          transactionReference: z.string().optional(),
        }),
      )
      .min(1),
  }),
};
