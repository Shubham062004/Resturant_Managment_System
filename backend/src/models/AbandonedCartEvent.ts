import mongoose, { Schema, Document } from 'mongoose';

export interface IAbandonedCartEvent extends Document {
  userId?: string;
  cartId?: string;
  items: unknown[];
  totalValue: number;
  timestamp: Date;
}

const AbandonedCartEventSchema: Schema = new Schema(
  {
    userId: { type: String, required: false, index: true },
    cartId: { type: String, required: false, index: true },
    items: { type: [Schema.Types.Mixed], required: true },
    totalValue: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

export const AbandonedCartEvent =
  mongoose.models.AbandonedCartEvent ||
  mongoose.model<IAbandonedCartEvent>(
    'AbandonedCartEvent',
    AbandonedCartEventSchema,
    'abandoned_cart_events',
  );

export default AbandonedCartEvent;
