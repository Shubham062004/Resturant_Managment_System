import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  actionType: string;
  userId: string;
  targetId?: string;
  changes: Record<string, any>;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    actionType: { type: String, required: true },
    userId: { type: String, required: true },
    targetId: { type: String },
    changes: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  {
    collection: 'audit_logs',
    timestamps: false,
  },
);

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
