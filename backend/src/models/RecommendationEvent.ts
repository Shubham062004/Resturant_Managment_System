import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendationEvent extends Document {
  userId?: string;
  productId: string;
  recommendedProductId: string;
  eventType: 'IMPRESSION' | 'CLICK';
  timestamp: Date;
}

const RecommendationEventSchema: Schema = new Schema(
  {
    userId: { type: String, required: false, index: true },
    productId: { type: String, required: true, index: true },
    recommendedProductId: { type: String, required: true, index: true },
    eventType: { type: String, enum: ['IMPRESSION', 'CLICK'], required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

export const RecommendationEvent = mongoose.models.RecommendationEvent || mongoose.model<IRecommendationEvent>(
  'RecommendationEvent',
  RecommendationEventSchema,
  'recommendation_events',
);

export default RecommendationEvent;
