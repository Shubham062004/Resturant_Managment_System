import { Request, Response, NextFunction } from 'express';

import { AuthRequest } from '../../types/express';

import { ReservationService } from './reservation.service';

export class ReservationController {
  public static async createReservation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reservation = await ReservationService.createReservation(req.user!.id, req.body);
      res.status(201).json({ status: 'success', data: reservation });
    } catch (error) {
      next(error);
    }
  }

  public static async getCustomerReservations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reservations = await ReservationService.getCustomerReservations(req.user!.id);
      res.status(200).json({ status: 'success', data: reservations });
    } catch (error) {
      next(error);
    }
  }

  public static async getBranchReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const { branchId, date } = req.query;
      const reservations = await ReservationService.getBranchReservations(
        branchId as string,
        date as string | undefined,
      );
      res.status(200).json({ status: 'success', data: reservations });
    } catch (error) {
      next(error);
    }
  }

  public static async updateReservationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await ReservationService.updateReservationStatus(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
      next(error);
    }
  }
}
