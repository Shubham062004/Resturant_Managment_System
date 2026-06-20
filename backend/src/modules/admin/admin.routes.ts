import { Router } from 'express';

import { authGuard, restrictTo } from '../../middleware/authGuard';

import { AdminController } from './admin.controller';
import { AnalyticsController } from './analytics.controller';
import { CustomersController } from './customers.controller';
import { ReportsController } from './reports.controller';
import { SettingsController } from './settings.controller';
import { StaffController } from './staff.controller';

const router = Router();

// Protect all admin routes
router.use(authGuard);
router.use(
  restrictTo(
    'ADMIN',
    'SUPER_ADMIN',
    'BRANCH_MANAGER',
    'OPERATIONS_MANAGER',
    'FINANCE_MANAGER',
    'ORGANIZATION_OWNER',
    'FRANCHISE_OWNER'
  )
);

// Dashboard Overview
router.get('/dashboard', AdminController.getDashboardOverview);

// Branch management
router.get('/branches', AdminController.getBranches);
router.post(
  '/branches',
  restrictTo('SUPER_ADMIN', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'),
  AdminController.createBranch
);
router.patch(
  '/branches/:id',
  restrictTo('SUPER_ADMIN', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'),
  AdminController.updateBranch
);
router.delete(
  '/branches/:id',
  restrictTo('SUPER_ADMIN', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'),
  AdminController.deleteBranch
);

// Product management
router.get('/products', AdminController.getProducts);
router.post(
  '/products',
  restrictTo('SUPER_ADMIN', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'),
  AdminController.createProduct
);
router.patch(
  '/products/:id',
  restrictTo('SUPER_ADMIN', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'),
  AdminController.updateProduct
);
router.delete(
  '/products/:id',
  restrictTo('SUPER_ADMIN', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'),
  AdminController.deleteProduct
);

// Audit Logs
router.get(
  '/audit-logs',
  restrictTo('SUPER_ADMIN', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'),
  AdminController.getAuditLogs
);

// Orders list for admin dashboard
router.get('/orders', AdminController.getOrders);

// Settings
router.get('/settings/:branchId', SettingsController.getSettings);
router.patch(
  '/settings/:branchId',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'),
  SettingsController.updateSettings
);

// Analytics
router.get('/analytics/owner-dashboard', AnalyticsController.getOwnerDashboard);
router.get(
  '/analytics/manager-dashboard',
  AnalyticsController.getManagerDashboard
);
router.get('/analytics/executive', AnalyticsController.getExecutiveSummary);
router.get('/analytics/sales-trends', AnalyticsController.getSalesTrends);
router.get('/analytics/customer', AnalyticsController.getCustomerAnalytics);
router.get('/analytics/product', AnalyticsController.getProductAnalytics);
router.get('/analytics/delivery', AnalyticsController.getDeliveryAnalytics);
router.get(
  '/analytics/dashboard-trends',
  AnalyticsController.getDashboardTrends
);
router.get(
  '/analytics/dashboard-alerts',
  AnalyticsController.getDashboardAlerts
);
router.get(
  '/analytics/popular-products',
  AnalyticsController.getProductAnalytics
); // alias

// Reports
router.get('/reports/daily', ReportsController.getDailyReport);

// Staff
router.get(
  '/staff',
  restrictTo(
    'ADMIN',
    'SUPER_ADMIN',
    'BRANCH_MANAGER',
    'ORGANIZATION_OWNER',
    'FRANCHISE_OWNER'
  ),
  StaffController.getAllStaff
);
router.post(
  '/staff',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'),
  StaffController.createStaff
);
router.patch(
  '/staff/bulk-update',
  restrictTo(
    'ADMIN',
    'SUPER_ADMIN',
    'BRANCH_MANAGER',
    'ORGANIZATION_OWNER',
    'FRANCHISE_OWNER'
  ),
  StaffController.bulkUpdateStaff
);
router.patch(
  '/staff/:id',
  restrictTo(
    'ADMIN',
    'SUPER_ADMIN',
    'BRANCH_MANAGER',
    'ORGANIZATION_OWNER',
    'FRANCHISE_OWNER'
  ),
  StaffController.updateStaffProfile
);
router.patch(
  '/staff/:id/role',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'),
  StaffController.updateStaffRole
);

// Customers
router.get(
  '/customers',
  restrictTo(
    'ADMIN',
    'SUPER_ADMIN',
    'BRANCH_MANAGER',
    'ORGANIZATION_OWNER',
    'FRANCHISE_OWNER'
  ),
  CustomersController.getAllCustomers
);
router.get(
  '/customers/:id',
  restrictTo(
    'ADMIN',
    'SUPER_ADMIN',
    'BRANCH_MANAGER',
    'ORGANIZATION_OWNER',
    'FRANCHISE_OWNER'
  ),
  CustomersController.getCustomerDetails
);

export default router;
