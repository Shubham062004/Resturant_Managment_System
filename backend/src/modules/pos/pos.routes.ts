import { Router } from 'express';
import { POSController } from './pos.controller';
import { authGuard, restrictTo } from '../../middleware/authGuard';
import validate from '../../middleware/validate';
import {
  createTerminalSchema,
  startShiftSchema,
  endShiftSchema,
  createPOSOrderSchema,
  processPaymentSchema,
} from './pos.validation';

const router = Router();

router.use(authGuard);

// Terminal Management
router.post(
  '/terminals',
  restrictTo('ADMIN', 'SUPER_ADMIN'),
  validate(createTerminalSchema),
  POSController.createTerminal,
);
router.get(
  '/terminals/:branchId',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'CASHIER'),
  POSController.getTerminals,
);

// Shift Management
router.post(
  '/shifts/start',
  restrictTo('CASHIER', 'ADMIN'),
  validate(startShiftSchema),
  POSController.startShift,
);
router.post(
  '/shifts/end/:drawerId',
  restrictTo('CASHIER', 'ADMIN'),
  validate(endShiftSchema),
  POSController.endShift,
);

// Order Management
router.post(
  '/orders',
  restrictTo('CASHIER', 'ADMIN'),
  validate(createPOSOrderSchema),
  POSController.createPOSOrder,
);
router.get('/orders/:id', restrictTo('CASHIER', 'ADMIN'), POSController.getPOSOrder);

// Payment & Receipt
router.post(
  '/payments',
  restrictTo('CASHIER', 'ADMIN'),
  validate(processPaymentSchema),
  POSController.processPayment,
);
router.get('/receipts/:posOrderId', restrictTo('CASHIER', 'ADMIN'), POSController.getReceipt);

// Analytics
router.get(
  '/analytics/today/:branchId',
  restrictTo('ADMIN', 'SUPER_ADMIN'),
  POSController.getTodayAnalytics,
);

export default router;
