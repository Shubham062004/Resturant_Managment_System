import { Router } from 'express';

import { authGuard, restrictTo } from '../../middleware/authGuard';
import validate from '../../middleware/validate';

import { ReservationController } from './reservation.controller';
import {
  createReservationSchema,
  updateReservationStatusSchema,
} from './reservation.validation';

const router = Router();

router.use(authGuard);

// Customer facing routes
router.post(
  '/',
  validate(createReservationSchema),
  ReservationController.createReservation
);
router.get('/my', ReservationController.getCustomerReservations);

// Staff facing routes
router.get(
  '/branch',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'CASHIER'),
  ReservationController.getBranchReservations
);
router.patch(
  '/:id',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'CASHIER'),
  validate(updateReservationStatusSchema),
  ReservationController.updateReservationStatus
);

export default router;
