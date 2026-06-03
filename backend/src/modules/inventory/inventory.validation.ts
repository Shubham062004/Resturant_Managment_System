import { z } from 'zod';

export const createIngredientSchema = {
  body: z.object({
    name: z.string().min(2),
    sku: z.string().min(2),
    category: z.string().min(2),
    unit: z.string(),
    minimumStock: z.number().min(0),
    reorderPoint: z.number().min(0),
  }),
};

export const updateIngredientSchema = {
  body: z.object({
    name: z.string().optional(),
    category: z.string().optional(),
    unit: z.string().optional(),
    minimumStock: z.number().min(0).optional(),
    reorderPoint: z.number().min(0).optional(),
    active: z.boolean().optional(),
  }),
};

export const adjustInventorySchema = {
  body: z.object({
    ingredientId: z.string().uuid(),
    branchId: z.string().uuid(),
    quantity: z.number(), // can be positive or negative
    reason: z.string().min(3),
    referenceId: z.string().optional(),
  }),
};

export const createSupplierSchema = {
  body: z.object({
    name: z.string().min(2),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
  }),
};

export const createPurchaseOrderSchema = {
  body: z.object({
    supplierId: z.string().uuid(),
    branchId: z.string().uuid(),
    items: z
      .array(
        z.object({
          ingredientId: z.string().uuid(),
          quantity: z.number().positive(),
          costPrice: z.number().positive(),
        }),
      )
      .min(1),
  }),
};

export const updatePurchaseOrderStatusSchema = {
  body: z.object({
    status: z.enum(['SENT', 'APPROVED', 'RECEIVED', 'CANCELLED']),
  }),
};

export const logWasteSchema = {
  body: z.object({
    ingredientId: z.string().uuid(),
    branchId: z.string().uuid(),
    quantity: z.number().positive(),
    reason: z.string().min(3),
  }),
};

export const inventoryTransferSchema = {
  body: z.object({
    sourceBranchId: z.string().uuid(),
    destinationBranchId: z.string().uuid(),
    ingredientId: z.string().uuid(),
    quantity: z.number().positive(),
    notes: z.string().optional(),
  }),
};
