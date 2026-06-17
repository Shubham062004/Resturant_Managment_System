import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendationEvent extends Document {
  userId?: string;
  recommendationId?: string;
  productId: string;
  eventType: 'VIEW' | 'CLICK' | 'ADD_TO_CART' | 'PURCHASE' | 'DISMISS';
  source: 'HOME' | 'CART' | 'CHECKOUT' | 'ASSISTANT';
  timestamp: Date;
  metadata?: Record<string, any>;
}

const RecommendationEventSchema = new Schema<IRecommendationEvent>({
  userId: { type: String, index: true },
  recommendationId: { type: String, index: true },
  productId: { type: String, required: true },
  eventType: {
    type: String,
    enum: ['VIEW', 'CLICK', 'ADD_TO_CART', 'PURCHASE', 'DISMISS'],
    required: true,
  },
  source: {
    type: String,
    enum: ['HOME', 'CART', 'CHECKOUT', 'ASSISTANT'],
    required: true,
  },
  timestamp: { type: Date, default: Date.now, index: true },
  metadata: { type: Schema.Types.Mixed },
});

export const RecommendationEvent =
  mongoose.models.RecommendationEvent ||
  mongoose.model<IRecommendationEvent>(
    'RecommendationEvent',
    RecommendationEventSchema
  );
