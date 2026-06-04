import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function seedUsers(prisma: PrismaClient, orgId: string, _branches: any[]) {
  console.log('🌱 Seeding Users (Admin, Staff, Customers)...');
  
  await prisma.user.deleteMany();

  const salt = bcrypt.genSaltSync(10);
  
  // Specific Requested Credentials
  const explicitUsers = [
    { email: 'customer@ovenxpress.com', password: 'Customer@123', phone: '9000000001', role: Role.CUSTOMER, otpEnabled: false, firstName: 'Standard', lastName: 'Customer' },
    { email: 'vipcustomer@ovenxpress.com', password: 'Customer@123', phone: '9000000002', role: Role.CUSTOMER, otpEnabled: false, firstName: 'VIP', lastName: 'Customer' },
    { email: 'cashier@ovenxpress.com', password: 'Cashier@123', phone: '9000000010', role: Role.CASHIER, otpEnabled: true, firstName: 'Main', lastName: 'Cashier' },
    { email: 'kitchen@ovenxpress.com', password: 'Kitchen@123', phone: '9000000011', role: Role.KITCHEN_STAFF, otpEnabled: true, firstName: 'Line', lastName: 'Cook' },
    { email: 'chef@ovenxpress.com', password: 'Chef@123', phone: '9000000012', role: Role.HEAD_CHEF, otpEnabled: true, firstName: 'Head', lastName: 'Chef' },
    { email: 'kitchenmanager@ovenxpress.com', password: 'KitchenManager@123', phone: '9000000013', role: Role.KITCHEN_MANAGER, otpEnabled: true, firstName: 'Kitchen', lastName: 'Manager' },
    { email: 'driver@ovenxpress.com', password: 'Driver@123', phone: '9000000014', role: Role.DELIVERY_PARTNER, otpEnabled: true, firstName: 'Delivery', lastName: 'Partner' },
    { email: 'deliverymanager@ovenxpress.com', password: 'DeliveryManager@123', phone: '9000000015', role: Role.DELIVERY_MANAGER, otpEnabled: true, firstName: 'Delivery', lastName: 'Manager' },
    { email: 'branchmanager@ovenxpress.com', password: 'BranchManager@123', phone: '9000000016', role: Role.BRANCH_MANAGER, otpEnabled: true, firstName: 'Branch', lastName: 'Manager' },
    { email: 'operations@ovenxpress.com', password: 'Operations@123', phone: '9000000017', role: Role.OPERATIONS_MANAGER, otpEnabled: true, firstName: 'Operations', lastName: 'Manager' },
    { email: 'finance@ovenxpress.com', password: 'Finance@123', phone: '9000000018', role: Role.FINANCE_MANAGER, otpEnabled: true, firstName: 'Finance', lastName: 'Manager' },
    { email: 'admin@ovenxpress.com', password: 'Admin@123', phone: '9000000019', role: Role.ADMIN, otpEnabled: true, firstName: 'System', lastName: 'Admin' },
    { email: 'franchise@ovenxpress.com', password: 'Franchise@123', phone: '9000000020', role: Role.FRANCHISE_OWNER, otpEnabled: true, firstName: 'Franchise', lastName: 'Owner' },
    { email: 'owner@ovenxpress.com', password: 'Owner@123', phone: '9000000021', role: Role.ORGANIZATION_OWNER, otpEnabled: true, firstName: 'Organization', lastName: 'Owner' },
    { email: 'superadmin@ovenxpress.com', password: 'SuperAdmin@123', phone: '9000000022', role: Role.SUPER_ADMIN, otpEnabled: true, firstName: 'Super', lastName: 'Admin' },
  ];

  const usersToCreate = explicitUsers.map(u => ({
    id: randomUUID(),
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    role: u.role,
    otpEnabled: u.otpEnabled,
    passwordHash: bcrypt.hashSync(u.password, salt),
    organizationId: u.role === Role.SUPER_ADMIN ? null : orgId,
    isEmailVerified: true,
    isPhoneVerified: true,
  }));

  // Arrays to return for other seeders
  const managers = usersToCreate.filter(u => u.role === Role.BRANCH_MANAGER).map(u => u.id);
  const kitchenStaff = usersToCreate.filter(u => u.role === Role.KITCHEN_STAFF || u.role === Role.HEAD_CHEF).map(u => u.id);
  const deliveryStaff = usersToCreate.filter(u => u.role === Role.DELIVERY_PARTNER).map(u => u.id);
  const cashiers = usersToCreate.filter(u => u.role === Role.CASHIER).map(u => u.id);
  const customers = usersToCreate.filter(u => u.role === Role.CUSTOMER).map(u => u.id);

  // Generate a few extra customers and staff to ensure seeders have enough data to distribute
  for (let i = 1; i <= 5; i++) {
    const managerId = randomUUID();
    usersToCreate.push({ id: managerId, email: `branch.mgr${i}@ovenxpress.com`, firstName: `Branch`, lastName: `Manager ${i}`, phone: `91000000${i}`, role: Role.BRANCH_MANAGER, otpEnabled: true, passwordHash: bcrypt.hashSync('Manager@123', salt), organizationId: orgId, isEmailVerified: true, isPhoneVerified: true });
    managers.push(managerId);

    const chefId = randomUUID();
    usersToCreate.push({ id: chefId, email: `cook${i}@ovenxpress.com`, firstName: `Cook`, lastName: `${i}`, phone: `92000000${i}`, role: Role.KITCHEN_STAFF, otpEnabled: true, passwordHash: bcrypt.hashSync('Kitchen@123', salt), organizationId: orgId, isEmailVerified: true, isPhoneVerified: true });
    kitchenStaff.push(chefId);

    const driverId = randomUUID();
    usersToCreate.push({ id: driverId, email: `rider${i}@ovenxpress.com`, firstName: `Rider`, lastName: `${i}`, phone: `93000000${i}`, role: Role.DELIVERY_PARTNER, otpEnabled: true, passwordHash: bcrypt.hashSync('Driver@123', salt), organizationId: orgId, isEmailVerified: true, isPhoneVerified: true });
    deliveryStaff.push(driverId);
  }

  for (let i = 1; i <= 20; i++) {
    const custId = randomUUID();
    usersToCreate.push({ id: custId, email: `guest${i}@test.com`, firstName: `Guest`, lastName: `${i}`, phone: `+9198000${i.toString().padStart(5, '0')}`, role: Role.CUSTOMER, otpEnabled: false, passwordHash: bcrypt.hashSync('Customer@123', salt), organizationId: null, isEmailVerified: true, isPhoneVerified: true });
    customers.push(custId);
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
