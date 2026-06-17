import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminNotification extends Document {
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT';
  isRead: boolean;
  branchId?: string;
  createdAt: Date;
}

const AdminNotificationSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['INFO', 'WARNING', 'ALERT'], default: 'INFO' },
    isRead: { type: Boolean, default: false },
    branchId: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: 'admin_notifications',
    timestamps: false,
  }
);

export const AdminNotification =
  mongoose.models.AdminNotification ||
  mongoose.model<IAdminNotification>(
    'AdminNotification',
    AdminNotificationSchema
  );
