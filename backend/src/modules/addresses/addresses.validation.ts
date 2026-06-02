import { z } from 'zod';

export const createAddressSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    addressLine1: z.string().min(1, 'Address line 1 is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().default('India'),
    postalCode: z.string().min(5, 'Valid postal code is required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    isDefault: z.boolean().default(false),
  }),
});

export const updateAddressSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid Address ID is required'),
  }),
  body: z.object({
    fullName: z.string().min(1).optional(),
    phone: z.string().min(10).optional(),
    addressLine1: z.string().min(1).optional(),
    addressLine2: z.string().optional(),
    city: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    country: z.string().optional(),
    postalCode: z.string().min(5).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    isDefault: z.boolean().optional(),
  }),
});
