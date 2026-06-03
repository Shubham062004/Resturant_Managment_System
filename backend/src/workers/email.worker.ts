import { NotificationLog } from '../database/mongo/NotificationLog';
import { prisma } from '../config/db';

export const processEmailJob = async (jobData: any) => {
  const { notificationId, to, subject, body: _body, userId, eventType } = jobData;
  try {
    console.log(`[EMAIL WORKER] Sending email to ${to} | Subject: ${subject}`);
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
