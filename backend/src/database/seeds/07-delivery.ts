import { randomUUID } from 'crypto';

import { PrismaClient } from '@prisma/client';

export async function seedDelivery(prisma: PrismaClient, deliveryStaffIds: string[]) {
  console.log('🌱 Seeding Delivery (Partners, Ratings, Earnings)...');

  const partners = [];
  for (const driverId of deliveryStaffIds) {
    partners.push({
      id: randomUUID(),
      userId: driverId,
      vehicleType: Math.random() > 0.5 ? 'BIKE' : 'SCOOTER',
      vehicleNumber: `DL-${Math.floor(Math.random() * 9000) + 1000}`,
      licenseNumber: `LIC-${Math.floor(Math.random() * 9000000)}`,
      rating: 4.0 + Math.random(),
      activeStatus: true,
    });
  }

  await prisma.deliveryPartner.deleteMany();
  await prisma.deliveryPartner.createMany({ data: partners });

  // Assignments will be created dynamically with Orders in 05-transactions or generated here for past orders.
  return { partners };
}
