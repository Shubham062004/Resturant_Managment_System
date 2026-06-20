import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';

export class CustomerController {
  public static async getBranches(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const branches = await CustomerService.getBranches();
      res.status(200).json({
        success: true,
        data: branches,
        message: 'Branches retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getBranchMenu(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { branchId } = req.query;
      if (!branchId || typeof branchId !== 'string') {
        res.status(400).json({
          success: false,
          message: 'branchId query parameter is required.',
        });
        return;
      }

      const result = await CustomerService.getBranchMenu(branchId);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Branch menu retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getBranchOffers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { branchId } = req.query;
      if (!branchId || typeof branchId !== 'string') {
        res.status(400).json({
          success: false,
          message: 'branchId query parameter is required.',
        });
        return;
      }

      const offers = await CustomerService.getBranchOffers(branchId);
      res.status(200).json({
        success: true,
        data: offers,
        message: 'Branch offers retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}
