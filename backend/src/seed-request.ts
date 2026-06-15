import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRequest() {
  console.log('Seeding dummy inventory request...');

  // Find a branch
  const branch = await prisma.branch.findFirst();
  if (!branch) throw new Error('No branch found');

  // Find a branch manager or any user
  let user = await prisma.user.findFirst({
    where: { role: 'BRANCH_MANAGER' },
  });
  if (!user) {
    user = await prisma.user.findFirst();
  }
  if (!user) throw new Error('No user found');

  // Find some ingredients
  const ingredients = await prisma.ingredient.findMany({ take: 3 });
  if (ingredients.length === 0) throw new Error('No ingredients found');

  const request = await prisma.inventoryRequest.create({
    data: {
      branchId: branch.id,
      requestedById: user.id,
      status: 'PENDING',
      notes: 'Weekly replenishment for high-volume items.',
      items: {
        create: ingredients.map((ing) => ({
          ingredientId: ing.id,
          requestedQuantity: Math.floor(Math.random() * 50) + 10,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  console.log('Successfully created dummy request:', request.id);
}

seedRequest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
