import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import AppError from '../utils/appError';
import { AuthRequest } from '../types/express';

export interface DecodedToken {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'KITCHEN_STAFF' | 'DELIVERY_PARTNER' | 'CASHIER' | 'SUPER_ADMIN';
  iat: number;
  exp: number;
}

export const authGuard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Extract Bearer Token from Request header
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication failed. Access token is missing or invalid.', 401));
    }

    // 2. Decode and Validate token signatures
    const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;

    // 3. Attach session credentials to request context
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch {
    return next(
      new AppError('Authentication failed. Access token signature is expired or compromised.', 401),
    );
  }
};

// Authorization Hook: Role-Based Access Controls
export const restrictTo = (...roles: Array<'CUSTOMER' | 'ADMIN' | 'KITCHEN_STAFF' | 'DELIVERY_PARTNER' | 'CASHIER' | 'SUPER_ADMIN'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Forbidden. You do not possess the required privilege level for this operation.',
          403,
        ),
      );
    }
    next();
  };
};
