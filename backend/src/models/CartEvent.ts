import mongoose, { Schema, Document } from 'mongoose';

export interface ICartEvent extends Document {
  userId?: string;
  cartId?: string;
  productId: string;
  variantId?: string;
  action: 'ADD' | 'REMOVE' | 'UPDATE_QUANTITY' | 'CLEAR';
  quantity?: number;
  timestamp: Date;
}

const CartEventSchema: Schema = new Schema(
  {
    userId: { type: String, required: false, index: true },
    cartId: { type: String, required: false, index: true },
    productId: { type: String, required: true },
    variantId: { type: String, required: false },
    action: {
      type: String,
      enum: ['ADD', 'REMOVE', 'UPDATE_QUANTITY', 'CLEAR'],
      required: true,
    },
    quantity: { type: Number, required: false },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const CartEvent = mongoose.model<ICartEvent>('CartEvent', CartEventSchema, 'cart_events');

export default CartEvent;
