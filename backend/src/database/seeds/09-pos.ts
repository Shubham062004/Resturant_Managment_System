import { randomUUID } from 'crypto';

import { PrismaClient, TableStatus } from '@prisma/client';

export async function seedPOS(prisma: PrismaClient, branches: any[], _cashiers: string[]) {
  console.log('🌱 Seeding POS (Terminals, Tables, Drawers)...');

  const terminals = [];
  const tables = [];

  for (const branch of branches) {
    // 2 Terminals per branch
    for (let i = 1; i <= 2; i++) {
      terminals.push({
        id: randomUUID(),
        branchId: branch.id,
        terminalName: `Terminal ${i} - ${branch.name}`,
      });
    }

    // 10 Tables per branch
    for (let i = 1; i <= 10; i++) {
      // Use branch name prefix to satisfy global unique constraint on Table.number
      const branchPrefix = branch.name.replace(/[^a-zA-Z0-9]/g, '');
      tables.push({
        id: randomUUID(),
        branchId: branch.id,
        number: `${branchPrefix}-T${i}`,
        capacity: i % 2 === 0 ? 4 : 2,
        status: TableStatus.AVAILABLE,
      });
    }
  }

  await prisma.pOSTerminal.deleteMany();
  await prisma.table.deleteMany();
  await prisma.pOSTerminal.createMany({ data: terminals });
  await prisma.table.createMany({ data: tables });

  return { terminals, tables };
}
