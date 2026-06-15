import { faker } from '@faker-js/faker';
import { PrismaClient, Role, OrderType, OrderStatus, PurchaseOrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

const START_DATE = new Date('2025-07-01T00:00:00.000Z');
const END_DATE = new Date('2026-06-30T23:59:59.000Z');

async function main() {
  console.log('🚀 Starting MASSIVE ERP History Generation (10k+ Records)...');

  const branches = await prisma.branch.findMany();
  const staff = await prisma.user.findMany({
    where: {
      role: { in: [Role.BRANCH_MANAGER, Role.CASHIER, Role.HEAD_CHEF, Role.KITCHEN_STAFF, Role.DELIVERY_PARTNER] },
    },
  });
  const customers = await prisma.user.findMany({ where: { role: Role.CUSTOMER } });
  const ingredients = await prisma.ingredient.findMany();
  
  if (staff.length === 0 || branches.length === 0 || customers.length === 0) {
    console.error('No staff, customers, or branches found. Please run the foundational seeder first.');
    return;
  }

  // Generate Suppliers if not enough
  let suppliers = await prisma.supplier.findMany();
  if (suppliers.length < 50) {
    const supplierInserts = Array.from({ length: 50 }).map(() => ({
      name: faker.company.name() + ' Supplies',
      contactPerson: faker.person.fullName(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      rating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
    }));
    await prisma.supplier.createMany({ data: supplierInserts });
    suppliers = await prisma.supplier.findMany();
  }

  console.log(`Found ${staff.length} Staff, ${customers.length} Customers, ${branches.length} Branches.`);
  console.log('⏳ Simulating 365 days of operations. This will take a moment...');

  const attendanceInserts: any[] = [];
  const orderInserts: any[] = [];
  const auditInserts: any[] = [];
  const payrollInserts: any[] = [];
  const inventoryRequestInserts: any[] = [];
  const purchaseOrderInserts: any[] = [];
  const stockMovementInserts: any[] = [];

  let currentDate = new Date(START_DATE);

  while (currentDate <= END_DATE) {
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

    // 1. Attendance & Audit
    for (const employee of staff) {
      const branch = faker.helpers.arrayElement(branches);
      const isAbsent = faker.number.int({ min: 1, max: 100 }) <= (isWeekend ? 10 : 3);
      
      if (!isAbsent) {
        const checkIn = new Date(currentDate);
        checkIn.setHours(faker.number.int({ min: 8, max: 10 }), faker.number.int({ min: 0, max: 59 }));
        const checkOut = new Date(currentDate);
        checkOut.setHours(faker.number.int({ min: 17, max: 20 }), faker.number.int({ min: 0, max: 59 }));
        const workingHours = (checkOut.getTime() - checkIn.getTime()) / 3600000;

        attendanceInserts.push({
          userId: employee.id, branchId: branch.id, date: currentDate, checkIn, checkOut,
          workingHours: parseFloat(workingHours.toFixed(2)), isLate: checkIn.getHours() >= 10,
          overtime: workingHours > 9 ? parseFloat((workingHours - 9).toFixed(2)) : 0, status: 'PRESENT',
        });

        if (faker.number.int({ min: 1, max: 100 }) <= 2) {
          auditInserts.push({
            userId: employee.id, role: employee.role, action: 'LOGIN',
            entity: 'System', timestamp: checkIn, ipAddress: faker.internet.ipv4()
          });
        }
      }
    }

    // 2. Orders (30-40 orders per day to hit 10k+)
    const ordersToday = faker.number.int({ min: 25, max: 40 });
    for (let i = 0; i < ordersToday; i++) {
      const orderTime = new Date(currentDate);
      orderTime.setHours(faker.number.int({ min: 10, max: 23 }), faker.number.int({ min: 0, max: 59 }));
      
      const subtotal = faker.number.float({ min: 100, max: 2000 });
      orderInserts.push({
        branchId: faker.helpers.arrayElement(branches).id,
        userId: faker.helpers.arrayElement(customers).id,
        orderType: faker.helpers.arrayElement([OrderType.DINE_IN, OrderType.DELIVERY, OrderType.PICKUP]),
        status: OrderStatus.DELIVERED,
        subtotal: subtotal,
        tax: subtotal * 0.05,
        totalAmount: subtotal * 1.05,
        createdAt: orderTime,
        updatedAt: orderTime,
      });
    }

    // 3. Inventory Requests & Purchase Orders (Randomly 1-2 per day)
    if (faker.number.int({ min: 1, max: 100 }) <= 50) {
      const branch = faker.helpers.arrayElement(branches);
      const supplier = faker.helpers.arrayElement(suppliers);
      
      inventoryRequestInserts.push({
        branchId: branch.id,
        status: 'APPROVED',
        requestedById: faker.helpers.arrayElement(staff).id,
        createdAt: currentDate,
        updatedAt: currentDate,
      });

      purchaseOrderInserts.push({
        supplierId: supplier.id,
        branchId: branch.id,
        totalAmount: faker.number.float({ min: 500, max: 5000 }),
        status: PurchaseOrderStatus.RECEIVED,
        orderedAt: currentDate,
        receivedAt: currentDate,
        createdAt: currentDate,
        updatedAt: currentDate,
      });

      if (ingredients.length > 0) {
        stockMovementInserts.push({
          ingredientId: faker.helpers.arrayElement(ingredients).id,
          branchId: branch.id,
          type: 'PURCHASE',
          quantity: faker.number.float({ min: 10, max: 100 }),
          notes: 'RESTOCK',
          createdAt: currentDate
        });
      }
    }

    // 4. Payroll (End of Month)
    if (currentDate.getDate() === 28) { // run payroll near end of month
      for (const employee of staff) {
        const base = faker.number.float({ min: 2000, max: 5000 });
        payrollInserts.push({
          userId: employee.id,
          baseSalary: base,
          bonusPaid: faker.number.float({ min: 0, max: 500 }),
          incentives: faker.number.float({ min: 0, max: 200 }),
          deductions: faker.number.float({ min: 0, max: 100 }),
          netPaid: base, // Simplified for mock
          payrollDate: currentDate,
          status: 'PAID',
          createdAt: currentDate,
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Perform bulk inserts
  const insertInChunks = async (modelName: string, data: any[], chunkSize: number = 5000) => {
    console.log(`Inserting ${data.length} ${modelName}...`);
    for (let i = 0; i < data.length; i += chunkSize) {
      // @ts-ignore
      await prisma[modelName].createMany({ data: data.slice(i, i + chunkSize), skipDuplicates: true });
      process.stdout.write('.');
    }
    console.log(`\n✅ ${modelName} Complete.`);
  };

  await insertInChunks('attendanceLog', attendanceInserts);
  await insertInChunks('order', orderInserts);
  await insertInChunks('payrollRecord', payrollInserts);
  await insertInChunks('auditLog', auditInserts);
  await insertInChunks('inventoryRequest', inventoryRequestInserts);
  await insertInChunks('purchaseOrder', purchaseOrderInserts);
  await insertInChunks('stockMovement', stockMovementInserts);

  console.log('\n🎉 MASSIVE ERP History Seeding Complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
