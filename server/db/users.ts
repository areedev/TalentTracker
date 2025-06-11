import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the User interface extending Mongoose Document
export interface UserDocument extends Document {
  email: string;
  password: string;
  fullName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the User Schema
const UserSchema: Schema<UserDocument> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
  },
  { timestamps: true }
);

// Create the User model
const User: Model<UserDocument> = mongoose.model<UserDocument>('user', UserSchema);

export default User;
