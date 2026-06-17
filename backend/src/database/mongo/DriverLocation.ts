import mongoose, { Schema, Document } from 'mongoose';

export interface IDriverLocation extends Document {
  driverId: string;
  orderId?: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

const DriverLocationSchema: Schema = new Schema({
  driverId: { type: String, required: true, index: true },
  orderId: { type: String, index: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  heading: { type: Number },
  speed: { type: Number },
  timestamp: { type: Date, default: Date.now, index: true },
});

export const DriverLocation =
  mongoose.models.DriverLocation ||
  mongoose.model<IDriverLocation>('DriverLocation', DriverLocationSchema);
