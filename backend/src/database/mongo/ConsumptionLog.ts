import mongoose, { Schema, Document } from 'mongoose';

export interface IConsumptionLog extends Document {
  orderId: string;
  branchId: string;
  ingredientId: string;
  quantityConsumed: number;
  timestamp: Date;
}

const ConsumptionLogSchema: Schema = new Schema({
  orderId: { type: String, required: true },
  branchId: { type: String, required: true },
  ingredientId: { type: String, required: true },
  quantityConsumed: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

ConsumptionLogSchema.index({ branchId: 1, ingredientId: 1, timestamp: -1 });

export const ConsumptionLog = mongoose.model<IConsumptionLog>(
  'ConsumptionLog',
  ConsumptionLogSchema,
);
