import mongoose, { Schema, Document } from 'mongoose';

export interface IForecastingLog extends Document {
  ingredientId: string;
  branchId: string;
  predictedDemand: number;
  confidenceScore: number;
  targetDate: Date;
  modelMetadata: Record<string, any>;
  createdAt: Date;
}

const ForecastingLogSchema: Schema = new Schema({
  ingredientId: { type: String, required: true },
  branchId: { type: String, required: true },
  predictedDemand: { type: Number, required: true },
  confidenceScore: { type: Number, required: true },
  targetDate: { type: Date, required: true },
  modelMetadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

ForecastingLogSchema.index({ ingredientId: 1, branchId: 1, targetDate: 1 });

export const ForecastingLog =
  mongoose.models.ForecastingLog ||
  mongoose.model<IForecastingLog>('ForecastingLog', ForecastingLogSchema);
