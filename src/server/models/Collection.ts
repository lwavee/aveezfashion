import mongoose, { Schema, Document, Model } from 'mongoose';
import { Collection as ICollection } from '@/types';

export interface CollectionDocument
  extends Omit<ICollection, '_id' | 'products' | 'categories'>,
    Document {
  departments?: ('MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES')[];
  categories?: mongoose.Types.ObjectId[];
  products?: mongoose.Types.ObjectId[];
}

const CollectionSchema = new Schema<CollectionDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    tagline: { type: String },
    description: { type: String },
    coverImage: { type: String, required: true },
    featured: { type: Boolean, default: false, index: true },
    departments: {
      type: [String],
      enum: ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'],
      default: ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'],
      index: true,
    },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Collection: Model<CollectionDocument> =
  mongoose.models.Collection || mongoose.model<CollectionDocument>('Collection', CollectionSchema);
