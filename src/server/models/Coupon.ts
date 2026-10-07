import mongoose, { Schema, Document, Model } from 'mongoose';

export interface CouponDocument extends Document {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  minimumOrderValue: number;
  maxDiscountCap?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  usageCount: number;
  usageLimit?: number;
}

const CouponSchema = new Schema<CouponDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FLAT_AMOUNT', 'FREE_SHIPPING'],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    minimumOrderValue: { type: Number, default: 0 },
    maxDiscountCap: { type: Number },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    usageLimit: { type: Number },
  },
  { timestamps: true }
);

export const Coupon: Model<CouponDocument> =
  mongoose.models.Coupon || mongoose.model<CouponDocument>('Coupon', CouponSchema);
