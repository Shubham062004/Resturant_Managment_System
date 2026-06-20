import { Role } from '@prisma/client';
import { Router } from 'express';

import { authGuard, restrictTo } from '../../middleware/authGuard';

import { historyController } from './history.controller';

const router = Router();

// Apply authentication and authorization for History Module
// All endpoints below require Admin or Super Admin access
router.use(authGuard);
router.use(
  restrictTo(
    Role.ADMIN,
    Role.SUPER_ADMIN,
    Role.ORGANIZATION_OWNER,
    Role.FRANCHISE_OWNER
  )
);

// Register 11 endpoints
router.get('/orders', historyController.getOrders);
router.get('/staff', historyController.getStaff);
router.get('/inventory', historyController.getInventory);
router.get('/ingredients', historyController.getIngredients);
router.get('/suppliers', historyController.getSuppliers);
router.get('/branches', historyController.getBranches);
router.get('/customers', historyController.getCustomers);
router.get('/finance', historyController.getFinance);
router.get('/attendance', historyController.getAttendance);
router.get('/salary', historyController.getSalary);
router.get('/audit', historyController.getAudit);
router.get('/system-logs', historyController.getSystemLogs);

export default router;
