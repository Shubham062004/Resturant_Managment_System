import { NotificationLog } from '../database/mongo/NotificationLog';
import { prisma } from '../config/db';
import fs from 'fs';
import path from 'path';

export const processSmsJob = async (jobData: any) => {
  const { notificationId, to, message, channel, userId, eventType } = jobData;
  try {
    console.log(`[SMS WORKER] Sending ${channel || 'SMS'} to ${to} | Message: ${message}`);

    // Spool SMS/WhatsApp to local file inside backend/uploads/outbox/
    const outboxDir = path.join(__dirname, '../../uploads/outbox');
    if (!fs.existsSync(outboxDir)) {
      fs.mkdirSync(outboxDir, { recursive: true });
    }
    const filename = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.json`;
    fs.writeFileSync(
      path.join(outboxDir, filename),
      JSON.stringify(
        { to, message, channel: channel || 'SMS', sentAt: new Date().toISOString() },
        null,
        2,
      ),
    );

    await new Promise((res) => setTimeout(res, 500));

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'SENT', sentAt: new Date() },
      });
    }

    await NotificationLog.create({
      notificationId: notificationId || 'system-alert',
      userId: userId || 'system',
      channel: channel || 'SMS',
      eventType: eventType || 'SYSTEM',
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
      userId: userId || 'system',
      channel: channel || 'SMS',
      eventType: eventType || 'SYSTEM',
      payload: { to, message },
      status: 'FAILED',
      error: error.message,
    });
  }
};
