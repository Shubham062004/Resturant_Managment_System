import { Request, Response, NextFunction } from 'express';

import { AuthRequest } from '../../types/express';

import { KitchenService } from './kitchen.service';

export const getActiveOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignedCategory = req.user?.assignedCategory;
    const orders = await KitchenService.getActiveOrders(assignedCategory);
    res.status(200).json({
      status: 'success',
      data: { orders },
    });
  } catch (err) {
    next(err);
  }
};

export const getStations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stations = await KitchenService.getStations();
    res.status(200).json({
      status: 'success',
      data: { stations },
    });
  } catch (err) {
    next(err);
  }
};

export const createStation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const station = await KitchenService.createStation(name, description);
    res.status(201).json({
      status: 'success',
      data: { station },
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await KitchenService.updateOrderStatus(id, status);
    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};

export const assignOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { stationId, assignedTo, priority } = req.body;
    const order = await KitchenService.assignOrder(id, stationId, assignedTo, priority);
    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const analytics = await KitchenService.getAnalytics();
    res.status(200).json({
      status: 'success',
      data: { analytics },
    });
  } catch (err) {
    next(err);
  }
};

export const getStaffOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const orders = await KitchenService.getStaffOrders(id);
    res.status(200).json({
      status: 'success',
      data: { orders },
    });
  } catch (err) {
    next(err);
  }
};
