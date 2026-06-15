import { Router } from 'express';
import {
  getActiveOrders,
  getStations,
  createStation,
  updateOrderStatus,
  assignOrder,
  getAnalytics,
  getStaffOrders,
} from './kitchen.controller';
import { validate } from '../../middleware/validate';
import { authGuard, restrictTo } from '../../middleware/authGuard';
import {
  createStationSchema,
  updateOrderStatusSchema,
  assignOrderSchema,
} from './kitchen.validation';

const router = Router();

// All kitchen routes are protected
router.use(authGuard);
router.use(
  restrictTo(
    'KITCHEN_STAFF',
    'HEAD_CHEF',
    'ADMIN',
    'SUPER_ADMIN',
    'ORGANIZATION_OWNER',
    'BRANCH_MANAGER',
  ),
);

router.route('/orders').get(getActiveOrders);

router.route('/orders/:id/status').patch(validate(updateOrderStatusSchema), updateOrderStatus);

router.route('/orders/:id/assign').patch(validate(assignOrderSchema), assignOrder);

router.route('/staff/:id/orders').get(getStaffOrders);

router
  .route('/stations')
  .get(getStations)
  .post(
    restrictTo('HEAD_CHEF', 'ADMIN', 'SUPER_ADMIN'),
    validate(createStationSchema),
    createStation,
  );

router
  .route('/analytics')
  .get(restrictTo('HEAD_CHEF', 'ADMIN', 'SUPER_ADMIN', 'ORGANIZATION_OWNER'), getAnalytics);

export default router;
