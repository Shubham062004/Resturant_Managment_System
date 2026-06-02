import { Router } from 'express';
import { authGuard, restrictTo } from '../../middleware/authGuard';
import { validate } from '../../middleware/validate';
import * as controller from './inventory.controller';
import * as validation from './inventory.validation';

const router = Router();

// Protect all inventory routes
router.use(authGuard);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN', 'HEAD_CHEF', 'KITCHEN_MANAGER'));

// Ingredients
router.route('/ingredients')
  .get(controller.getIngredients)
  .post(validate(validation.createIngredientSchema), controller.createIngredient);

router.route('/ingredients/:id')
  .patch(validate(validation.updateIngredientSchema), controller.updateIngredient);

// Suppliers
router.route('/suppliers')
  .get(controller.getSuppliers)
  .post(validate(validation.createSupplierSchema), controller.createSupplier);

router.route('/suppliers/:id')
  .patch(validate(validation.createSupplierSchema), controller.updateSupplier); // Using create schema for simplification of patch

// Purchase Orders
router.route('/purchase-orders')
  .get(controller.getPurchaseOrders)
  .post(validate(validation.createPurchaseOrderSchema), controller.createPurchaseOrder);

router.route('/purchase-orders/:id')
  .patch(validate(validation.updatePurchaseOrderStatusSchema), controller.updatePurchaseOrderStatus);

// Inventory
router.route('/')
  .get(controller.getInventory);

router.post('/adjust', validate(validation.adjustInventorySchema), controller.adjustInventory);
router.post('/transfers', validate(validation.inventoryTransferSchema), controller.transferInventory);
router.post('/waste', validate(validation.logWasteSchema), controller.logWaste);
router.get('/analytics', controller.getAnalytics);

export default router;
