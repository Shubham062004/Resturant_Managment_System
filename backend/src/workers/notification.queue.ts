import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const emailQueue = new Queue('emailQueue', { connection: redisConnection });
export const smsQueue = new Queue('smsQueue', { connection: redisConnection });
export const pushQueue = new Queue('pushQueue', { connection: redisConnection });

export async function addNotificationJob(channel: string, payload: any, delay?: number) {
  const options = delay ? { delay } : {};
  
  switch (channel) {
    case 'EMAIL':
      return await emailQueue.add('send-email', payload, options);
    case 'SMS':
    case 'WHATSAPP':
      return await smsQueue.add('send-sms', { ...payload, channel }, options);
    case 'PUSH':
      return await pushQueue.add('send-push', payload, options);
    default:
      console.error(`Unknown channel: ${channel}`);
  }
}
