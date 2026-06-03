import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import AppError from '../../utils/appError';

export class StaffController {
  public static async getAllStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await prisma.user.findMany({
        where: {
          role: { not: 'CUSTOMER' },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
        },
      });
      res.status(200).json({ status: 'success', data: staff });
    } catch (error) {
      next(error);
    }
  }

  public static async createStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, firstName, lastName, role, password: _password } = req.body;

      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) throw new AppError('User already exists', 400);

      // In real scenario we would hash password here, simulating creation.
      const staff = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          role,
          passwordHash: 'dummy-hashed-password',
          isEmailVerified: true,
        },
      });

      res.status(201).json({ status: 'success', data: staff });
    } catch (error) {
      next(error);
    }
  }

  public static async updateStaffRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      const staff = await prisma.user.update({
        where: { id: req.params.id },
        data: { role },
        select: { id: true, firstName: true, role: true },
      });
      res.status(200).json({ status: 'success', data: staff });
    } catch (error) {
      next(error);
    }
  }
}
