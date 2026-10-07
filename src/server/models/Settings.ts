import mongoose, { Schema, Document, Model } from 'mongoose';

export interface SettingsDocument extends Document {
  storeName: string;
  supportEmail: string;
  supportPhone?: string;
  currency: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  codEnabled: boolean;
  codFee: number;
  gstPercentage: number;
}

const SettingsSchema = new Schema<SettingsDocument>(
  {
    storeName: { type: String, default: 'AVEEZ FASHION' },
    supportEmail: { type: String, default: 'support@aveezfashion.com' },
    supportPhone: { type: String, default: '+91 98765 43210' },
    currency: { type: String, default: 'INR' },
    freeShippingThreshold: { type: Number, default: 1999 },
    standardShippingFee: { type: Number, default: 99 },
    codEnabled: { type: Boolean, default: true },
    codFee: { type: Number, default: 49 },
    gstPercentage: { type: Number, default: 12 },
  },
  { timestamps: true }
);

export const Settings: Model<SettingsDocument> =
  mongoose.models.Settings || mongoose.model<SettingsDocument>('Settings', SettingsSchema);
