import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSession extends Document {
  userId: string;
  device: string;
  browser: string;
  ip: string;
  loginTime: Date;
  logoutTime?: Date;
  tokenHash: string;
}

const UserSessionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    device: { type: String, required: true },
    browser: { type: String, required: true },
    ip: { type: String, required: true },
    loginTime: { type: Date, default: Date.now },
    logoutTime: { type: Date },
    tokenHash: { type: String, required: true, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

export const UserSession = mongoose.model<IUserSession>(
  'UserSession',
  UserSessionSchema,
  'user_sessions',
);
export default UserSession;
