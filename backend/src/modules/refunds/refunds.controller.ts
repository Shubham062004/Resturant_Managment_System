import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/express';
import { RefundsService } from './refunds.service';

export class RefundsController {
  public static async processRefund(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId, amount, reason } = req.body;
      const refund = await RefundsService.processRefund(orderId, amount, reason);
      
      res.status(201).json({
        success: true,
        data: { refund },
        message: 'Refund processed successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getRefundById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const refund = await RefundsService.getRefundById(req.params.id);
      res.status(200).json({
        success: true,
        data: { refund },
      });
    } catch (error) {
      next(error);
    }
  }
}
