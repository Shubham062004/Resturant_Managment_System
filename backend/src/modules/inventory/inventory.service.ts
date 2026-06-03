import { prisma } from '../../config/db';
import { InventoryEvent } from '../../database/mongo/InventoryEvent';
import { ConsumptionLog } from '../../database/mongo/ConsumptionLog';
import AppError from '../../utils/appError';
import { getIO } from '../../config/socket';

export class InventoryService {
  // ---------------------------------------------------------------------------
  // INGREDIENTS
  // ---------------------------------------------------------------------------
  static async getIngredients() {
    return prisma.ingredient.findMany({
      include: { inventory: true },
    });
  }

  static async createIngredient(data: any) {
    const existing = await prisma.ingredient.findUnique({ where: { sku: data.sku } });
    if (existing) throw new AppError('Ingredient with this SKU already exists', 400);
    return prisma.ingredient.create({ data });
  }

  static async updateIngredient(id: string, data: any) {
    return prisma.ingredient.update({ where: { id }, data });
  }

  // ---------------------------------------------------------------------------
  // SUPPLIERS
  // ---------------------------------------------------------------------------
  static async getSuppliers() {
    return prisma.supplier.findMany();
  }

  static async createSupplier(data: any) {
    return prisma.supplier.create({ data });
  }

  static async updateSupplier(id: string, data: any) {
    return prisma.supplier.update({ where: { id }, data });
  }

  // ---------------------------------------------------------------------------
  // PURCHASE ORDERS
  // ---------------------------------------------------------------------------
  static async getPurchaseOrders() {
    return prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: { include: { ingredient: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createPurchaseOrder(data: { supplierId: string; branchId: string; items: any[] }) {
    // Calculate total
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);

    const po = await prisma.purchaseOrder.create({
      data: {
        supplierId: data.supplierId,
        branchId: data.branchId,
        totalAmount,
        status: 'DRAFT',
        items: {
          create: data.items.map((item) => ({
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            costPrice: item.costPrice,
          })),
        },
      },
      include: { items: true },
    });
    return po;
  }

  static async updatePurchaseOrderStatus(id: string, status: any, _userId: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!po) throw new AppError('PO not found', 404);
    if (po.status === 'RECEIVED') throw new AppError('PO already received', 400);

    const data: any = { status };
    if (status === 'RECEIVED') {
      data.receivedAt = new Date();
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data,
      include: { items: true },
    });

    if (status === 'RECEIVED') {
      // Goods Receiving: Increase stock for all items
      for (const item of updated.items) {
        await this.adjustInventory({
          ingredientId: item.ingredientId,
          branchId: updated.branchId,
          quantity: item.quantity,
          reason: `PO Received: ${updated.id}`,
          referenceId: updated.id,
          type: 'PURCHASE',
        });
      }

      const io = getIO();
      io.to('staff_room').emit('purchase-received', updated);
    }

    return updated;
  }

  // ---------------------------------------------------------------------------
  // INVENTORY & STOCK MOVEMENT
  // ---------------------------------------------------------------------------
  static async getInventory(branchId?: string) {
    const where = branchId ? { branchId } : {};
    return prisma.inventory.findMany({
      where,
      include: { ingredient: true, branch: true },
    });
  }

  static async adjustInventory(params: {
    ingredientId: string;
    branchId: string;
    quantity: number; // positive to add, negative to subtract
    reason: string;
    referenceId?: string;
    type: 'PURCHASE' | 'CONSUMPTION' | 'WASTE' | 'TRANSFER' | 'ADJUSTMENT';
  }) {
    const { ingredientId, branchId, quantity, reason, referenceId, type } = params;

    // Get or create inventory record
    let inv = await prisma.inventory.findUnique({
      where: {
        ingredientId_branchId: { ingredientId, branchId },
      },
    });

    if (!inv) {
      inv = await prisma.inventory.create({
        data: {
          ingredientId,
          branchId,
          quantity: 0,
          availableQuantity: 0,
        },
      });
    }

    const prevQuantity = inv.quantity;
    const newQuantity = prevQuantity + quantity;

    if (newQuantity < 0) {
      // For some scenarios we might allow negative stock, but usually it's bad.
      // We will just log a warning but allow it for auto-deduction sync issues.
      console.warn(
        `Inventory dropped below zero for ingredient ${ingredientId} in branch ${branchId}`,
      );
    }

    // Update Prisma
    const updated = await prisma.inventory.update({
      where: { id: inv.id },
      data: {
        quantity: newQuantity,
        availableQuantity: newQuantity - inv.reservedQuantity,
        lastUpdated: new Date(),
      },
      include: { ingredient: true },
    });

    // Record Stock Movement
    await prisma.stockMovement.create({
      data: {
        ingredientId,
        branchId,
        type,
        quantity,
        referenceId,
        notes: reason,
      },
    });

    // Log to MongoDB for high-volume tracing
    await InventoryEvent.create({
      ingredientId,
      branchId,
      eventType: type,
      previousQuantity: prevQuantity,
      newQuantity,
      metadata: { reason, referenceId },
    });

    // Check thresholds for Low Stock Alert
    if (updated.availableQuantity <= updated.ingredient.reorderPoint) {
      const io = getIO();
      io.to('staff_room').emit('stock-low', updated);

      // Could also generate InventoryAlert in Prisma here if needed.
      await prisma.inventoryAlert.create({
        data: {
          ingredientId,
          branchId,
          alertType: 'LOW_STOCK',
        },
      });
    }

    const io = getIO();
    io.to('staff_room').emit('inventory-updated', updated);

    return updated;
  }

