import mongoose, { Document, Schema } from 'mongoose';

export interface IChatLog extends Document {
  sessionId: string;
  userId?: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
  resolved: boolean;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatLogSchema = new Schema<IChatLog>({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, index: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  resolved: { type: Boolean, default: false },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ChatLogSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const ChatLog = mongoose.models.ChatLog || mongoose.model<IChatLog>('ChatLog', ChatLogSchema);
