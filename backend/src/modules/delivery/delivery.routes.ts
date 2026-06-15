import { Router } from 'express';

import { authGuard, restrictTo } from '../../middleware/authGuard';
import { validate } from '../../middleware/validate';

import * as controller from './delivery.controller';
import * as validation from './delivery.validation';

const router = Router();

// All routes require authentication and DELIVERY_PARTNER role
router.use(authGuard);
router.use(restrictTo('DELIVERY_PARTNER', 'DELIVERY_MANAGER', 'ADMIN', 'SUPER_ADMIN'));

router.get('/orders', controller.getAssignedOrders);
router.patch('/orders/:id/accept', controller.acceptOrder);
router.patch('/orders/:id/pickup', controller.pickupOrder);
router.patch(
  '/orders/:id/deliver',
  validate(validation.deliveryProofSchema),
  controller.deliverOrder,
);

router.post('/location', validate(validation.locationUpdateSchema), controller.updateLocation);

router.get('/earnings', controller.getEarnings);

export default router;
