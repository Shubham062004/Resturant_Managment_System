import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { authGuard, restrictTo } from '../../middleware/authGuard';
import { validate } from '../../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from './orders.validation';

const router = Router();

// Customer Routes
router.use(authGuard);

router.post('/', validate(createOrderSchema), OrdersController.createOrder);
router.get('/', OrdersController.getMyOrders);
router.get('/:id', OrdersController.getOrderById);
router.post('/:id/cancel', OrdersController.cancelOrder);

// Admin / Staff Routes
router.patch(
  '/:id/status',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'KITCHEN_STAFF', 'DELIVERY_PARTNER'),
  validate(updateOrderStatusSchema),
  OrdersController.updateOrderStatus
);

export default router;
