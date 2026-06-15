import { Request, Response, NextFunction } from 'express';

import { TableService } from './table.service';

export class TableController {
  public static async createTable(req: Request, res: Response, next: NextFunction) {
    try {
      const table = await TableService.createTable(req.body);
      res.status(201).json({ status: 'success', data: table });
    } catch (error) {
      next(error);
    }
  }

  public static async getBranchTables(req: Request, res: Response, next: NextFunction) {
    try {
      const tables = await TableService.getBranchTables(req.params.branchId);
      res.status(200).json({ status: 'success', data: tables });
    } catch (error) {
      next(error);
    }
  }

  public static async updateTable(req: Request, res: Response, next: NextFunction) {
    try {
      const table = await TableService.updateTable(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: table });
    } catch (error) {
      next(error);
    }
  }

  public static async getTableByQR(req: Request, res: Response, next: NextFunction) {
    try {
      const table = await TableService.getTableByQR(req.params.qrCode);
      res.status(200).json({ status: 'success', data: table });
    } catch (error) {
      next(error);
    }
  }
}
