import mongoose, { Schema, Document } from 'mongoose';

export interface IKitchenMetric extends Document {
  stationId?: string;
  date: Date;
  avgPreparationTime: number; // in seconds
  completedOrders: number;
  delayedOrders: number;
}

const KitchenMetricSchema = new Schema<IKitchenMetric>({
  stationId: { type: String },
  date: { type: Date, default: Date.now },
  avgPreparationTime: { type: Number, default: 0 },
  completedOrders: { type: Number, default: 0 },
  delayedOrders: { type: Number, default: 0 },
});

export const KitchenMetric =
  mongoose.models.KitchenMetric ||
  mongoose.model<IKitchenMetric>('KitchenMetric', KitchenMetricSchema);
