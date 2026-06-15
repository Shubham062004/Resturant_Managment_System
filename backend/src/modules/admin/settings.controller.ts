import { Request, Response, NextFunction } from 'express';

import { AuditLog } from '../../database/mongo/AuditLog';
import { AuthRequest } from '../../types/express';

import { SettingsService } from './settings.service';

export class SettingsController {
  public static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.getSettings(req.params.branchId);
      res.status(200).json({ status: 'success', data: settings });
    } catch (error) {
      next(error);
    }
  }

  public static async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.updateSettings(req.params.branchId, req.body);

      // Audit log the change
      await AuditLog.create({
        actionType: 'UPDATE_SETTINGS',
        userId: req.user!.id,
        targetId: req.params.branchId,
        changes: req.body,
      });

      res.status(200).json({ status: 'success', data: settings });
    } catch (error) {
      next(error);
    }
  }
}
