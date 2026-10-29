import mongoose, { Schema, Document, Model } from 'mongoose';

export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'ARCHIVED';

export type CampaignTheme =
  | 'diwali'
  | 'winter'
  | 'new_arrivals'
  | 'men'
  | 'women'
  | 'couple'
  | 'wedding'
  | 'custom';

export interface CampaignDocument extends Document {
  name: string;
  slug: string;
  purpose: 'hero_banner' | 'seasonal' | 'new_arrivals' | 'collection' | 'category';
  theme: CampaignTheme;
  status: CampaignStatus;
  desktopImage: string;
  mobileImage?: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  offerText?: string;
  priority: number;
  startDate?: Date | null;
  endDate?: Date | null;
  aiPrompt?: string;
  aiModel?: string;
  targetSection: string;
  metadata?: {
    fileKey?: string;
    width?: number;
    height?: number;
    sizeBytes?: number;
    format?: string;
    generatedAt?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<CampaignDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    purpose: {
      type: String,
      enum: ['hero_banner', 'seasonal', 'new_arrivals', 'collection', 'category'],
      default: 'hero_banner',
      index: true,
    },
    theme: {
      type: String,
      enum: ['diwali', 'winter', 'new_arrivals', 'men', 'women', 'couple', 'wedding', 'custom'],
      default: 'custom',
      index: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'SCHEDULED', 'ACTIVE', 'EXPIRED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true,
    },
    desktopImage: { type: String, required: true },
    mobileImage: { type: String },
    headline: { type: String },
    subheadline: { type: String },
    ctaText: { type: String, default: 'EXPLORE COLLECTION →' },
    ctaLink: { type: String, default: '/shop' },
    offerText: { type: String },
    priority: { type: Number, default: 0, index: true },
    startDate: { type: Date, default: null, index: true },
    endDate: { type: Date, default: null, index: true },
    aiPrompt: { type: String },
    aiModel: { type: String, default: 'dall-e-3' },
    targetSection: { type: String, default: 'hero', index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

CampaignSchema.index({ status: 1, priority: -1 });
CampaignSchema.index({ status: 1, startDate: 1, endDate: 1 });

export const Campaign: Model<CampaignDocument> =
  mongoose.models.Campaign || mongoose.model<CampaignDocument>('Campaign', CampaignSchema);