  // ---------------------------------------------------------------------------
  // AUTO STOCK DEDUCTION
  // ---------------------------------------------------------------------------
  static async deductForOrder(orderId: string) {
    // Look up order items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return;
    const branchId = order.branchId || order.restaurantId; // fallback
    if (!branchId) return;

    for (const item of order.items) {
      // Find Recipe Mappings
      const mappings = await prisma.recipeMapping.findMany({
        where: { productId: item.productId },
      });

      for (const map of mappings) {
        const consumedQty = Number(map.quantityRequired) * item.quantity;

        // Deduct Inventory
        await this.adjustInventory({
          ingredientId: map.ingredientId,
          branchId,
          quantity: -consumedQty, // Negative for deduction
          reason: `Consumed in Order ${order.orderNumber}`,
          referenceId: orderId,
          type: 'CONSUMPTION',
        });

        // Log consumption telemetry in MongoDB
        await ConsumptionLog.create({
          orderId,
          branchId,
          ingredientId: map.ingredientId,
          quantityConsumed: consumedQty,
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // WASTE MANAGEMENT
  // ---------------------------------------------------------------------------
  static async logWaste(data: {
    ingredientId: string;
    branchId: string;
    quantity: number;
    reason: string;
    userId: string;
  }) {
    await prisma.wasteRecord.create({
      data: {
        ingredientId: data.ingredientId,
        branchId: data.branchId,
        quantity: data.quantity,
        reason: data.reason,
        recordedBy: data.userId,
      },
    });

    return this.adjustInventory({
      ingredientId: data.ingredientId,
      branchId: data.branchId,
      quantity: -data.quantity,
      reason: `Waste: ${data.reason}`,
      type: 'WASTE',
    });
  }

  // ---------------------------------------------------------------------------
  // INVENTORY TRANSFERS
  // ---------------------------------------------------------------------------
  static async transferInventory(data: {
    sourceBranchId: string;
    destinationBranchId: string;
    ingredientId: string;
    quantity: number;
    notes?: string;
  }) {
    // Immediately deduct from source
    await this.adjustInventory({
      ingredientId: data.ingredientId,
      branchId: data.sourceBranchId,
      quantity: -data.quantity,
      reason: `Transfer OUT to ${data.destinationBranchId}`,
      type: 'TRANSFER',
    });

    // Immediately add to destination (Auto-approved for simplicity, or could build approval workflow)
    await this.adjustInventory({
      ingredientId: data.ingredientId,
      branchId: data.destinationBranchId,
      quantity: data.quantity,
      reason: `Transfer IN from ${data.sourceBranchId}`,
      type: 'TRANSFER',
    });

    const transfer = await prisma.inventoryTransfer.create({
      data: {
        sourceBranchId: data.sourceBranchId,
        destinationBranchId: data.destinationBranchId,
        ingredientId: data.ingredientId,
        quantity: data.quantity,
        notes: data.notes,
        status: 'COMPLETED', // Auto-completed
      },
    });

    const io = getIO();
    io.to('staff_room').emit('transfer-approved', transfer);

    return transfer;
  }

  // ---------------------------------------------------------------------------
  // ANALYTICS
  // ---------------------------------------------------------------------------
  static async getAnalytics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const waste = await prisma.wasteRecord.aggregate({
      _sum: { quantity: true },
      where: { createdAt: { gte: today } },
    });

    const lowStockAlerts = await prisma.inventoryAlert.count({
      where: { status: 'ACTIVE' },
    });

    const activePOs = await prisma.purchaseOrder.count({
      where: { status: { in: ['SENT', 'APPROVED'] } },
    });

    // Could aggregate total inventory value by summing (inventory.quantity * averageCostPrice)
    // For MVP, just returning basic counts
    const totalIngredients = await prisma.ingredient.count({ where: { active: true } });

    return {
      wasteToday: waste._sum.quantity || 0,
      lowStockAlerts,
      activePOs,
      totalIngredients,
    };
  }
}
