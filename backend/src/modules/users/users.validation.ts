import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name must contain at least 1 character').max(50).optional(),
  lastName: z.string().min(1, 'Last name must contain at least 1 character').max(50).optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .nullable(),
});
