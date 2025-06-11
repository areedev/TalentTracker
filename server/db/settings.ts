import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the Setting interface extending Mongoose Document
export interface SettingDocument extends Document {
  name: string;
  value: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the Setting Schema
const SettingSchema: Schema<SettingDocument> = new Schema(
  {
    name: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

// Create the Setting model
const Setting: Model<SettingDocument> = mongoose.model<SettingDocument>('setting', SettingSchema);

export default Setting;
