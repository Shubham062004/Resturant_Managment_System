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
          salary: true,
          attendanceCount: true,
          performanceScore: true,
          assignedCategory: true,
          organizationId: true,
          franchiseId: true,
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

  public static async updateStaffProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        salary,
        attendanceCount,
        performanceScore,
        assignedCategory,
        role,
        organizationId,
        franchiseId,
        isActive,
      } = req.body;

      const updateData: any = {};
      if (salary !== undefined) updateData.salary = salary;
      if (attendanceCount !== undefined) updateData.attendanceCount = parseInt(attendanceCount);
      if (performanceScore !== undefined)
        updateData.performanceScore = parseFloat(performanceScore);
      if (assignedCategory !== undefined) updateData.assignedCategory = assignedCategory;
      if (role !== undefined) updateData.role = role;
      if (organizationId !== undefined) updateData.organizationId = organizationId;
      if (franchiseId !== undefined) updateData.franchiseId = franchiseId;
      if (isActive !== undefined) updateData.isActive = isActive;

      const staff = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          salary: true,
          attendanceCount: true,
          performanceScore: true,
          assignedCategory: true,
          organizationId: true,
          franchiseId: true,
        },
      });

      res.status(200).json({ status: 'success', data: staff });
    } catch (error) {
      next(error);
    }
  }

  public static async bulkUpdateStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids, role, organizationId, franchiseId, isActive } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError('Staff IDs must be provided in an array', 400);
      }

      const updateData: any = {};
      if (role !== undefined) updateData.role = role;
      if (organizationId !== undefined) updateData.organizationId = organizationId;
      if (franchiseId !== undefined) updateData.franchiseId = franchiseId;
      if (isActive !== undefined) updateData.isActive = isActive;

      await prisma.user.updateMany({
        where: { id: { in: ids } },
        data: updateData,
      });

      res
        .status(200)
        .json({ status: 'success', message: `Successfully updated ${ids.length} staff members` });
    } catch (error) {
      next(error);
    }
  }
}
