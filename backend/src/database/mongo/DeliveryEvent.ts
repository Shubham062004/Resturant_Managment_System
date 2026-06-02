import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryEvent extends Document {
  orderId: string;
  driverId?: string;
  eventType: string; // e.g., 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'LOCATION_UPDATE', 'FAILED'
  metadata?: Record<string, any>;
  timestamp: Date;
}

const DeliveryEventSchema: Schema = new Schema({
  orderId: { type: String, required: true, index: true },
  driverId: { type: String, index: true },
  eventType: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true },
});

export const DeliveryEvent = mongoose.model<IDeliveryEvent>('DeliveryEvent', DeliveryEventSchema);
