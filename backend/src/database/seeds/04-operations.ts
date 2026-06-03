import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function seedOperations(prisma: PrismaClient, branches: any[], customerIds: string[]) {
  console.log('🌱 Seeding Operations (Reservations, Waitlist, Inventory)...');

  await prisma.reservation.deleteMany();
  await prisma.waitlistEntry.deleteMany();

  const reservations = [];
  
  const statuses = ['COMPLETED', 'CONFIRMED', 'CANCELLED', 'NO_SHOW'];
  
  for (let i = 0; i < 150; i++) {
    const branch = branches[i % branches.length];
    const customerId = customerIds[i % customerIds.length];
    
    // Generate dates around today
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + (Math.floor(Math.random() * 14) - 7)); // -7 to +7 days
    const dateStr = dateObj.toISOString().split('T')[0];

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
