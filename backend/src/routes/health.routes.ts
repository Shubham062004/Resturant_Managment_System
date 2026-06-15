import { Router } from 'express';
import mongoose from 'mongoose';

import { prisma } from '../config/db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Ping PostgreSQL
    await prisma.$queryRaw`SELECT 1`;
    // Ping MongoDB
    const isMongoConnected = mongoose.connection.readyState === 1;

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      mongodb: isMongoConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({ status: 'degraded', error: error.message });
  }
});

router.get('/database', async (req, res) => {
  try {
    // Ping PostgreSQL
    await prisma.$queryRaw`SELECT 1`;
    // Ping MongoDB
    if (mongoose.connection.readyState !== 1) throw new Error('MongoDB not connected');

    res.status(200).json({ status: 'OK', postgres: 'connected', mongodb: 'connected' });
  } catch (error: any) {
    res.status(503).json({ status: 'DEGRADED', error: error.message });
  }
});

export default router;
