import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationLog extends Document {
  notificationId: string;
  userId: string;
  channel: string;
  eventType: string;
  payload: any;
  status: string; // DELIVERED, FAILED, OPENED, CLICKED
  providerResponse?: any;
  error?: string;
  createdAt: Date;
}

const NotificationLogSchema: Schema = new Schema({
  notificationId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  channel: { type: String, required: true },
  eventType: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  status: { type: String, required: true, default: 'DELIVERED' },
  providerResponse: { type: Schema.Types.Mixed },
  error: { type: String },
  createdAt: { type: Date, default: Date.now, expires: '90d' }, // Auto-delete logs after 90 days
});

export const NotificationLog = mongoose.model<INotificationLog>(
  'NotificationLog',
  NotificationLogSchema,
);
