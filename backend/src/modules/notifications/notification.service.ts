import { prisma } from '../../config/db';
import { addNotificationJob } from '../../workers/notification.queue';
import { getIO } from '../../config/socket';

interface SendNotificationArgs {
  userId: string;
  type: string;
  title: string;
  message: string;
  channels: ('EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH' | 'IN_APP')[];
  priority?: 'HIGH' | 'NORMAL' | 'LOW';
  payload?: any;
}

export class NotificationService {
  public static async send(args: SendNotificationArgs) {
    const { userId, type, title, message, channels, priority = 'NORMAL', payload } = args;

    // 1. Check Preferences
    let prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
    if (!prefs) {
      prefs = await prisma.notificationPreference.create({ data: { userId } });
    }

    const sentChannels: string[] = [];

    for (const channel of channels) {
      // 2. Validate Opt-ins
      if (channel === 'EMAIL' && !prefs.emailEnabled) continue;
      if (channel === 'SMS' && !prefs.smsEnabled) continue;
      if (channel === 'WHATSAPP' && !prefs.whatsappEnabled) continue;
      if (channel === 'PUSH' && !prefs.pushEnabled) continue;

      // 3. Create Notification DB Record
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          channel,
          title,
          message,
          priority,
          status: 'PENDING'
        }
      });

      // 4. Enqueue Job to BullMQ
      if (['EMAIL', 'SMS', 'WHATSAPP', 'PUSH'].includes(channel)) {
        await addNotificationJob(channel, {
          notificationId: notification.id,
          userId,
          eventType: type,
          to: 'user-mock@example.com', // In production: fetch user email/phone
          subject: title,
          body: message,
          message,
          ...payload
        });
      }

      // If IN_APP, we don't need BullMQ, just socket event
      if (channel === 'IN_APP') {
        const updated = await prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'DELIVERED', sentAt: new Date() }
        });
        
        // Emit to user's personal room
        try {
          const io = getIO();
          if (io) {
            io.to(`user_${userId}`).emit('notification-created', updated);
          }
        } catch (err) {
          console.error("Socket error", err);
        }
      }

      sentChannels.push(channel);
    }

    return sentChannels;
  }
}
