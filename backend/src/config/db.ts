import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';

import logger from '../utils/logger';

import env from './env';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

export const connectDatabases = async (): Promise<void> => {
  try {
    // 1. Verify PostgreSQL Database Connection
    logger.info('Connecting to PostgreSQL database...');
    await prisma.$connect();
    logger.info('✅ PostgreSQL database connected successfully.');

    // 2. Connect MongoDB Database
    logger.info('Connecting to MongoDB database...');
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI);
    logger.info('✅ MongoDB database connected successfully.');
  } catch (error) {
    logger.error(
      error,
      '❌ Failed to establish dual-database connection sessions:'
    );
    process.exit(1);
  }
};

export const disconnectDatabases = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    await mongoose.disconnect();
    logger.info('🔌 Successfully closed database connections.');
  } catch (error) {
    logger.error(error, '❌ Error closing database connections:');
  }
};
