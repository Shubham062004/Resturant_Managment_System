import { randomUUID } from 'crypto';

import { PrismaClient, Prisma, KitchenPriority } from '@prisma/client';

export async function seedTransactions(
  prisma: PrismaClient,
  restaurants: any[],
  branches: any[],
  customerIds: string[],
  cashierIds: string[],
  kitchenStaffIds: string[],
  deliveryStaffIds: string[],
  terminals: any[],
  tables: any[],
  stations: any[],
  partners: any[],
) {
  console.log('🌱 Seeding Transactions (3100+ Orders for May 2026)...');

  // Deleting order cascades to order items, kitchen orders, delivery assignments, pos orders, driver earnings, bills, etc.
  await prisma.order.deleteMany();

  const products = await prisma.product.findMany();

  const orders: any[] = [];
  const orderItems: any[] = [];
  const posOrders: any[] = [];
  const posPayments: any[] = [];
  const kitchenOrders: any[] = [];
  const kitchenTasks: any[] = [];
  const deliveryAssignments: any[] = [];
  const driverEarnings: any[] = [];
  const bills: any[] = [];

  for (let i = 0; i < 3100; i++) {
    const branch = branches[i % branches.length];
    const customerId = customerIds[i % customerIds.length];
    const cashierId = cashierIds[i % cashierIds.length];
    const cookId = kitchenStaffIds[i % kitchenStaffIds.length];
    const deliveryPartner = partners[i % partners.length];

    const branchTerminals = terminals.filter((t) => t.branchId === branch.id);
    const terminal =
      branchTerminals.length > 0 ? branchTerminals[i % branchTerminals.length] : null;

    const branchTables = tables.filter((t) => t.branchId === branch.id);
    const table = branchTables.length > 0 ? branchTables[i % branchTables.length] : null;

    const branchProducts = products.filter((p) => p.restaurantId === branch.restaurantId);
    const productsToUse = branchProducts.length > 0 ? branchProducts : products;

    // Distribute evenly in May 2026 (May 1 to May 31)
    const day = (i % 31) + 1;
    const hour = 9 + (i % 14); // 9 AM to 10 PM
    const minute = (i * 7) % 60;
    const orderDate = new Date(2026, 4, day, hour, minute, 0);

    // Distribution: 30% Delivery, 30% Walk-In, 30% Dine-In, 10% Pickup
    let orderType = 'WALK_IN';
    const typeRand = i % 10;
    if (typeRand < 3) orderType = 'DELIVERY';
    else if (typeRand < 6) orderType = 'WALK_IN';
    else if (typeRand < 9) orderType = 'DINE_IN';
    else orderType = 'PICKUP';

    // Status: 95% DELIVERED/PICKED_UP, 3% CANCELLED, 2% REFUNDED
    let status = 'DELIVERED';
    const statusRand = i % 100;
    if (statusRand < 2) status = 'REFUNDED';
    else if (statusRand < 5) status = 'CANCELLED';
    else {
      status = orderType === 'PICKUP' ? 'PICKED_UP' : 'DELIVERED';
    }

    // Select 1 to 3 items
    const itemCount = (i % 3) + 1;
    let subtotal = 0;
    const selectedProducts: any[] = [];

    for (let k = 0; k < itemCount; k++) {
      const prod = productsToUse[(i + k) % productsToUse.length];
      selectedProducts.push(prod);
      subtotal += Number(prod.basePrice);
    }

    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const deliveryFee = orderType === 'DELIVERY' ? 5.0 : 0.0;
    const totalAmount = parseFloat((subtotal + tax + deliveryFee).toFixed(2));

    const orderId = randomUUID();
    const orderNumber = `ORD-202605-${day.toString().padStart(2, '0')}-${i.toString().padStart(4, '0')}`;

    orders.push({
      id: orderId,
      orderNumber,
      userId: customerId,
      restaurantId: branch.restaurantId,
      branchId: branch.id,
      tableId: orderType === 'DINE_IN' && table ? table.id : null,
      subtotal: new Prisma.Decimal(subtotal),
      tax: new Prisma.Decimal(tax),
      deliveryFee: new Prisma.Decimal(deliveryFee),
      discount: new Prisma.Decimal(0),
      totalAmount: new Prisma.Decimal(totalAmount),
      status: status as any,
      orderType: orderType as any,
      createdAt: orderDate,
      updatedAt: orderDate,
    });

    // Order items
    for (let k = 0; k < selectedProducts.length; k++) {
      const prod = selectedProducts[k];
      orderItems.push({
        id: randomUUID(),
        orderId,
        productId: prod.id,
        quantity: 1,
        price: prod.basePrice,
      });
    }

    // POS details for walk-in/dine-in
    if ((orderType === 'WALK_IN' || orderType === 'DINE_IN') && terminal) {
      const posOrderId = randomUUID();
      posOrders.push({
        id: posOrderId,
        terminalId: terminal.id,
        cashierId,
        orderId,
        status: status === 'REFUNDED' ? 'REFUNDED' : status === 'CANCELLED' ? 'VOIDED' : 'PAID',
        createdAt: orderDate,
        updatedAt: orderDate,
      });

      if (status !== 'CANCELLED') {
        posPayments.push({
          id: randomUUID(),
          posOrderId,
          method: ['CASH', 'CARD', 'UPI'][i % 3] as any,
          amount: new Prisma.Decimal(totalAmount),
          status: 'COMPLETED',
          createdAt: orderDate,
        });
      }
    }

    // Kitchen Order
    const kitchenOrderId = randomUUID();
    kitchenOrders.push({
      id: kitchenOrderId,
      orderId,
      stationId: stations[i % stations.length].id,
      assignedTo: cookId,
      status: status === 'CANCELLED' ? 'QUEUED' : 'COMPLETED',
      priority: KitchenPriority.MEDIUM,
      startedAt: orderDate,
      completedAt: orderDate,
      createdAt: orderDate,
      updatedAt: orderDate,
    });

    // Kitchen Tasks
    for (let k = 0; k < selectedProducts.length; k++) {
      const prod = selectedProducts[k];
      kitchenTasks.push({
        id: randomUUID(),
        kitchenOrderId,
        productId: prod.id,
        quantity: 1,
        status: status === 'CANCELLED' ? 'PENDING' : 'DONE',
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }

    // Delivery Assignment
    if (orderType === 'DELIVERY' && deliveryPartner) {
      const deliveryAssignmentId = randomUUID();
      deliveryAssignments.push({
        id: deliveryAssignmentId,
        orderId,
        driverId: deliveryPartner.id,
        status:
          status === 'REFUNDED' ? 'DELIVERED' : status === 'CANCELLED' ? 'FAILED' : 'DELIVERED',
        assignedAt: orderDate,
        acceptedAt: orderDate,
        pickedUpAt: orderDate,
        deliveredAt: orderDate,
        createdAt: orderDate,
        updatedAt: orderDate,
      });

      if (status !== 'CANCELLED') {
        // 5-star rating has 80% probability -> gives ₹5 bonus
        const is5Star = i % 5 !== 0;
        driverEarnings.push({
          id: randomUUID(),
          driverId: deliveryPartner.id,
          orderId,
          earnings: new Prisma.Decimal(50.0),
          bonus: new Prisma.Decimal(is5Star ? 5.0 : 0.0),
          createdAt: orderDate,
        });
      }
    }

    // Bills
    bills.push({
      id: randomUUID(),
      orderId,
      subtotal: new Prisma.Decimal(subtotal),
      tax: new Prisma.Decimal(tax),
      discount: new Prisma.Decimal(0),
      total: new Prisma.Decimal(totalAmount),
      paymentStatus: status === 'CANCELLED' ? 'UNPAID' : 'PAID',
      createdAt: orderDate,
      updatedAt: orderDate,
    });
  }

  // Batch insert all arrays
  const batchSize = 500;

  console.log(`Inserting ${orders.length} orders...`);
  for (let idx = 0; idx < orders.length; idx += batchSize) {
    await prisma.order.createMany({ data: orders.slice(idx, idx + batchSize) });
  }

  console.log(`Inserting ${orderItems.length} order items...`);
  for (let idx = 0; idx < orderItems.length; idx += batchSize) {
    await prisma.orderItem.createMany({ data: orderItems.slice(idx, idx + batchSize) });
  }

  console.log(`Inserting ${posOrders.length} POS orders...`);
  for (let idx = 0; idx < posOrders.length; idx += batchSize) {
    await prisma.pOSOrder.createMany({ data: posOrders.slice(idx, idx + batchSize) });
  }

  console.log(`Inserting ${posPayments.length} POS payments...`);
  for (let idx = 0; idx < posPayments.length; idx += batchSize) {
    await prisma.pOSPayment.createMany({ data: posPayments.slice(idx, idx + batchSize) });
  }

  console.log(`Inserting ${kitchenOrders.length} kitchen orders...`);
  for (let idx = 0; idx < kitchenOrders.length; idx += batchSize) {
    await prisma.kitchenOrder.createMany({ data: kitchenOrders.slice(idx, idx + batchSize) });
  }

  console.log(`Inserting ${kitchenTasks.length} kitchen tasks...`);
  for (let idx = 0; idx < kitchenTasks.length; idx += batchSize) {
    await prisma.kitchenTask.createMany({ data: kitchenTasks.slice(idx, idx + batchSize) });
  }

  console.log(`Inserting ${deliveryAssignments.length} delivery assignments...`);
  for (let idx = 0; idx < deliveryAssignments.length; idx += batchSize) {
    await prisma.deliveryAssignment.createMany({
      data: deliveryAssignments.slice(idx, idx + batchSize),
    });
  }

  console.log(`Inserting ${driverEarnings.length} driver earnings...`);
  for (let idx = 0; idx < driverEarnings.length; idx += batchSize) {
    await prisma.driverEarnings.createMany({ data: driverEarnings.slice(idx, idx + batchSize) });
  }

  console.log(`Inserting ${bills.length} bills...`);
  for (let idx = 0; idx < bills.length; idx += batchSize) {
    await prisma.bill.createMany({ data: bills.slice(idx, idx + batchSize) });
  }

  console.log(`✅ Seeded ${orders.length} historical orders for May 2026 successfully.`);
  return { orderCount: orders.length };
}
