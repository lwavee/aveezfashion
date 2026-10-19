import mongoose, { Schema, Document, Model } from 'mongoose';
import { Product as IProduct } from '@/types';

export interface ProductDocument
  extends Omit<IProduct, '_id' | 'category' | 'subCategory' | 'collectionId'>,
    Document {
  category: mongoose.Types.ObjectId;
  subCategory?: mongoose.Types.ObjectId;
  collectionId?: mongoose.Types.ObjectId;
}

const VariantSchema = new Schema(
  {
    sku: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    colorHex: { type: String, default: '#0A0A0A' },
    stock: { type: Number, required: true, min: 0, default: 0 },
    reservedStock: { type: Number, default: 0 },
    barcode: { type: String },
  },
  { _id: false }
);

const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema<ProductDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, index: true },
    description: { type: String, required: true },
    gender: {
      type: String,
      enum: ['MEN', 'WOMEN', 'UNISEX'],
      required: true,
      index: true,
    },
    department: {
      type: String,
      enum: ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'],
      index: true,
    },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection', index: true },
    basePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    productType: {
      type: String,
      enum: ['clothing', 'accessories'],
      default: 'clothing',
      index: true,
    },
    lowStockThreshold: { type: Number, default: 5 },
    images: { type: [ImageSchema], required: true },
    variants: { type: [VariantSchema], required: true },
    attributes: {
      fabric: { type: String },
      fit: { type: String },
      washCare: { type: String },
      origin: { type: String, default: 'Crafted in India' },
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true,
    },
    tags: [{ type: String, index: true }],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isAveezOriginal: { type: Boolean, default: false, index: true },
    matchingColors: [{ type: String }],
    accessoryType: { type: String, index: true },
    isBundle: { type: Boolean, default: false, index: true },
    bundleProductIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    bundleDetails: { type: String },
    stylingTips: { type: String },
    relatedAccessories: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

// Compound indexes for catalog search & filtering
ProductSchema.index({ status: 1, category: 1, basePrice: 1 });
ProductSchema.index({ status: 1, gender: 1, isNewArrival: -1 });
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Product: Model<ProductDocument> =
  mongoose.models.Product || mongoose.model<ProductDocument>('Product', ProductSchema);
