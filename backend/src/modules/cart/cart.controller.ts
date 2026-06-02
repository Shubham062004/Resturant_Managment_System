import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import { CartService } from './cart.service';

export const getCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const cart = await CartService.getCart(userId);

  res.status(200).json({
    success: true,
    data: cart,
  });
};

export const addItem = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const cart = await CartService.addItem(userId, req.body);

  res.status(200).json({
    success: true,
    data: cart,
  });
};

export const updateItemQuantity = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const itemId = req.params.id;
  const { quantity } = req.body;

  const cart = await CartService.updateItemQuantity(userId, itemId, quantity);

  res.status(200).json({
    success: true,
    data: cart,
  });
};

export const removeItem = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const itemId = req.params.id;

  const cart = await CartService.removeItem(userId, itemId);

  res.status(200).json({
    success: true,
    data: cart,
  });
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const cart = await CartService.clearCart(userId);

  res.status(200).json({
    success: true,
    data: cart,
  });
};

export const mergeCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { items } = req.body;

  const cart = await CartService.mergeCart(userId, items);

  res.status(200).json({
    success: true,
    data: cart,
  });
};
