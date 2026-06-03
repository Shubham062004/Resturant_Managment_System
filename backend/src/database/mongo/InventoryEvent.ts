import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryEvent extends Document {
  ingredientId: string;
  branchId: string;
  eventType: string;
  previousQuantity: number;
  newQuantity: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const InventoryEventSchema: Schema = new Schema({
  ingredientId: { type: String, required: true },
  branchId: { type: String, required: true },
  eventType: { type: String, required: true },
  previousQuantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

InventoryEventSchema.index({ ingredientId: 1, branchId: 1, createdAt: -1 });
InventoryEventSchema.index({ eventType: 1, createdAt: -1 });

export const InventoryEvent = mongoose.model<IInventoryEvent>(
  'InventoryEvent',
  InventoryEventSchema,
);
