import { Router } from 'express';

import { authGuard, restrictTo } from '../../middleware/authGuard';
import { tenantGuard } from '../../middleware/tenant';

import { FranchiseController } from './franchise.controller';
import { OrganizationController } from './organization.controller';
import { SuperAdminController } from './superadmin.controller';

const router = Router();

// Protect routes
router.use(authGuard);

// Global Super Admin Endpoints (Unscoped, restricted to SUPER_ADMIN/PLATFORM_ADMIN)
router.get('/dashboard', restrictTo('SUPER_ADMIN'), SuperAdminController.getGlobalDashboard);
router.get('/health', restrictTo('SUPER_ADMIN'), SuperAdminController.getPlatformHealth);

router.get('/organizations', restrictTo('SUPER_ADMIN'), OrganizationController.getOrganizations);
router.post('/organizations', restrictTo('SUPER_ADMIN'), OrganizationController.createOrganization);
router.patch(
  '/organizations/:id',
  restrictTo('SUPER_ADMIN'),
  OrganizationController.updateOrganization,
);

// Scoped Endpoints (Requires tenantGuard to scope to Organization/Franchise)
router.use(tenantGuard);

router.get(
  '/franchises',
  restrictTo('SUPER_ADMIN', 'ORGANIZATION_OWNER'),
  FranchiseController.getFranchises,
);
router.post(
  '/franchises',
  restrictTo('SUPER_ADMIN', 'ORGANIZATION_OWNER'),
  FranchiseController.createFranchise,
);

export default router;
