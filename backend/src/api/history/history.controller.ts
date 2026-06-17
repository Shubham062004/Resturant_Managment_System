import { Request, Response } from 'express';

import { historyService } from './history.service';

export class HistoryController {
  async getOrders(req: Request, res: Response) {
    try {
      const result = await historyService.getOrders(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getStaff(req: Request, res: Response) {
    try {
      const result = await historyService.getStaff(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getInventory(req: Request, res: Response) {
    try {
      const result = await historyService.getInventory(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getIngredients(req: Request, res: Response) {
    try {
      const result = await historyService.getIngredients(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getSuppliers(req: Request, res: Response) {
    try {
      const result = await historyService.getSuppliers(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getBranches(req: Request, res: Response) {
    try {
      const result = await historyService.getBranches(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCustomers(req: Request, res: Response) {
    try {
      const result = await historyService.getCustomers(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getFinance(req: Request, res: Response) {
    try {
      const result = await historyService.getFinance(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAttendance(req: Request, res: Response) {
    try {
      const result = await historyService.getAttendance(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getSalary(req: Request, res: Response) {
    try {
      const result = await historyService.getSalary(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAudit(req: Request, res: Response) {
    try {
      const result = await historyService.getAudit(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const historyController = new HistoryController();
