import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'CUSTOMER' | 'ADMIN' | 'KITCHEN_STAFF' | 'HEAD_CHEF' | 'KITCHEN_MANAGER' | 'DELIVERY_PARTNER' | 'CASHIER' | 'SUPER_ADMIN';
  };
}
