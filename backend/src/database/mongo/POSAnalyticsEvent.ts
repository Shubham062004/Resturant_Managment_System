import mongoose, { Schema, Document } from 'mongoose';

export interface IPOSAnalyticsEvent extends Document {
  terminalId: string;
  branchId: string;
  cashierId: string;
  eventType: string; // e.g., 'ORDER_COMPLETED', 'SHIFT_ENDED'
  metrics: {
    durationSecs?: number;
    totalAmount?: number;
    itemCount?: number;
    [key: string]: any;
  };
  timestamp: Date;
}

const POSAnalyticsEventSchema: Schema = new Schema({
  terminalId: { type: String, required: true },
  branchId: { type: String, required: true },
  cashierId: { type: String, required: true },
  eventType: { type: String, required: true },
  metrics: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
});

POSAnalyticsEventSchema.index({ branchId: 1, eventType: 1, timestamp: -1 });
POSAnalyticsEventSchema.index({ terminalId: 1, timestamp: -1 });
POSAnalyticsEventSchema.index({ cashierId: 1, timestamp: -1 });

export const POSAnalyticsEvent = mongoose.model<IPOSAnalyticsEvent>(
  'POSAnalyticsEvent',
  POSAnalyticsEventSchema,
);
