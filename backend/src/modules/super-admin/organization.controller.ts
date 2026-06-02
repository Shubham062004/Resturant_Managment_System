import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';

export class OrganizationController {
  public static async getOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const organizations = await prisma.organization.findMany({
        include: {
          _count: {
            select: { branches: true, users: true, franchises: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json({ status: 'success', data: organizations });
    } catch (error) {
      next(error);
    }
  }

  public static async createOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug } = req.body;
      const org = await prisma.organization.create({
        data: { name, slug }
      });
      res.status(201).json({ status: 'success', data: org });
    } catch (error) {
      next(error);
    }
  }

  public static async updateOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await prisma.organization.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.status(200).json({ status: 'success', data: org });
    } catch (error) {
      next(error);
    }
  }
}
