import { Response, NextFunction } from 'express';

import { AuthRequest } from '../../types/express';

import { DeliveryService } from './delivery.service';

export const getAssignedOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const orders = await DeliveryService.getAssignedOrders(userId);
    res.status(200).json({ status: 'success', data: { orders } });
  } catch (err) {
    next(err);
  }
};

export const acceptOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const order = await DeliveryService.acceptOrder(userId, id);
    res.status(200).json({ status: 'success', data: { order } });
  } catch (err) {
    next(err);
  }
};

export const pickupOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const order = await DeliveryService.pickupOrder(userId, id);
    res.status(200).json({ status: 'success', data: { order } });
  } catch (err) {
    next(err);
  }
};

export const deliverOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const proof = req.body;
    const order = await DeliveryService.deliverOrder(userId, id, proof);
    res.status(200).json({ status: 'success', data: { order } });
  } catch (err) {
    next(err);
  }
};

export const updateLocation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const locationData = req.body;
    const location = await DeliveryService.updateLocation(userId, locationData);
    res.status(200).json({ status: 'success', data: { location } });
  } catch (err) {
    next(err);
  }
};

export const getEarnings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const earnings = await DeliveryService.getEarnings(userId);
    res.status(200).json({ status: 'success', data: earnings });
  } catch (err) {
    next(err);
  }
};
