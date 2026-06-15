import { Request, Response, NextFunction } from 'express';

import { AuthRequest } from '../../types/express';

import { InventoryService } from './inventory.service';

// INGREDIENTS
export const getIngredients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ingredients = await InventoryService.getIngredients();
    res.status(200).json({ status: 'success', data: ingredients });
  } catch (err) {
    next(err);
  }
};

export const createIngredient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ingredient = await InventoryService.createIngredient(req.body);
    res.status(201).json({ status: 'success', data: ingredient });
  } catch (err) {
    next(err);
  }
};

export const updateIngredient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ingredient = await InventoryService.updateIngredient(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: ingredient });
  } catch (err) {
    next(err);
  }
};

export const deleteIngredient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await InventoryService.deleteIngredient(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

// SUPPLIERS
export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suppliers = await InventoryService.getSuppliers();
    res.status(200).json({ status: 'success', data: suppliers });
  } catch (err) {
    next(err);
  }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supplier = await InventoryService.createSupplier(req.body);
    res.status(201).json({ status: 'success', data: supplier });
  } catch (err) {
    next(err);
  }
};

export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supplier = await InventoryService.updateSupplier(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: supplier });
  } catch (err) {
    next(err);
  }
};

// PURCHASE ORDERS
export const getPurchaseOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pos = await InventoryService.getPurchaseOrders();
    res.status(200).json({ status: 'success', data: pos });
  } catch (err) {
    next(err);
  }
};

export const createPurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const po = await InventoryService.createPurchaseOrder(req.body);
    res.status(201).json({ status: 'success', data: po });
  } catch (err) {
    next(err);
  }
};

export const updatePurchaseOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const po = await InventoryService.updatePurchaseOrderStatus(
      req.params.id,
      req.body.status,
      userId,
    );
    res.status(200).json({ status: 'success', data: po });
  } catch (err) {
    next(err);
  }
};

// INVENTORY
export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branchId = req.query.branchId as string;
    const inventory = await InventoryService.getInventory(branchId);
    res.status(200).json({ status: 'success', data: inventory });
  } catch (err) {
    next(err);
  }
};

export const adjustInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ingredientId, branchId, quantity, reason, referenceId } = req.body;
    const result = await InventoryService.adjustInventory({
      ingredientId,
      branchId,
      quantity,
      reason,
      referenceId,
      type: 'ADJUSTMENT',
    });
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

// TRANSFERS
export const transferInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transfer = await InventoryService.transferInventory(req.body);
    res.status(200).json({ status: 'success', data: transfer });
  } catch (err) {
    next(err);
  }
};

// WASTE
export const logWaste = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const result = await InventoryService.logWaste({ ...req.body, userId });
    res.status(201).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

// ANALYTICS
export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await InventoryService.getAnalytics();
    res.status(200).json({ status: 'success', data: metrics });
  } catch (err) {
    next(err);
  }
};

// INVENTORY REQUESTS
export const getInventoryRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branchId = req.query.branchId as string;
    const status = req.query.status as string;
    const requests = await InventoryService.getInventoryRequests(branchId, status);
    res.status(200).json({ status: 'success', data: requests });
  } catch (err) {
    next(err);
  }
};

export const createInventoryRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requestedById = req.user!.id;
    const request = await InventoryService.createInventoryRequest({
      ...req.body,
      requestedById,
    });
    res.status(201).json({ status: 'success', data: request });
  } catch (err) {
    next(err);
  }
};

export const approveInventoryRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await InventoryService.approveInventoryRequest(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: request });
  } catch (err) {
    next(err);
  }
};

export const updateInventoryRequestStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status } = req.body;
    const request = await InventoryService.updateInventoryRequestStatus(req.params.id, status);
    res.status(200).json({ status: 'success', data: request });
  } catch (err) {
    next(err);
  }
};
