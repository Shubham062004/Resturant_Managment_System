import mongoose, { Document, Schema } from 'mongoose';

export interface IPredictionLog extends Document {
  predictionType: 'DEMAND' | 'INVENTORY' | 'PEAK_HOURS' | 'REVENUE';
  targetDate: Date;
  predictionValue: number | Record<string, any>;
  confidence: number;
  actualValue?: number | Record<string, any>;
  modelUsed: string;
  generatedAt: Date;
}

const PredictionLogSchema = new Schema<IPredictionLog>({
  predictionType: {
    type: String,
    required: true,
    enum: ['DEMAND', 'INVENTORY', 'PEAK_HOURS', 'REVENUE'],
  },
  targetDate: { type: Date, required: true, index: true },
  predictionValue: { type: Schema.Types.Mixed, required: true },
  confidence: { type: Number, required: true },
  actualValue: { type: Schema.Types.Mixed },
  modelUsed: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
});

export const PredictionLog =
  mongoose.models.PredictionLog ||
  mongoose.model<IPredictionLog>('PredictionLog', PredictionLogSchema);
