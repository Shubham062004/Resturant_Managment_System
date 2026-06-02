import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/express';
import { prisma } from '../../config/db';
import AppError from '../../utils/appError';

export class UsersController {
  /**
   * Update authenticated user profile details & profile image
   */
  public static async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AppError('Authentication credentials are missing.', 401));
      }

      const { firstName, lastName, phone } = req.body;
      let avatarUrl: string | undefined;

      // Handle avatar file upload URL mapping
      if (req.file) {
        avatarUrl = `/uploads/avatars/${req.file.filename}`;
      }

      // Verify phone uniqueness if being updated
      if (phone) {
        const existingPhoneUser = await prisma.user.findFirst({
          where: {
            phone,
            id: { not: req.user.id },
          },
        });
        if (existingPhoneUser) {
          return next(new AppError('This phone number is already registered to another account.', 409));
        }
      }

      // Update in PostgreSQL database
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(avatarUrl ? { avatar: avatarUrl } : {}),
        },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          isActive: true,
        },
      });

      res.status(200).json({
        success: true,
        data: { user: updatedUser },
        message: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}
