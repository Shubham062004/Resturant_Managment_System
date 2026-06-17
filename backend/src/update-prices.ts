import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePrices() {
  console.log('Updating prices for all ingredients with costPrice 0...');
  const ingredients = await prisma.ingredient.findMany({
    where: { costPrice: 0 },
  });

  console.log(`Found ${ingredients.length} ingredients to update.`);

  for (const ing of ingredients) {
    // Generate a random cost price between 20 and 500
    const randomPrice = Math.floor(Math.random() * 480) + 20;

    await prisma.ingredient.update({
      where: { id: ing.id },
      data: { costPrice: randomPrice },
    });
    console.log(`Updated ${ing.name} to ₹${randomPrice}`);
  }

  console.log('Done!');
}

updatePrices()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
