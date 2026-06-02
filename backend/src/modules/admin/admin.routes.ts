import { Router } from 'express';
import { AdminController } from './admin.controller';
import { SettingsController } from './settings.controller';
import { AnalyticsController } from './analytics.controller';
import { ReportsController } from './reports.controller';
import { StaffController } from './staff.controller';
import { CustomersController } from './customers.controller';
import { authGuard, restrictTo } from '../../middleware/authGuard';

const router = Router();

// Protect all admin routes
router.use(authGuard);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'OPERATIONS_MANAGER', 'FINANCE_MANAGER'));

// Dashboard Overview
router.get('/dashboard', AdminController.getDashboardOverview);

// Settings
router.get('/settings/:branchId', SettingsController.getSettings);
router.patch('/settings/:branchId', restrictTo('ADMIN', 'SUPER_ADMIN'), SettingsController.updateSettings);

// Analytics
router.get('/analytics/sales-trends', AnalyticsController.getSalesTrends);
router.get('/analytics/popular-products', AnalyticsController.getPopularProducts);

// Reports
router.get('/reports/daily', ReportsController.getDailyReport);

// Staff
router.get('/staff', restrictTo('ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER'), StaffController.getAllStaff);
router.post('/staff', restrictTo('ADMIN', 'SUPER_ADMIN'), StaffController.createStaff);
router.patch('/staff/:id/role', restrictTo('ADMIN', 'SUPER_ADMIN'), StaffController.updateStaffRole);

// Customers
router.get('/customers', restrictTo('ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER'), CustomersController.getAllCustomers);
router.get('/customers/:id', restrictTo('ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER'), CustomersController.getCustomerDetails);

export default router;
