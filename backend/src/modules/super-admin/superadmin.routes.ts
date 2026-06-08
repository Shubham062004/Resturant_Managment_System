import { Router } from 'express';
import { OrganizationController } from './organization.controller';
import { FranchiseController } from './franchise.controller';
import { SuperAdminController } from './superadmin.controller';
import { authGuard, restrictTo } from '../../middleware/authGuard';
import { tenantGuard } from '../../middleware/tenant';

const router = Router();

// Protect routes
router.use(authGuard);

// Global Super Admin Endpoints (Unscoped, restricted to SUPER_ADMIN/ORGANIZATION_OWNER)
router.get(
  '/dashboard',
  restrictTo('SUPER_ADMIN', 'ORGANIZATION_OWNER'),
  SuperAdminController.getGlobalDashboard,
);
router.get(
  '/health',
  restrictTo('SUPER_ADMIN', 'ORGANIZATION_OWNER'),
  SuperAdminController.getPlatformHealth,
);

router.get(
  '/organizations',
  restrictTo('SUPER_ADMIN', 'ORGANIZATION_OWNER'),
  OrganizationController.getOrganizations,
);
router.post(
  '/organizations',
  restrictTo('SUPER_ADMIN', 'ORGANIZATION_OWNER'),
  OrganizationController.createOrganization,
);
router.patch(
  '/organizations/:id',
  restrictTo('SUPER_ADMIN', 'ORGANIZATION_OWNER'),
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
