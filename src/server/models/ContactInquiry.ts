import mongoose, { Schema, Document, Model } from 'mongoose';

export type InquiryType =
  | 'GENERAL'
  | 'ORDER_SUPPORT'
  | 'SHIPPING_DELIVERY'
  | 'RETURNS_REFUNDS'
  | 'PRODUCT_SIZING'
  | 'PAYMENT_ISSUE'
  | 'WEBSITE_ISSUE'
  | 'OTHER';

export interface ContactInquiryDocument extends Document {
  referenceNumber: string;
  fullName: string;
  email: string;
  subject: string;
  inquiryType: InquiryType;
  orderNumber?: string;
  message: string;
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
}

const ContactInquirySchema = new Schema<ContactInquiryDocument>(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    inquiryType: {
      type: String,
      enum: [
        'GENERAL',
        'ORDER_SUPPORT',
        'SHIPPING_DELIVERY',
        'RETURNS_REFUNDS',
        'PRODUCT_SIZING',
        'PAYMENT_ISSUE',
        'WEBSITE_ISSUE',
        'OTHER',
      ],
      default: 'GENERAL',
      index: true,
    },
    orderNumber: {
      type: String,
      trim: true,
      maxlength: 50,
      default: null,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_REVIEW', 'RESOLVED'],
      default: 'PENDING',
      index: true,
    },
  },
  { timestamps: true }
);

ContactInquirySchema.index({ createdAt: -1 });

export const ContactInquiry: Model<ContactInquiryDocument> =
  mongoose.models.ContactInquiry ||
  mongoose.model<ContactInquiryDocument>('ContactInquiry', ContactInquirySchema);
