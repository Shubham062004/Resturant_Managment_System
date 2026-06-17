import { Response, NextFunction } from 'express';

import { prisma } from '../../config/db';
import { AuthRequest } from '../../types/express';

import { NotificationService } from './notification.service';

export class NotificationController {
  public static async getNotifications(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user!.id, channel: 'IN_APP' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const unreadCount = await prisma.notification.count({
        where: {
          userId: req.user!.id,
          channel: 'IN_APP',
          status: { not: 'READ' },
        },
      });

      res
        .status(200)
        .json({ status: 'success', data: { notifications, unreadCount } });
    } catch (error) {
      next(error);
    }
  }

  public static async markAsRead(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      await prisma.notification.updateMany({
        where: { id, userId: req.user!.id },
        data: { status: 'READ' },
      });
      res.status(200).json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  }

  public static async sendTestNotification(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { title, message, channels } = req.body;
      const sentChannels = await NotificationService.send({
        userId: req.user!.id,
        type: 'TEST',
        title,
        message,
        channels: channels || ['IN_APP'],
      });
      res.status(200).json({ status: 'success', data: { sentChannels } });
    } catch (error) {
      next(error);
    }
  }
}
