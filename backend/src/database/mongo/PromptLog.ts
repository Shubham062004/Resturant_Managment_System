import mongoose, { Document, Schema } from 'mongoose';

export interface IPromptLog extends Document {
  provider: string; // e.g. GEMINI, OPENAI
  aiModel: string;
  promptType: string; // e.g. RECOMMENDATION, MARKETING, CHAT
  promptText?: string; // Opt-out for privacy
  responseText?: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  status: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
  timestamp: Date;
}

const PromptLogSchema = new Schema<IPromptLog>({
  provider: { type: String, required: true },
  aiModel: { type: String, required: true },
  promptType: { type: String, required: true, index: true },
  promptText: { type: String },
  responseText: { type: String },
  tokenUsage: {
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
  },
  latencyMs: { type: Number, required: true },
  status: { type: String, enum: ['SUCCESS', 'ERROR'], required: true },
  errorMessage: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export const PromptLog =
  mongoose.models.PromptLog || mongoose.model<IPromptLog>('PromptLog', PromptLogSchema);
