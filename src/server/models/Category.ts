import mongoose, { Schema, Document, Model } from 'mongoose';
import { Category as ICategory } from '@/types';

export interface CategoryDocument
  extends Omit<ICategory, '_id' | 'parentCategory'>,
    Document {
  parentCategory?: mongoose.Types.ObjectId | null;
}

const CategorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    departments: {
      type: [String],
      enum: ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'],
      default: ['UNISEX'],
      index: true,
    },
    group: { type: String, trim: true, default: 'General', index: true },
    image: { type: String },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

CategorySchema.index({ isActive: 1, displayOrder: 1 });
CategorySchema.index({ departments: 1, isActive: 1 });

export const Category: Model<CategoryDocument> =
  mongoose.models.Category || mongoose.model<CategoryDocument>('Category', CategorySchema);
