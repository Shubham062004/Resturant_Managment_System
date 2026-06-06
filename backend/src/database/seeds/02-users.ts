import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function seedUsers(prisma: PrismaClient, orgId: string, branches: any[]) {
  console.log('🌱 Seeding Users (Admin, Staff, Customers)...');
  
  await prisma.user.deleteMany();

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Admin@123', salt);
  
  const usersToCreate: any[] = [];
  
  // Explicit/Standard logins for testing (total 16 logins)
  const explicitUsers = [
    { email: 'customer@ovenxpress.com', role: Role.CUSTOMER, firstName: 'Standard', lastName: 'Customer', phone: '9000000001' },
    { email: 'vipcustomer@ovenxpress.com', role: Role.CUSTOMER, firstName: 'VIP', lastName: 'Customer', phone: '9000000002' },
    { email: 'cashier@ovenxpress.com', role: Role.CASHIER, firstName: 'Main', lastName: 'Cashier', phone: '9000000010', salary: 22000 },
    { email: 'kitchen@ovenxpress.com', role: Role.KITCHEN_STAFF, firstName: 'Line', lastName: 'Cook', phone: '9000000011', salary: 25000, assignedCategory: 'burger' },
    { email: 'chef@ovenxpress.com', role: Role.HEAD_CHEF, firstName: 'Head', lastName: 'Chef', phone: '9000000012', salary: 35000 },
    { email: 'kitchenmanager@ovenxpress.com', role: Role.KITCHEN_MANAGER, firstName: 'Kitchen', lastName: 'Manager', phone: '9000000013', salary: 30000 },
    { email: 'driver@ovenxpress.com', role: Role.DELIVERY_PARTNER, firstName: 'Delivery', lastName: 'Partner', phone: '9000000014', salary: 20000 },
    { email: 'deliverymanager@ovenxpress.com', role: Role.DELIVERY_MANAGER, firstName: 'Delivery', lastName: 'Manager', phone: '9000000015', salary: 28000 },
    { email: 'branchmanager@ovenxpress.com', role: Role.BRANCH_MANAGER, firstName: 'Branch', lastName: 'Manager', phone: '9000000016', salary: 45000 },
    { email: 'operations@ovenxpress.com', role: Role.OPERATIONS_MANAGER, firstName: 'Operations', lastName: 'Manager', phone: '9000000017', salary: 40000 },
    { email: 'finance@ovenxpress.com', role: Role.FINANCE_MANAGER, firstName: 'Finance', lastName: 'Manager', phone: '9000000018', salary: 38000 },
    { email: 'admin@ovenxpress.com', role: Role.ADMIN, firstName: 'System', lastName: 'Admin', phone: '9000000019', salary: 50000 },
    { email: 'franchise@ovenxpress.com', role: Role.FRANCHISE_OWNER, firstName: 'Franchise', lastName: 'Owner', phone: '9000000020', salary: 60000 },
    { email: 'owner@ovenxpress.com', role: Role.ORGANIZATION_OWNER, firstName: 'Organization', lastName: 'Owner', phone: '9000000021' },
    { email: 'superadmin@ovenxpress.com', role: Role.SUPER_ADMIN, firstName: 'Super', lastName: 'Admin', phone: '9000000022' },
    { email: 'inventory@ovenxpress.com', role: Role.INVENTORY_MANAGER, firstName: 'Inventory', lastName: 'Manager', phone: '9000000023', salary: 35000 }
  ];

  for (const u of explicitUsers) {
    usersToCreate.push({
      id: randomUUID(),
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      role: u.role,
      otpEnabled: u.role !== Role.CUSTOMER,
      passwordHash: bcrypt.hashSync(u.role === Role.CUSTOMER ? 'Customer@123' : u.role === Role.CASHIER ? 'Cashier@123' : u.role === Role.KITCHEN_STAFF ? 'Kitchen@123' : u.role === Role.HEAD_CHEF ? 'Chef@123' : u.role === Role.BRANCH_MANAGER ? 'BranchManager@123' : u.role === Role.INVENTORY_MANAGER ? 'Inventory@123' : 'Admin@123', salt),
      organizationId: u.role === Role.SUPER_ADMIN ? null : orgId,
      isEmailVerified: true,
      isPhoneVerified: true,
      salary: u.salary ? u.salary : null,
      attendanceCount: u.salary ? Math.floor(Math.random() * 8) + 20 : 0,
      performanceScore: u.salary ? parseFloat((Math.random() * 1.0 + 4.0).toFixed(1)) : 5.0,
      assignedCategory: u.assignedCategory || null,
    });
  }

  const categories = ['burger', 'pizza', 'dessert', 'noodles', 'paneer'];

  // Add a second explicit inventory manager
  const invMgrId = randomUUID();
  usersToCreate.push({
    id: invMgrId,
    email: 'inventory2@ovenxpress.com',
    firstName: 'Inventory',
    lastName: 'Manager 2',
    phone: '9000000024',
    role: Role.INVENTORY_MANAGER,
    otpEnabled: true,
    passwordHash: bcrypt.hashSync('Inventory@123', salt),
    organizationId: orgId,
    isEmailVerified: true,
    isPhoneVerified: true,
    salary: 35000,
    attendanceCount: 24,
    performanceScore: 4.8,
  });

  // Generate branch-specific staff
  branches.forEach((branch, index) => {
    // 2 Branch Managers per branch (index 0 already has the explicit branchmanager@ovenxpress.com, we add 1 or 2 as needed)
    const mgrCount = index === 0 ? 1 : 2;
    for (let m = 0; m < mgrCount; m++) {
      const id = randomUUID();
      usersToCreate.push({
        id,
        email: `branch${index + 1}.mgr${m + 1}@ovenxpress.com`,
        firstName: `Branch${index + 1}`,
        lastName: `Manager ${m + 1}`,
        phone: `9100000${index}${m}`,
        role: Role.BRANCH_MANAGER,
        otpEnabled: true,
        passwordHash,
        organizationId: orgId,
        isEmailVerified: true,
        isPhoneVerified: true,
        salary: 45000,
        attendanceCount: Math.floor(Math.random() * 6) + 22,
        performanceScore: parseFloat((Math.random() * 0.8 + 4.2).toFixed(1)),
      });
    }

    // 4 Kitchen Staff per branch (20 kitchen staff total, 4 per branch)
    for (let k = 0; k < 4; k++) {
      const id = randomUUID();
      const cat = categories[k % categories.length];
      usersToCreate.push({
        id,
        email: `branch${index + 1}.cook${k + 1}@ovenxpress.com`,
        firstName: `Branch${index + 1} Cook`,
        lastName: `${k + 1}`,
        phone: `9200000${index}${k}`,
        role: Role.KITCHEN_STAFF,
        otpEnabled: true,
        passwordHash,
        organizationId: orgId,
        isEmailVerified: true,
        isPhoneVerified: true,
        salary: 25000,
        attendanceCount: Math.floor(Math.random() * 6) + 20,
        performanceScore: parseFloat((Math.random() * 1.0 + 4.0).toFixed(1)),
        assignedCategory: cat,
      });
    }

    // 4 Delivery Partners per branch (20 delivery partners total, 4 per branch)
    for (let d = 0; d < 4; d++) {
      const id = randomUUID();
      usersToCreate.push({
        id,
        email: `branch${index + 1}.rider${d + 1}@ovenxpress.com`,
        firstName: `Branch${index + 1} Rider`,
        lastName: `${d + 1}`,
        phone: `9300000${index}${d}`,
        role: Role.DELIVERY_PARTNER,
        otpEnabled: true,
        passwordHash,
        organizationId: orgId,
        isEmailVerified: true,
        isPhoneVerified: true,
        salary: 20000,
        attendanceCount: Math.floor(Math.random() * 6) + 20,
        performanceScore: parseFloat((Math.random() * 1.0 + 4.0).toFixed(1)),
      });
    }

    // 1 Cashier per branch
    if (index > 0) {
      const id = randomUUID();
      usersToCreate.push({
        id,
        email: `branch${index + 1}.cashier@ovenxpress.com`,
        firstName: `Branch${index + 1} Cashier`,
        lastName: `1`,
        phone: `9400000${index}1`,
        role: Role.CASHIER,
        otpEnabled: true,
        passwordHash,
        organizationId: orgId,
        isEmailVerified: true,
        isPhoneVerified: true,
        salary: 22000,
        attendanceCount: Math.floor(Math.random() * 6) + 22,
        performanceScore: parseFloat((Math.random() * 0.8 + 4.2).toFixed(1)),
      });
    }
  });

  // Seed customers for orders
  const customers: string[] = [];
  customers.push(usersToCreate.find(u => u.email === 'customer@ovenxpress.com').id);
  customers.push(usersToCreate.find(u => u.email === 'vipcustomer@ovenxpress.com').id);

  for (let i = 1; i <= 40; i++) {
    const custId = randomUUID();
    usersToCreate.push({
      id: custId,
      email: `guest${i}@test.com`,
      firstName: `Guest`,
      lastName: `${i}`,
      phone: `+9198000${i.toString().padStart(5, '0')}`,
      role: Role.CUSTOMER,
      otpEnabled: false,
      passwordHash: bcrypt.hashSync('Customer@123', salt),
      organizationId: null,
      isEmailVerified: true,
      isPhoneVerified: true,
    });
    customers.push(custId);
  }

  // Extract lists for other seeders
  const managers = usersToCreate.filter(u => u.role === Role.BRANCH_MANAGER).map(u => u.id);
  const kitchenStaff = usersToCreate.filter(u => u.role === Role.KITCHEN_STAFF || u.role === Role.HEAD_CHEF).map(u => u.id);
  const deliveryStaff = usersToCreate.filter(u => u.role === Role.DELIVERY_PARTNER).map(u => u.id);
  const cashiers = usersToCreate.filter(u => u.role === Role.CASHIER).map(u => u.id);

  // Batch insert
  const batchSize = 50;
  for (let i = 0; i < usersToCreate.length; i += batchSize) {
    await prisma.user.createMany({
      data: usersToCreate.slice(i, i + batchSize),
    });
  }

  console.log(`✅ Seeded ${usersToCreate.length} users (50+ staff accounts).`);
  return { managers, kitchenStaff, deliveryStaff, cashiers, customers };
}
