import { Request, Response, NextFunction } from 'express';

import { AuthRequest } from '../../types/express';

import { WaitlistService } from './waitlist.service';

export class WaitlistController {
  public static async joinWaitlist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const entry = await WaitlistService.joinWaitlist(req.user!.id, req.body);
      res.status(201).json({ status: 'success', data: entry });
    } catch (error) {
      next(error);
    }
  }

  public static async getBranchWaitlist(req: Request, res: Response, next: NextFunction) {
    try {
      const waitlist = await WaitlistService.getBranchWaitlist(req.params.branchId);
      res.status(200).json({ status: 'success', data: waitlist });
    } catch (error) {
      next(error);
    }
  }

  public static async updateWaitlistStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await WaitlistService.updateWaitlistStatus(req.params.id, req.body.status);
      res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
      next(error);
    }
  }
}
