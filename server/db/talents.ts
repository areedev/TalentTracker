import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the shape of the external link object
interface ExternalLink {
  name: string;
  url: string;
}

// Define the Talent interface extending Mongoose Document
export interface TalentDocument extends Document {
  talentId: string;
  talentUrl: string;
  fullName: string;
  nationality: string;
  location?: string;
  externalLinks: ExternalLink[];
  email?: string;
  note?: string;
  important?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the Talent Schema
const TalentSchema: Schema<TalentDocument> = new Schema(
  {
    talentId: { type: String, required: true, unique: true },
    talentUrl: { type: String, required: true },
    fullName: { type: String, required: true },
    nationality: { type: String, required: true },
    location: { type: String },
    email: { type: String },
    note: { type: String },
    important: { type: Boolean },
    externalLinks: [
      {
        name: { type: String },
        url: { type: String }
      }
    ]
  },
  { timestamps: true }
);

// Create the Talent model
const Talent: Model<TalentDocument> = mongoose.model<TalentDocument>('talent', TalentSchema);

export default Talent;
