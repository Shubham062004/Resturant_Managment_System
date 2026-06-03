import { prisma } from '../config/db';
import { seedOrgsAndBranches } from './seeds/01-orgs-branches';
import { seedUsers } from './seeds/02-users';
import { seedMenu } from './seeds/03-menu';
import { seedOperations } from './seeds/04-operations';
import { seedTransactions } from './seeds/05-transactions';
import { seedInventory } from './seeds/06-inventory';
import { seedDelivery } from './seeds/07-delivery';
import { seedKitchen } from './seeds/08-kitchen';
import { seedPOS } from './seeds/09-pos';
import { connectDatabases, disconnectDatabases } from '../config/db';
import { seedMongoDB } from './seeds/10-mongodb';

async function main() {
  console.log('🚀 Initiating Complete Demo Environment Seeding...');

  try {
    await connectDatabases();
    
    const { orgId, restaurants, branches } = await seedOrgsAndBranches(prisma);
    const users = await seedUsers(prisma, orgId, branches);
    
    await seedMenu(prisma, restaurants, users.customers);
    await seedOperations(prisma, branches, users.customers);
    await seedTransactions(prisma, restaurants, branches, users.customers);
    
    // New Seeders
    await seedInventory(prisma, branches);
    await seedDelivery(prisma, users.deliveryStaff);
    await seedKitchen(prisma);
    await seedPOS(prisma, branches, users.cashiers);

    // MongoDB Analytics Events
    await seedMongoDB(users.customers);

    console.log('✅ Master Seed Execution Completed Successfully!');
  } catch (error) {
    console.error('❌ Error during demo database seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
