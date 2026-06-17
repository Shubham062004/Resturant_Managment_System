import { Router } from 'express';

import { authGuard, restrictTo } from '../../middleware/authGuard';
import validate from '../../middleware/validate';

import { TableController } from './table.controller';
import { createTableSchema, updateTableSchema } from './table.validation';

const router = Router();

// Public QR Scan endpoint
router.get('/qr/:qrCode', TableController.getTableByQR);

router.use(authGuard);

router.post(
  '/',
  restrictTo('ADMIN', 'SUPER_ADMIN'),
  validate(createTableSchema),
  TableController.createTable
);
router.get(
  '/branch/:branchId',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'CASHIER', 'KITCHEN_MANAGER'),
  TableController.getBranchTables
);
router.patch(
  '/:id',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'CASHIER'),
  validate(updateTableSchema),
  TableController.updateTable
);

export default router;
