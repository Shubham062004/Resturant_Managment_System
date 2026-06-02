import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import env from './env';
import logger from '../utils/logger';

// Instantiate single Prisma Client instance
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

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
    logger.error('❌ Failed to establish dual-database connection sessions:', error);
    process.exit(1);
  }
};

export const disconnectDatabases = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    await mongoose.disconnect();
    logger.info('🔌 Successfully closed database connections.');
  } catch (error) {
    logger.error('❌ Error closing database connections:', error);
  }
};
