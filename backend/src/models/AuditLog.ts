import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  payload?: Record<string, any>;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    payload: { type: Schema.Types.Mixed },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema, 'audit_logs');
export default AuditLog;
