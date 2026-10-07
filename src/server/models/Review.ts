import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ReviewDocument extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  rating: number;
  headline: string;
  body: string;
  fitFeedback?: 'RUNS_SMALL' | 'TRUE_TO_SIZE' | 'RUNS_LARGE';
  isVerifiedBuyer: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const ReviewSchema = new Schema<ReviewDocument>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    headline: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    fitFeedback: {
      type: String,
      enum: ['RUNS_SMALL', 'TRUE_TO_SIZE', 'RUNS_LARGE'],
    },
    isVerifiedBuyer: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
      index: true,
    },
  },
  { timestamps: true }
);

export const Review: Model<ReviewDocument> =
  mongoose.models.Review || mongoose.model<ReviewDocument>('Review', ReviewSchema);
