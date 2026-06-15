import { Response, NextFunction } from 'express';

import { prisma } from '../config/db';
import { AuthRequest } from '../types/express';
import AppError from '../utils/appError';

export const tenantGuard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    // SUPER_ADMIN and PLATFORM_ADMIN can access all data, so no strict tenant filter.
    if (['SUPER_ADMIN', 'PLATFORM_ADMIN'].includes(req.user.role)) {
      req.tenantFilter = {}; // Empty filter means all access
      return next();
    }

    // Identify user from DB to get their organizationId if not in token
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { organizationId: true, franchiseId: true },
    });

    if (!user || !user.organizationId) {
      return next(new AppError('Forbidden. User does not belong to any Organization.', 403));
    }

    // Apply the tenant filter globally to this request
    // This allows controllers to do: await prisma.order.findMany({ where: { ...req.tenantFilter } })
    req.tenantFilter = { organizationId: user.organizationId };

    // If they are specifically a Franchise Owner, scope further

    if (user.franchiseId && req.user.role === 'FRANCHISE_OWNER') {
      req.tenantFilter = { ...req.tenantFilter, franchiseId: user.franchiseId };
    }

    next();
  } catch (error) {
    next(error);
  }
};
