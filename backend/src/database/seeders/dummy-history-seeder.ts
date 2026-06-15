import { PrismaClient, Role, OrderType, OrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const NUM_BRANCHES = 10;
const NUM_CUSTOMERS = 5000;
const NUM_STAFF = 200;
const NUM_SUPPLIERS = 50;
const NUM_INGREDIENTS = 100;
const NUM_PRODUCTS = 150;

// Simulation Period
const START_DATE = new Date('2025-07-01T00:00:00.000Z');
const END_DATE = new Date('2026-06-30T23:59:59.000Z');

async function main() {
  console.log('🚀 Starting Massive Dummy History Generation...');
  console.log(
    `Period: ${START_DATE.toISOString().split('T')[0]} to ${END_DATE.toISOString().split('T')[0]}`,
  );

  // PHASE 1: ORGANIZATION & FRANCHISE
  console.log('Building Foundations...');
  const org = await prisma.organization.upsert({
    where: { slug: 'abc-restaurant-group' },
    update: {},
    create: {
      name: 'ABC Restaurant Group',
      slug: 'abc-restaurant-group',
    },
  });

  const franchise =
    (await prisma.franchise.findFirst({
      where: { organizationId: org.id },
    })) ||
    (await prisma.franchise.create({
      data: {
        organizationId: org.id,
        ownerName: 'Mr. ABC Owner',
      },
    }));

  const restGroup = await prisma.restaurantGroup.upsert({
    where: { slug: 'abc-restaurants' },
    update: {},
    create: {
      organizationId: org.id,
      name: 'ABC Restaurants',
      slug: 'abc-restaurants',
      description: 'The best multi-cuisine restaurant chain.',
    },
  });

  // PHASE 2: BRANCHES
  const branchNames = [
    'ABC Connaught Place',
    'ABC Rajouri Garden',
    'ABC Saket',
    'ABC Dwarka Sector 12',
    'ABC Rohini Sector 8',
    'ABC Karol Bagh',
    'ABC Janakpuri',
    'ABC Lajpat Nagar',
    'ABC Nehru Place',
    'ABC Chandni Chowk',
    'ABC Pitampura',
    'ABC Vasant Kunj',
  ];

  const branches = await Promise.all(
    branchNames.map((name) =>
      prisma.branch.create({
        data: {
          organizationId: org.id,
          franchiseId: franchise.id,
          restaurantId: restGroup.id,
          name: name,
          address: faker.location.streetAddress(),
          city: name.replace('ABC ', ''),
          state: 'Delhi',
          latitude: faker.location.latitude({ max: 28.8, min: 28.4 }),
          longitude: faker.location.longitude({ max: 77.4, min: 76.8 }),
          openingTime: '10:00',
          closingTime: '23:00',
          deliveryRadius: 10.0,
        },
      }),
    ),
  );
  console.log(`✅ Created ${branches.length} Branches.`);

  // PHASE 3: STAFF
  const roles = [
    Role.BRANCH_MANAGER,
    Role.CASHIER,
    Role.HEAD_CHEF,
    Role.KITCHEN_STAFF,
    Role.DELIVERY_PARTNER,
  ];
  const staffData = Array.from({ length: NUM_STAFF }).map(() => ({
    email: faker.internet.email(),
    phone: faker.phone.number(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: faker.helpers.arrayElement(roles),
    organizationId: org.id,
    franchiseId: franchise.id,
    isActive: true,
    salary: faker.number.int({ min: 15000, max: 85000 }),
    attendanceCount: faker.number.int({ min: 200, max: 300 }),
    performanceScore: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
  }));
  await prisma.user.createMany({ data: staffData, skipDuplicates: true });
  console.log(`✅ Created ${NUM_STAFF} Staff Members.`);

  // PHASE 4: CUSTOMERS
  const customerData = Array.from({ length: NUM_CUSTOMERS }).map(() => ({
    email: faker.internet.email(),
    phone: faker.phone.number(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: Role.CUSTOMER,
    organizationId: org.id,
    isActive: true,
  }));
  // Chunk inserting customers due to size
  for (let i = 0; i < customerData.length; i += 1000) {
    await prisma.user.createMany({ data: customerData.slice(i, i + 1000), skipDuplicates: true });
  }
  const allCustomers = await prisma.user.findMany({
    where: { role: Role.CUSTOMER },
    select: { id: true },
  });
  console.log(`✅ Created ${allCustomers.length} Customers.`);

  // PHASE 5: SUPPLIERS & INGREDIENTS
  const supplierData = Array.from({ length: NUM_SUPPLIERS }).map(() => ({
    name: faker.company.name(),
    contactPerson: faker.person.fullName(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    rating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
  }));
  await prisma.supplier.createMany({ data: supplierData });
  console.log(`✅ Created ${NUM_SUPPLIERS} Suppliers.`);

  const units = ['KG', 'LITER', 'PIECE', 'PACK'];
  const ingredientData = Array.from({ length: NUM_INGREDIENTS }).map((_, i) => ({
    name: `Ingredient ${faker.commerce.productMaterial()} ${i}`,
    sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
    category: faker.commerce.department(),
    unit: faker.helpers.arrayElement(units),
    minimumStock: faker.number.float({ min: 10, max: 50 }),
    reorderPoint: faker.number.float({ min: 50, max: 100 }),
    costPrice: faker.number.float({ min: 10, max: 500 }),
  }));
  await prisma.ingredient.createMany({ data: ingredientData });
  const allIngredients = await prisma.ingredient.findMany();
  console.log(`✅ Created ${allIngredients.length} Ingredients.`);

  // Seed inventory for all branches
  const inventoryData = [];
  for (const branch of branches) {
    for (const ingredient of allIngredients) {
      inventoryData.push({
        branchId: branch.id,
        ingredientId: ingredient.id,
        quantity: faker.number.float({ min: 200, max: 1000 }),
        availableQuantity: faker.number.float({ min: 200, max: 1000 }),
      });
    }
  }
  // chunk insert inventory
  for (let i = 0; i < inventoryData.length; i += 2000) {
    await prisma.inventory.createMany({ data: inventoryData.slice(i, i + 2000) });
  }
  console.log(`✅ Created Branch Inventory.`);

  // PHASE 6: CATEGORIES & MENU ITEMS
  const categories = ['Pizza', 'Burger', 'Chinese', 'Beverages', 'Desserts', 'Combos'];
  await prisma.category.createMany({
    data: categories.map((c) => ({
      restaurantId: restGroup.id,
      name: c,
      slug: c.toLowerCase(),
    })),
    skipDuplicates: true,
  });
  const dbCategories = await prisma.category.findMany();

  const productData = Array.from({ length: NUM_PRODUCTS }).map((_, i) => ({
    restaurantId: restGroup.id,
    categoryId: faker.helpers.arrayElement(dbCategories).id,
    name: `${faker.commerce.productAdjective()} ${faker.commerce.productName()} ${i}`,
    slug: faker.helpers.slugify(`${faker.commerce.productName()}-${i}`).toLowerCase(),
    basePrice: faker.number.float({ min: 99, max: 1299 }),
    rating: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
    preparationTime: faker.number.int({ min: 10, max: 45 }),
    isVeg: faker.datatype.boolean(),
  }));
  await prisma.product.createMany({ data: productData, skipDuplicates: true });
  const allProducts = await prisma.product.findMany();
  console.log(`✅ Created ${allProducts.length} Menu Items.`);

  // PHASE 7: TIME-SERIES DAILY SIMULATION
  // To keep generation within a reasonable time limit for testing, we will simulate 10 days
  // with heavy volume instead of 365 days, or sparse records across 365 days.
  // We will do sparse 365 days (e.g. 5 orders per branch per day = 50 orders/day = ~18,000 orders total)

  console.log('⏳ Starting 365-Day Time-Series Simulation... This may take a few minutes.');

  let currentDate = new Date(START_DATE);
  let totalOrdersGenerated = 0;

  const orderTypes = [OrderType.DINE_IN, OrderType.PICKUP, OrderType.DELIVERY];
  const orderStatuses = [OrderStatus.DELIVERED, OrderStatus.DELIVERED];

  const allOrderInserts = [];

  while (currentDate <= END_DATE) {
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const ordersPerBranch = isWeekend
      ? faker.number.int({ min: 8, max: 15 })
      : faker.number.int({ min: 3, max: 8 });

    for (const branch of branches) {
      for (let i = 0; i < ordersPerBranch; i++) {
        const orderTime = new Date(currentDate);
        orderTime.setHours(
          faker.number.int({ min: 11, max: 22 }),
          faker.number.int({ min: 0, max: 59 }),
        );

        const customer = faker.helpers.arrayElement(allCustomers);
        const type = faker.helpers.arrayElement(orderTypes);
        const subtotal = faker.number.float({ min: 200, max: 2500 });
        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        allOrderInserts.push({
          branchId: branch.id,
          userId: customer.id,
          orderType: type,
          status: faker.helpers.arrayElement(orderStatuses),
          subtotal: subtotal,
          tax: tax,
          totalAmount: total,
          createdAt: orderTime,
          updatedAt: orderTime,
        });
        totalOrdersGenerated++;
      }
    }

    // Increment day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Insert orders in chunks of 5000
  console.log(`Bulk inserting ${totalOrdersGenerated} historical orders...`);
  for (let i = 0; i < allOrderInserts.length; i += 5000) {
    await prisma.order.createMany({ data: allOrderInserts.slice(i, i + 5000) });
    process.stdout.write(`.`);
  }
  console.log(`\n✅ Generated ${totalOrdersGenerated} Orders across 365 days.`);

  console.log('🎉 Dummy History Simulation Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
