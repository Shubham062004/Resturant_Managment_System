import fs from 'fs';
import path from 'path';

import { prisma } from '../config/db';
import { NotificationLog } from '../database/mongo/NotificationLog';

export const processEmailJob = async (jobData: any) => {
  const { notificationId, to, subject, body, userId, eventType } = jobData;
  try {
    console.log(`[EMAIL WORKER] Sending email to ${to} | Subject: ${subject}`);

    // Spool email to local file inside backend/uploads/outbox/
    const outboxDir = path.join(__dirname, '../../uploads/outbox');
    if (!fs.existsSync(outboxDir)) {
      fs.mkdirSync(outboxDir, { recursive: true });
    }
    const filename = `email_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.json`;
    fs.writeFileSync(
      path.join(outboxDir, filename),
      JSON.stringify({ to, subject, body, sentAt: new Date().toISOString() }, null, 2),
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
      channel: 'EMAIL',
      eventType: eventType || 'SYSTEM',
      payload: { to, subject },
      status: 'DELIVERED',
      providerResponse: { id: 'mock-msg-id-123' },
    });
  } catch (error: any) {
    console.error(`[EMAIL WORKER] Failed to send email to ${to}:`, error);
    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'FAILED' },
      });
    }
    await NotificationLog.create({
      notificationId: notificationId || 'system-alert',
      userId: userId || 'system',
      channel: 'EMAIL',
      eventType: eventType || 'SYSTEM',
      payload: { to, subject },
      status: 'FAILED',
      error: error.message,
    });
  }
};
