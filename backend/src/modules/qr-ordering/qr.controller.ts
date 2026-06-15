import { Request, Response, NextFunction } from 'express';

import { QROrderingService } from './qr.service';

export class QROrderingController {
  public static async getMenuForTable(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await QROrderingService.getMenuForTable(req.params.qrCode);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  public static async placeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await QROrderingService.placeOrder(req.params.qrCode, req.body);
      res.status(201).json({ status: 'success', data: order });
    } catch (error) {
      next(error);
    }
  }
}
