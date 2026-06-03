import mongoose, { Schema, Document } from 'mongoose';

export interface IPOSActivityLog extends Document {
  terminalId: string;
  cashierId: string;
  action: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const POSActivityLogSchema: Schema = new Schema({
  terminalId: { type: String, required: true },
  cashierId: { type: String, required: true },
  action: { type: String, required: true }, // e.g., 'ADD_ITEM', 'VOID_ITEM', 'APPLY_DISCOUNT', 'OPEN_DRAWER'
  details: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

POSActivityLogSchema.index({ terminalId: 1, timestamp: -1 });
POSActivityLogSchema.index({ cashierId: 1, timestamp: -1 });
POSActivityLogSchema.index({ action: 1 });

export const POSActivityLog = mongoose.model<IPOSActivityLog>(
  'POSActivityLog',
  POSActivityLogSchema,
);
