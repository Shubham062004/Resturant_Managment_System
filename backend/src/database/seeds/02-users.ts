import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function seedUsers(prisma: PrismaClient, orgId: string, branches: any[]) {
  console.log('🌱 Seeding Users (Admin, Staff, Customers)...');
  
  await prisma.user.deleteMany();

  const salt = bcrypt.genSaltSync(10);
  const hashes = {
    super: bcrypt.hashSync('SuperAdmin@123', salt),
    owner: bcrypt.hashSync('Owner@123', salt),
    manager: bcrypt.hashSync('Manager@123', salt),
    kitchen: bcrypt.hashSync('Kitchen@123', salt),
    delivery: bcrypt.hashSync('Delivery@123', salt),
    cashier: bcrypt.hashSync('Cashier@123', salt),
    customer: bcrypt.hashSync('Customer@123', salt),
  };

  const usersToCreate = [];

  // Super Admin
  usersToCreate.push({
    id: randomUUID(),
    email: 'superadmin@ovenxpress.com',
    firstName: 'System',
    lastName: 'Admin',
    role: Role.SUPER_ADMIN,
    passwordHash: hashes.super,
    isEmailVerified: true,
  });

  // Owner
  usersToCreate.push({
    id: randomUUID(),
    email: 'owner@ovenxpress.com',
    firstName: 'Group',
    lastName: 'Owner',
    role: Role.ORGANIZATION_OWNER,
    organizationId: orgId,
    passwordHash: hashes.owner,
    isEmailVerified: true,
  });

  // 6 Branch Managers
  const managers = [];
  for (const branch of branches) {
    const userId = randomUUID();
    usersToCreate.push({
      id: userId,
      email: `manager.${branch.city.toLowerCase()}@ovenxpress.com`,
      firstName: branch.city,
      lastName: 'Manager',
      role: Role.BRANCH_MANAGER,
      organizationId: orgId,
      passwordHash: hashes.manager,
      isEmailVerified: true,
    });
    managers.push(userId);
  }

  // 15 Kitchen Staff
  const kitchenStaff = [];
  for (let i = 1; i <= 15; i++) {
    const userId = randomUUID();
    usersToCreate.push({
      id: userId,
      email: `kitchen${i}@ovenxpress.com`,
      firstName: 'Chef',
      lastName: `${i}`,
      role: Role.KITCHEN_STAFF,
      organizationId: orgId,
      passwordHash: hashes.kitchen,
      isEmailVerified: true,
    });
    kitchenStaff.push(userId);
  }

  // 20 Delivery Partners
  const deliveryStaff = [];
  for (let i = 1; i <= 20; i++) {
    const userId = randomUUID();
    usersToCreate.push({
      id: userId,
      email: `driver${i}@ovenxpress.com`,
      firstName: 'Rider',
      lastName: `${i}`,
      role: Role.DELIVERY_PARTNER,
      organizationId: orgId,
      passwordHash: hashes.delivery,
      isEmailVerified: true,
    });
    deliveryStaff.push(userId);
  }

  // 10 Cashiers
  const cashiers = [];
  for (let i = 1; i <= 10; i++) {
    const userId = randomUUID();
    usersToCreate.push({
      id: userId,
      email: `cashier${i}@ovenxpress.com`,
      firstName: 'Cashier',
      lastName: `${i}`,
      role: Role.CASHIER,
      organizationId: orgId,
      passwordHash: hashes.cashier,
      isEmailVerified: true,
    });
    cashiers.push(userId);
  }

  // 100 Customers
  const customers = [];
  for (let i = 1; i <= 100; i++) {
    const userId = randomUUID();
    usersToCreate.push({
      id: userId,
      email: `customer${i}@test.com`,
      firstName: 'Demo',
      lastName: `Customer ${i}`,
      phone: `+9198765${i.toString().padStart(5, '0')}`,
      role: Role.CUSTOMER,
      passwordHash: hashes.customer,
      isEmailVerified: true,
      isPhoneVerified: true,
    });
    customers.push(userId);
  }

  // Batch insert
  const batchSize = 50;
  for (let i = 0; i < usersToCreate.length; i += batchSize) {
    await prisma.user.createMany({
      data: usersToCreate.slice(i, i + batchSize),
    });
  }

  return { managers, kitchenStaff, deliveryStaff, cashiers, customers };
}
