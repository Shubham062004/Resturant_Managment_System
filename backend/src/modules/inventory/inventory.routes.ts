import { Router } from 'express';
import { authGuard, restrictTo } from '../../middleware/authGuard';
import { validate } from '../../middleware/validate';
import * as controller from './inventory.controller';
import * as validation from './inventory.validation';

const router = Router();

// Protect all inventory routes
router.use(authGuard);

// ----------------------------------------------------
// INVENTORY REQUESTS (BRANCH REPLENISHMENT)
// ----------------------------------------------------
router
  .route('/requests')
  .get(
    restrictTo('ORGANIZATION_OWNER', 'BRANCH_MANAGER', 'INVENTORY_MANAGER', 'SUPER_ADMIN', 'ADMIN'),
    controller.getInventoryRequests
  )
  .post(
    restrictTo('BRANCH_MANAGER', 'SUPER_ADMIN', 'ADMIN'),
    validate(validation.createInventoryRequestSchema),
    controller.createInventoryRequest
  );

router
  .route('/requests/:id/approve')
  .patch(
    restrictTo('ORGANIZATION_OWNER', 'SUPER_ADMIN', 'ADMIN'),
    validate(validation.approveInventoryRequestSchema),
    controller.approveInventoryRequest
  );

router
  .route('/requests/:id/dispatch')
  .patch(
    restrictTo('INVENTORY_MANAGER', 'SUPER_ADMIN', 'ADMIN'),
    validate(validation.updateInventoryRequestStatusSchema),
    controller.updateInventoryRequestStatus
  );

router
  .route('/requests/:id/deliver')
  .patch(
    restrictTo('BRANCH_MANAGER', 'SUPER_ADMIN', 'ADMIN'),
    validate(validation.updateInventoryRequestStatusSchema),
    controller.updateInventoryRequestStatus
  );

// ----------------------------------------------------
// INGREDIENTS
// ----------------------------------------------------
router
  .route('/ingredients')
  .get(
    restrictTo('ADMIN', 'SUPER_ADMIN', 'HEAD_CHEF', 'KITCHEN_MANAGER', 'ORGANIZATION_OWNER', 'INVENTORY_MANAGER'),
    controller.getIngredients
  )
  .post(
    restrictTo('ADMIN', 'SUPER_ADMIN', 'INVENTORY_MANAGER'),
    validate(validation.createIngredientSchema),
    controller.createIngredient
  );

router
  .route('/ingredients/:id')
  .patch(
    restrictTo('ADMIN', 'SUPER_ADMIN', 'INVENTORY_MANAGER'),
    validate(validation.updateIngredientSchema),
    controller.updateIngredient
  );

// ----------------------------------------------------
// SUPPLIERS
// ----------------------------------------------------
router
  .route('/suppliers')
  .get(
    restrictTo('ADMIN', 'SUPER_ADMIN', 'ORGANIZATION_OWNER', 'INVENTORY_MANAGER'),
    controller.getSuppliers
  )
  .post(
    restrictTo('ADMIN', 'SUPER_ADMIN', 'INVENTORY_MANAGER'),
    validate(validation.createSupplierSchema),
    controller.createSupplier
  );

router
  .route('/suppliers/:id')
  .patch(
    restrictTo('ADMIN', 'SUPER_ADMIN', 'INVENTORY_MANAGER'),
    validate(validation.updateSupplierSchema),
    controller.updateSupplier
  );

// ----------------------------------------------------
// PURCHASE ORDERS
// ----------------------------------------------------
router
  .route('/purchase-orders')
  .get(
    restrictTo('ADMIN', 'SUPER_ADMIN', 'ORGANIZATION_OWNER', 'INVENTORY_MANAGER'),
    controller.getPurchaseOrders
  )
  .post(
    restrictTo('ADMIN', 'SUPER_ADMIN', 'INVENTORY_MANAGER'),
    validate(validation.createPurchaseOrderSchema),
    controller.createPurchaseOrder
  );

router
  .route('/purchase-orders/:id')
  .patch(
    restrictTo('ADMIN', 'SUPER_ADMIN', 'INVENTORY_MANAGER'),
    validate(validation.updatePurchaseOrderStatusSchema),
    controller.updatePurchaseOrderStatus
  );

// ----------------------------------------------------
// INVENTORY STOCK ADJUSTMENTS
// ----------------------------------------------------
router.route('/').get(
  restrictTo('ADMIN', 'SUPER_ADMIN', 'ORGANIZATION_OWNER', 'BRANCH_MANAGER', 'INVENTORY_MANAGER', 'HEAD_CHEF', 'KITCHEN_MANAGER'),
  controller.getInventory
);

router.post(
  '/adjust',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'INVENTORY_MANAGER'),
  validate(validation.adjustInventorySchema),
  controller.adjustInventory
);

router.post(
  '/transfers',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'INVENTORY_MANAGER'),
  validate(validation.inventoryTransferSchema),
  controller.transferInventory
);

router.post(
  '/waste',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'HEAD_CHEF', 'KITCHEN_MANAGER'),
  validate(validation.logWasteSchema),
  controller.logWaste
);

router.get(
  '/analytics',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'ORGANIZATION_OWNER', 'INVENTORY_MANAGER'),
  controller.getAnalytics
);

export default router;
