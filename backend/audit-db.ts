import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function audit() {
  const models = [
    'order', 'orderItem', 'payment', 'user', 'branch', 'attendanceLog',
    'inventoryRequest', 'ingredient', 'stockMovement', 'supplier',
    'purchaseOrder', 'salaryRevision', 'payrollRecord', 'auditLog', 'employeeTimeline'
  ];

  console.log('--- DATABASE AUDIT REPORT ---');
  for (const model of models) {
    try {
      // @ts-ignore
      const count = await prisma[model].count();
      console.log(`${model.padEnd(20)}: ${count} records`);
    } catch (e: any) {
      console.log(`${model.padEnd(20)}: Error (${e.message.split('\n')[0]})`);
    }
  }

  // Check date ranges for orders
  const firstOrder = await prisma.order.findFirst({ orderBy: { createdAt: 'asc' } });
  const lastOrder = await prisma.order.findFirst({ orderBy: { createdAt: 'desc' } });
  
  console.log('\n--- DATE RANGE (Orders) ---');
  console.log(`First Order: ${firstOrder ? firstOrder.createdAt : 'N/A'}`);
  console.log(`Last Order:  ${lastOrder ? lastOrder.createdAt : 'N/A'}`);

  await prisma.$disconnect();
}

audit();
