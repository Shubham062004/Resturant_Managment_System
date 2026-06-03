import { processEmailJob } from './email.worker';
import { processSmsJob } from './sms.worker';

// Following architectural rules: Redis is not mandatory. 
// We fallback to in-memory async processing to decouple request threads from notification dispatching.

export async function addNotificationJob(channel: string, payload: any, delay?: number) {
  setTimeout(() => {
    switch (channel) {
      case 'EMAIL':
        processEmailJob(payload);
        break;
      case 'SMS':
      case 'WHATSAPP':
        processSmsJob({ ...payload, channel });
        break;
      case 'PUSH':
        console.log('[PUSH WORKER] Mocking push notification:', payload);
        break;
      default:
        console.error(`Unknown channel: ${channel}`);
    }
  }, delay || 0);
}
