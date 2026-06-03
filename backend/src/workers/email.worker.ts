import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { NotificationLog } from '../database/mongo/NotificationLog';
import { prisma } from '../config/db';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const emailWorker = new Worker('emailQueue', async (job) => {
  const { notificationId, to, subject, body: _body } = job.data;
  
  try {
    // 1. Send via Resend/SendGrid (Mocked for now unless API key provided)
    console.log(`[EMAIL WORKER] Sending email to ${to} | Subject: ${subject}`);
    
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500));

    // 2. Update Postgres Notification status
    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'SENT', sentAt: new Date() }
      });
    }

    // 3. Log success to MongoDB
    await NotificationLog.create({
      notificationId: notificationId || 'system-alert',
      userId: job.data.userId || 'system',
      channel: 'EMAIL',
      eventType: job.data.eventType || 'SYSTEM',
      payload: { to, subject },
      status: 'DELIVERED',
      providerResponse: { id: 'mock-msg-id-123' }
    });

  } catch (error: any) {
    console.error(`[EMAIL WORKER] Failed to send email to ${to}:`, error);

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'FAILED' }
      });
    }

    await NotificationLog.create({
      notificationId: notificationId || 'system-alert',
      userId: job.data.userId || 'system',
      channel: 'EMAIL',
      eventType: job.data.eventType || 'SYSTEM',
      payload: { to, subject },
      status: 'FAILED',
      error: error.message
    });

    throw error; // Let BullMQ handle retries
  }
}, { connection: redisConnection });
