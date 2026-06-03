import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchAnalytic extends Document {
  query: string;
  userId?: string;
  resultsCount: number;
  timestamp: Date;
}

const SearchAnalyticSchema: Schema = new Schema(
  {
    query: { type: String, required: true, index: true },
    userId: { type: String, required: false, index: true },
    resultsCount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

export const SearchAnalytic = mongoose.models.SearchAnalytic || mongoose.model<ISearchAnalytic>(
  'SearchAnalytic',
  SearchAnalyticSchema,
  'search_analytics',
);

export default SearchAnalytic;
