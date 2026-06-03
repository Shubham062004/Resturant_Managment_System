import { Router } from 'express';
import { prisma } from '../config/db';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
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
