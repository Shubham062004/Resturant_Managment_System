import mongoose, { Document, Schema } from 'mongoose';

export interface IAIAnalytics extends Document {
  metricDate: Date;
  recommendationCTR: number;
  recommendationConversion: number;
  chatResolutionRate: number;
  totalTokensUsed: number;
  estimatedCost: number;
  predictionAccuracyScores: Record<string, number>;
  updatedAt: Date;
}

const AIAnalyticsSchema = new Schema<IAIAnalytics>({
  metricDate: { type: Date, required: true, unique: true },
  recommendationCTR: { type: Number, default: 0 },
  recommendationConversion: { type: Number, default: 0 },
  chatResolutionRate: { type: Number, default: 0 },
  totalTokensUsed: { type: Number, default: 0 },
  estimatedCost: { type: Number, default: 0 },
  predictionAccuracyScores: { type: Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now }
});

export const AIAnalytics = mongoose.models.AIAnalytics || mongoose.model<IAIAnalytics>('AIAnalytics', AIAnalyticsSchema);
