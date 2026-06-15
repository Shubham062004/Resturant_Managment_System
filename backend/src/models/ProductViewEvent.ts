import mongoose, { Schema, Document } from 'mongoose';

export interface IProductViewEvent extends Document {
  userId?: string;
  productId: string;
  restaurantId: string;
  timestamp: Date;
}

const ProductViewEventSchema: Schema = new Schema(
  {
    userId: { type: String, required: false, index: true },
    productId: { type: String, required: true, index: true },
    restaurantId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

export const ProductViewEvent =
  mongoose.models.ProductViewEvent ||
  mongoose.model<IProductViewEvent>(
    'ProductViewEvent',
    ProductViewEventSchema,
    'product_view_events',
  );

export default ProductViewEvent;
