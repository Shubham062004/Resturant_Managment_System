import mongoose, { Schema, Document } from 'mongoose';

export interface IKitchenEvent extends Document {
  orderId: string;
  stationId?: string;
  eventType: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const KitchenEventSchema = new Schema<IKitchenEvent>({
  orderId: { type: String, required: true },
  stationId: { type: String },
  eventType: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

export const KitchenEvent =
  mongoose.models.KitchenEvent ||
  mongoose.model<IKitchenEvent>('KitchenEvent', KitchenEventSchema);
