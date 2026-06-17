import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaignAnalytics extends Document {
  campaignId: string;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  unsubscribed: number;
  lastCalculatedAt: Date;
}

const CampaignAnalyticsSchema: Schema = new Schema({
  campaignId: { type: String, required: true, unique: true },
  totalSent: { type: Number, default: 0 },
  totalDelivered: { type: Number, default: 0 },
  totalOpened: { type: Number, default: 0 },
  totalClicked: { type: Number, default: 0 },
  totalFailed: { type: Number, default: 0 },
  unsubscribed: { type: Number, default: 0 },
  lastCalculatedAt: { type: Date, default: Date.now },
});

export const CampaignAnalytics =
  mongoose.models.CampaignAnalytics ||
  mongoose.model<ICampaignAnalytics>(
    'CampaignAnalytics',
    CampaignAnalyticsSchema
  );
