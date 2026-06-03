import { PrismaClient, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function seedTransactions(
  prisma: PrismaClient,
  restaurants: any[],
  branches: any[],
  customerIds: string[]
) {
  console.log('🌱 Seeding Transactions (1000 Orders)...');

  await prisma.order.deleteMany();

  const orders = [];
  const statuses = ['DELIVERED', 'CANCELLED', 'REFUNDED', 'COMPLETED', 'PLACED', 'PREPARING'];
  const types = ['DELIVERY', 'TAKEAWAY', 'DINE_IN'];

  for (let i = 0; i < 1000; i++) {
    const restaurant = restaurants[i % restaurants.length];
    const branch = branches[i % branches.length];
    const customerId = customerIds[i % customerIds.length];

    // Distribute orders across the last 365 days
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 365));

    const subtotal = parseFloat((15 + Math.random() * 80).toFixed(2));
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const deliveryFee = i < 500 ? 5.00 : 0.00; // 50% delivery
    const totalAmount = parseFloat((subtotal + tax + deliveryFee).toFixed(2));

    // Distribution: 50% Delivery, 20% Takeaway, 20% Dine-In, 10% Walk-In
    let orderType = 'DELIVERY';
    if (i >= 500 && i < 700) orderType = 'TAKEAWAY';
    else if (i >= 700 && i < 900) orderType = 'DINE_IN';
    else if (i >= 900) orderType = 'WALK_IN';

    orders.push({
      id: randomUUID(),
      orderNumber: `ORD-${orderDate.getTime()}-${i}`,
      userId: customerId,
      restaurantId: restaurant.id,
      branchId: branch.id,
      subtotal: new Prisma.Decimal(subtotal),
      tax: new Prisma.Decimal(tax),
      deliveryFee: new Prisma.Decimal(deliveryFee),
      discount: new Prisma.Decimal(0),
      totalAmount: new Prisma.Decimal(totalAmount),
      status: statuses[i % statuses.length] as any,
      orderType: orderType as any,
      createdAt: orderDate,
      updatedAt: orderDate,
    });
  }

  // Batch insert 200 orders at a time
  const batchSize = 200;
  for (let i = 0; i < orders.length; i += batchSize) {
    await prisma.order.createMany({
      data: orders.slice(i, i + batchSize),
    });
  }

  return { orderCount: orders.length };
}
