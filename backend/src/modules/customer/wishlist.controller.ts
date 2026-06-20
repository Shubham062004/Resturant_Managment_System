import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/express';
import { WishlistService } from './wishlist.service';

export class WishlistController {
  public static async getWishlist(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await WishlistService.getWishlist(req.user!.id, req.query);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Wishlist retrieved successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  public static async addToWishlist(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { menuItemId } = req.params;
      const { branchId } = req.body;

      if (!branchId) {
        res.status(400).json({
          success: false,
          message: 'branchId is required in request body.'
        });
        return;
      }

      const result = await WishlistService.addToWishlist(req.user!.id, menuItemId, branchId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async removeFromWishlist(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { menuItemId } = req.params;
      const result = await WishlistService.removeFromWishlist(req.user!.id, menuItemId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async clearWishlist(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await WishlistService.clearWishlist(req.user!.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async moveToCart(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { branchId } = req.body;
      if (!branchId) {
        res.status(400).json({
          success: false,
          message: 'branchId is required in request body.'
        });
        return;
      }

      const result = await WishlistService.moveToCart(req.user!.id, branchId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async addAllToCart(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { branchId } = req.body;
      if (!branchId) {
        res.status(400).json({
          success: false,
          message: 'branchId is required in request body.'
        });
        return;
      }

      const result = await WishlistService.addAllToCart(req.user!.id, branchId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async getWishlistSummary(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await WishlistService.getWishlistSummary(req.user!.id);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Wishlist summary metrics retrieved successfully.'
      });
    } catch (error) {
      next(error);
    }
  }
}
