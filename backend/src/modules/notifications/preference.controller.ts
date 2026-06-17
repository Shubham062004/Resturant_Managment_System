import { Response, NextFunction } from 'express';

import { prisma } from '../../config/db';
import { AuthRequest } from '../../types/express';

export class PreferenceController {
  public static async getPreferences(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      let prefs = await prisma.notificationPreference.findUnique({
        where: { userId: req.user!.id },
      });

      if (!prefs) {
        prefs = await prisma.notificationPreference.create({
          data: { userId: req.user!.id },
        });
      }

      res.status(200).json({ status: 'success', data: prefs });
    } catch (error) {
      next(error);
    }
  }

  public static async updatePreferences(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const prefs = await prisma.notificationPreference.upsert({
        where: { userId: req.user!.id },
        update: req.body,
        create: {
          userId: req.user!.id,
          ...req.body,
        },
      });
      res.status(200).json({ status: 'success', data: prefs });
    } catch (error) {
      next(error);
    }
  }
}
