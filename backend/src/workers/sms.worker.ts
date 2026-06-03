import { NotificationLog } from '../database/mongo/NotificationLog';
import { prisma } from '../config/db';

export const processSmsJob = async (jobData: any) => {
  const { notificationId, to, message, channel, userId, eventType } = jobData;
  try {
    console.log(`[SMS WORKER] Sending ${channel || 'SMS'} to ${to} | Message: ${message}`);
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
