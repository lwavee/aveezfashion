import mongoose, { Schema, Document, Model } from 'mongoose';

export interface NewsletterDocument extends Document {
  email: string;
  status: 'SUBSCRIBED' | 'UNSUBSCRIBED';
  source?: string;
}

const NewsletterSchema = new Schema<NewsletterDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['SUBSCRIBED', 'UNSUBSCRIBED'],
      default: 'SUBSCRIBED',
    },
    source: { type: String, default: 'FOOTER' },
  },
  { timestamps: true }
);

export const Newsletter: Model<NewsletterDocument> =
  mongoose.models.Newsletter || mongoose.model<NewsletterDocument>('Newsletter', NewsletterSchema);
