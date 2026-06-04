import { PrismaClient, TableStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

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
        deviceInfo: JSON.stringify({ os: 'iOS', type: 'iPad' }),
      });
    }

    // 10 Tables per branch
    for (let i = 1; i <= 10; i++) {
      tables.push({
        id: randomUUID(),
        branchId: branch.id,
        number: i.toString(),
        capacity: i % 2 === 0 ? 4 : 2,
        status: TableStatus.AVAILABLE
      });
    }
  }

  await prisma.pOSTerminal.createMany({ data: terminals });
  await prisma.table.createMany({ data: tables });

  return { terminals, tables };
}
