import { Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { AuthRequest } from '../../types/express';

export class FranchiseController {
  public static async getFranchises(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const franchises = await prisma.franchise.findMany({
        where: req.tenantFilter,
        include: {
          organization: true,
          _count: {
            select: { branches: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({ status: 'success', data: franchises });
    } catch (error) {
      next(error);
    }
  }

  public static async createFranchise(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { ownerName, organizationId } = req.body;
      const franchise = await prisma.franchise.create({
        data: { ownerName, organizationId },
      });
      res.status(201).json({ status: 'success', data: franchise });
    } catch (error) {
      next(error);
    }
  }
}
