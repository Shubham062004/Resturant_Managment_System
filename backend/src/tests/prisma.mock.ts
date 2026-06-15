import { PrismaClient } from '@prisma/client';
import { vi } from 'vitest';
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';

import { prisma } from '../config/db';

vi.mock('../config/db', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
