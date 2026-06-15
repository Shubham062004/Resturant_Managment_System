import { randomUUID } from 'crypto';

import { PrismaClient } from '@prisma/client';

export async function seedOperations(prisma: PrismaClient, branches: any[], customerIds: string[]) {
  console.log('🌱 Seeding Operations (Reservations, Waitlist, Inventory)...');

  await prisma.reservation.deleteMany();
  await prisma.waitlistEntry.deleteMany();

  const reservations = [];

  const statuses = ['COMPLETED', 'CONFIRMED', 'CANCELLED', 'NO_SHOW'];

  for (let i = 0; i < 150; i++) {
    const branch = branches[i % branches.length];
    const customerId = customerIds[i % customerIds.length];

    // Generate dates in May 2026
    const day = (i % 31) + 1;
    const dateStr = `2026-05-${day.toString().padStart(2, '0')}`;

    reservations.push({
      id: randomUUID(),
      customerId,
      branchId: branch.id,
      reservationDate: dateStr,
      reservationTime: '19:00',
      guestCount: 2 + (i % 4),
      status: statuses[i % statuses.length] as any,
    });
  }

  await prisma.reservation.createMany({ data: reservations });

  console.log('🌱 Inventory setup skipped for brevity (tables not defined in subset schema)');

  return { reservations };
}
