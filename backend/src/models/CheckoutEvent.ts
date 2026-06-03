import mongoose, { Schema, Document } from 'mongoose';

export interface ICheckoutEvent extends Document {
  userId: string;
  orderDraftId?: string;
  step:
    | 'STARTED'
    | 'ADDRESS_SELECTED'
    | 'COUPON_APPLIED'
    | 'PAYMENT_STARTED'
    | 'PAYMENT_COMPLETED'
    | 'PAYMENT_FAILED';
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const CheckoutEventSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    orderDraftId: { type: String, required: false, index: true },
    step: {
      type: String,
      enum: [
        'STARTED',
        'ADDRESS_SELECTED',
        'COUPON_APPLIED',
        'PAYMENT_STARTED',
        'PAYMENT_COMPLETED',
        'PAYMENT_FAILED',
      ],
      required: true,
    },
    metadata: { type: Schema.Types.Mixed, required: false },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

export const CheckoutEvent = mongoose.models.CheckoutEvent || mongoose.model<ICheckoutEvent>(
  'CheckoutEvent',
  CheckoutEventSchema,
  'checkout_events',
);

export default CheckoutEvent;
