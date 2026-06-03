import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function seedOrgsAndBranches(prisma: PrismaClient) {
  console.log('🌱 Seeding Organizations & Branches...');
  
  // Clean existing
  await prisma.branch.deleteMany();
  await prisma.restaurantGroup.deleteMany();
  await prisma.franchise.deleteMany();
  await prisma.organization.deleteMany();

  // Create Parent Organization
  const orgId = randomUUID();
  const org = await prisma.organization.create({
    data: {
      id: orgId,
      name: 'Oven Xpress Group',
      slug: 'oven-xpress-group',
      status: 'ACTIVE',
    },
  });

  // Create Restaurants
  const restaurantsData = [
    { name: 'Oven Xpress Downtown', slug: 'ox-downtown', rating: 4.8 },
    { name: 'Oven Xpress City Center', slug: 'ox-city-center', rating: 4.6 },
    { name: 'Oven Xpress Riverside', slug: 'ox-riverside', rating: 4.9 },
  ];

  const restaurants = [];
  for (const r of restaurantsData) {
    const res = await prisma.restaurantGroup.create({
      data: {
        id: randomUUID(),
        organizationId: orgId,
        name: r.name,
        slug: r.slug,
        description: `Premium dining experience at ${r.name}`,
        rating: r.rating,
      },
    });
    restaurants.push(res);
  }

  // Create 6 Branches
  const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Kolkata'];
  const branches = [];
  let i = 0;
  for (const city of cities) {
    const restaurant = restaurants[i % restaurants.length];
    const branch = await prisma.branch.create({
      data: {
        id: randomUUID(),
        restaurantId: restaurant.id,
        organizationId: orgId,
        name: `Oven Xpress - ${city}`,
        address: `123 Main St, ${city} Center`,
        city: city,
        state: city === 'Delhi' ? 'DL' : 'MH',
        latitude: 28.6139 + (i * 0.1),
        longitude: 77.2090 + (i * 0.1),
        openingTime: '09:00 AM',
        closingTime: '11:00 PM',
        deliveryRadius: 10.0,
      },
    });
    branches.push(branch);
    i++;
  }

  return { orgId, restaurants, branches };
}
