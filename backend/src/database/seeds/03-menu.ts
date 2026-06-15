import { PrismaClient, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function seedMenu(prisma: PrismaClient, restaurants: any[], customerIds: string[]) {
  console.log('🌱 Seeding Menu (Categories, Products, Variants, Reviews)...');

  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categoryNames = [
    'Pizza',
    'Burger',
    'Wraps',
    'Pasta',
    'Desserts',
    'Drinks',
    'Indian Meals',
    'Chinese',
    'Salads',
    'Appetizers',
    'Sandwiches',
    'Sushi',
    'Tacos',
    'Breakfast',
    'Vegan',
  ];

  const categories = [];
  const products = [];
  const variants = [];
  const reviews = [];

  for (const restaurant of restaurants) {
    let sortOrder = 1;
    for (const catName of categoryNames) {
      const categoryId = randomUUID();
      categories.push({
        id: categoryId,
        restaurantId: restaurant.id,
        name: catName,
        slug: `${catName.toLowerCase().replace(/ /g, '-')}-${restaurant.slug}`,
        description: `Delicious ${catName} at ${restaurant.name}`,
        sortOrder: sortOrder++,
      });

      // Create 6-7 products per category per restaurant to reach >100 products easily
      for (let i = 1; i <= 7; i++) {
        const productId = randomUUID();
        const basePrice = 5.99 + i * 2;

        products.push({
          id: productId,
          restaurantId: restaurant.id,
          categoryId: categoryId,
          name: `${catName} Special ${i}`,
          slug: `${catName.toLowerCase()}-special-${i}-${restaurant.slug}`,
          description: `Chef's special ${catName} preparation.`,
          shortDescription: `Hot and fresh ${catName}.`,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
          basePrice: new Prisma.Decimal(basePrice),
          rating: 4.0 + Math.random(),
          calories: 300 + i * 50,
          preparationTime: 15 + i,
          isAvailable: true,
          isVeg: i % 2 === 0,
          featured: i === 1,
        });

        // Add default variant
        variants.push({
          id: randomUUID(),
          productId,
          name: 'Regular',
          price: new Prisma.Decimal(basePrice),
          isDefault: true,
        });

        // Add 1-2 reviews per product
        reviews.push({
          id: randomUUID(),
          productId,
          userId: customerIds[i % customerIds.length],
          rating: 4 + Math.round(Math.random()),
          comment: `Great ${catName}!`,
        });
      }
    }
  }

  // Batch inserts
  await prisma.category.createMany({ data: categories });

  const pBatch = 100;
  for (let i = 0; i < products.length; i += pBatch) {
    await prisma.product.createMany({ data: products.slice(i, i + pBatch) });
  }

  for (let i = 0; i < variants.length; i += pBatch) {
    await prisma.productVariant.createMany({ data: variants.slice(i, i + pBatch) });
  }

  for (let i = 0; i < reviews.length; i += pBatch) {
    await prisma.review.createMany({ data: reviews.slice(i, i + pBatch) });
  }

  return { categories, products };
}
