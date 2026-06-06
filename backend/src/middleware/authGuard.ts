import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import AppError from '../utils/appError';
import { AuthRequest } from '../types/express';
import { extractAccessToken } from '../utils/extractAccessToken';

import { Role } from '@prisma/client';

export interface DecodedToken {
  id: string;
  email: string;
  role: Role;
  assignedCategory?: string;
  iat: number;
  exp: number;
}

export const authGuard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractAccessToken(req);

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
      assignedCategory: decoded.assignedCategory,
    };

    next();
  } catch {
    return next(
      new AppError('Authentication failed. Access token signature is expired or compromised.', 401),
    );
  }
};

// Authorization Hook: Role-Based Access Controls
export const restrictTo = (...roles: Array<Role>) => {
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
