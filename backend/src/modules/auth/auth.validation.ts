import { Role, OtpType } from '@prisma/client';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.nativeEnum(Role).default(Role.CUSTOMER),
});

export const loginSchema = z
  .object({
    email: z.string().email('Invalid email format').toLowerCase().optional(),
    phone: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required to login.',
    path: ['email'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
});

export const sendOtpSchema = z
  .object({
    email: z.string().email('Invalid email format').toLowerCase().optional(),
    phone: z.string().optional(),
    type: z.nativeEnum(OtpType),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required to generate OTP.',
    path: ['email'],
  });

export const verifyOtpSchema = z
  .object({
    email: z.string().email('Invalid email format').toLowerCase().optional(),
    phone: z.string().optional(),
    code: z.string().length(6, 'OTP code must be exactly 6 digits.'),
    type: z.nativeEnum(OtpType),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required to verify OTP.',
    path: ['email'],
  });

export const googleAuthSchema = z.object({
  token: z.string().min(1, 'Google ID token is required'),
});
