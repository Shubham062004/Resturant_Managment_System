import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function seedKitchen(prisma: PrismaClient) {
  console.log('🌱 Seeding Kitchen (Stations)...');

  const stations = [
    { id: randomUUID(), name: 'Grill Station', description: 'Burgers and Steaks' },
    { id: randomUUID(), name: 'Pizza', description: 'Pizzas and Flatbreads' },
    { id: randomUUID(), name: 'Salad Bar', description: 'Cold prep and Salads' },
    { id: randomUUID(), name: 'Fryer', description: 'Fries and Appetizers' },
    { id: randomUUID(), name: 'Dessert Prep', description: 'Sweets and Shakes' }
  ];

  await prisma.kitchenStation.deleteMany();
  await prisma.kitchenStation.createMany({ data: stations });

  return { stations };
}
