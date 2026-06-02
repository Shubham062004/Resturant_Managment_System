import { Request, Response, NextFunction } from 'express';
import { POSService } from './pos.service';
import { POSActivityLog } from '../../database/mongo/POSActivityLog';

export class POSController {
  public static async createTerminal(req: Request, res: Response, next: NextFunction) {
    try {
      const terminal = await POSService.createTerminal(req.body);
      res.status(201).json({ status: 'success', data: terminal });
    } catch (error) {
      next(error);
    }
  }

  public static async getTerminals(req: Request, res: Response, next: NextFunction) {
    try {
      const terminals = await POSService.getTerminals(req.params.branchId);
      res.status(200).json({ status: 'success', data: terminals });
    } catch (error) {
      next(error);
    }
  }

  public static async startShift(req: Request, res: Response, next: NextFunction) {
    try {
      const drawer = await POSService.startShift((req as any).user!.id, req.body.terminalId, req.body.openingAmount);
      
      await POSActivityLog.create({ terminalId: req.body.terminalId, cashierId: (req as any).user!.id, action: 'SHIFT_START', details: { openingAmount: req.body.openingAmount } });
      
      res.status(201).json({ status: 'success', data: drawer });
    } catch (error) {
      next(error);
    }
  }

  public static async endShift(req: Request, res: Response, next: NextFunction) {
    try {
      const drawer = await POSService.endShift(req.params.drawerId, req.body.closingAmount, req.body.notes);
      
      await POSActivityLog.create({ terminalId: drawer.terminalId, cashierId: (req as any).user!.id, action: 'SHIFT_END', details: { closingAmount: req.body.closingAmount, expected: drawer.currentBalance } });

      res.status(200).json({ status: 'success', data: drawer });
    } catch (error) {
      next(error);
    }
  }

  public static async createPOSOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const posOrder = await POSService.createPOSOrder((req as any).user!.id, req.body);
      
      await POSActivityLog.create({ terminalId: req.body.terminalId, cashierId: (req as any).user!.id, action: 'CREATE_ORDER', details: { posOrderId: posOrder.id } });

      res.status(201).json({ status: 'success', data: posOrder });
    } catch (error) {
      next(error);
    }
  }

  public static async getPOSOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const posOrder = await POSService.getPOSOrder(req.params.id);
      res.status(200).json({ status: 'success', data: posOrder });
    } catch (error) {
      next(error);
    }
  }

  public static async processPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await POSService.processPayment((req as any).user!.id, req.body.posOrderId, req.body.payments);
      
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  public static async getReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const receipt = await POSService.getReceipt(req.params.posOrderId);
      res.status(200).json({ status: 'success', data: receipt });
    } catch (error) {
      next(error);
    }
  }

  public static async getTodayAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await POSService.getTodayAnalytics(req.params.branchId);
      res.status(200).json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  }
}
