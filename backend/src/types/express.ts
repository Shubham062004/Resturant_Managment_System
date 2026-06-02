import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'CUSTOMER' | 'ADMIN' | 'KITCHEN_STAFF' | 'DELIVERY_PARTNER' | 'CASHIER' | 'SUPER_ADMIN';
  };
}
