import { connectDatabases, disconnectDatabases, prisma } from '../config/db';

import { seedMongoDB } from './seeds/10-mongodb';

async function main() {
  console.log('🚀 Initiating Complete MongoDB Analytics Seeding...');

  try {
    await connectDatabases();

    // Fetch customer IDs from Postgres to link the Mongoose events
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: { id: true },
    });

    const customerIds = customers.map((c) => c.id);

    if (customerIds.length === 0) {
      console.warn(
        '⚠️ No customers found in PostgreSQL. Run npm run seed:postgres first.'
      );
      process.exit(1);
    }

    await seedMongoDB(customerIds);

    console.log('✅ MongoDB Seeding Completed Successfully!');
  } catch (error) {
    console.error('❌ Error during demo database seeding:', error);
    process.exit(1);
  } finally {
    await disconnectDatabases();
  }
}

main();
