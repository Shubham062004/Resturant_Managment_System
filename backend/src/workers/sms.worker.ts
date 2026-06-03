import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { NotificationLog } from '../database/mongo/NotificationLog';
import { prisma } from '../config/db';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const smsWorker = new Worker(
  'smsQueue',
  async (job) => {
    const { notificationId, to, message, channel } = job.data;

    try {
      console.log(`[SMS WORKER] Sending ${channel} to ${to} | Message: ${message}`);

      // Simulate network delay
      await new Promise((res) => setTimeout(res, 500));

      if (notificationId) {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { status: 'SENT', sentAt: new Date() },
        });
      }

      await NotificationLog.create({
        notificationId: notificationId || 'system-alert',
        userId: job.data.userId || 'system',
        channel: channel || 'SMS',
        eventType: job.data.eventType || 'SYSTEM',
        payload: { to, message },
        status: 'DELIVERED',
        providerResponse: { id: 'mock-sms-id-456' },
      });
    } catch (error: any) {
      console.error(`[SMS WORKER] Failed to send to ${to}:`, error);

      if (notificationId) {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { status: 'FAILED' },
        });
      }

      await NotificationLog.create({
        notificationId: notificationId || 'system-alert',
        userId: job.data.userId || 'system',
        channel: channel || 'SMS',
        eventType: job.data.eventType || 'SYSTEM',
        payload: { to, message },
        status: 'FAILED',
        error: error.message,
      });

      throw error;
    }
  },
  { connection: redisConnection },
);
