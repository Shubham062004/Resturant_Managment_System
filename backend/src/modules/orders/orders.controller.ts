import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/express';
import { OrdersService } from './orders.service';

export class OrdersController {
  public static async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrdersService.createOrderFromCart(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        data: { order },
        message: 'Order placed successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orders = await OrdersService.getMyOrders(req.user!.id);
      res.status(200).json({
        success: true,
        data: { orders },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrdersService.getOrderById(
        req.params.id,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json({
        success: true,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrdersService.updateOrderStatus(
        req.params.id,
        req.body.status,
        req.user!.id
      );
      res.status(200).json({
        success: true,
        data: { order },
        message: 'Order status updated successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrdersService.cancelOrder(
        req.params.id,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json({
        success: true,
        data: { order },
        message: 'Order cancelled successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}
