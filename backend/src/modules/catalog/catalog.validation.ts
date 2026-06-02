import { z } from 'zod';

export const restaurantQuerySchema = z.object({
  search: z.string().optional(),
  rating: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 5)
    .optional(),
  veg: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  openNow: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  sortBy: z.enum(['popularity', 'rating', 'name']).default('popularity').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0)
    .default('1')
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0)
    .default('10')
    .optional(),
});

export const productQuerySchema = z.object({
  search: z.string().optional(),
  restaurantId: z.string().uuid('Invalid restaurant ID').optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  isVeg: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  minPrice: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0)
    .optional(),
  maxPrice: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0)
    .optional(),
  sortBy: z.enum(['price', 'rating', 'name']).default('name').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc').optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0)
    .default('1')
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0)
    .default('20')
    .optional(),
});

export const createReviewSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .min(3, 'Comment must be at least 3 characters long')
    .max(1000, 'Comment cannot exceed 1000 characters'),
});

export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .optional(),
  comment: z
    .string()
    .min(3, 'Comment must be at least 3 characters long')
    .max(1000, 'Comment cannot exceed 1000 characters')
    .optional(),
});

export const favoriteToggleSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
});

export const paginationQuerySchema = z.object({
  restaurantId: z.string().uuid('Invalid restaurant ID').optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0)
    .default('1')
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100)
    .default('20')
    .optional(),
});
