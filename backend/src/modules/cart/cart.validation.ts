import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid({ message: 'Valid Product ID is required' }),
    variantId: z.string().uuid({ message: 'Valid Variant ID is required' }).optional(),
    quantity: z.number().int().min(1, { message: 'Quantity must be at least 1' }),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Valid Cart Item ID is required' }),
  }),
  body: z.object({
    quantity: z.number().int().min(1, { message: 'Quantity must be at least 1' }),
  }),
});

export const mergeCartSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        quantity: z.number().int().min(1),
      })
    ),
  }),
});
