import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ReturnRequestDocument extends Document {
  requestId: string;
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  userId?: mongoose.Types.ObjectId | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type: 'RETURN' | 'EXCHANGE';
  items: {
    productId: mongoose.Types.ObjectId;
    variantSku: string;
    title: string;
    size: string;
    exchangeSize?: string;
    quantity: number;
    unitPrice: number;
  }[];
  reason: string;
  notes?: string;
  status:
    | 'PENDING'
    | 'APPROVED'
    | 'PICKUP_SCHEDULED'
    | 'INSPECTED'
    | 'COMPLETED'
    | 'REJECTED';
  refundStatus: 'PENDING' | 'PROCESSED' | 'FAILED' | 'NOT_APPLICABLE';
  refundAmount: number;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String, required: true },
    title: { type: String, required: true },
    size: { type: String, required: true },
    exchangeSize: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const ReturnRequestSchema = new Schema<ReturnRequestDocument>(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    customerPhone: { type: String, required: true },
    type: {
      type: String,
      enum: ['RETURN', 'EXCHANGE'],
      required: true,
      default: 'RETURN',
    },
    items: [ReturnItemSchema],
    reason: { type: String, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: [
        'PENDING',
        'APPROVED',
        'PICKUP_SCHEDULED',
        'INSPECTED',
        'COMPLETED',
        'REJECTED',
      ],
      default: 'PENDING',
      index: true,
    },
    refundStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSED', 'FAILED', 'NOT_APPLICABLE'],
      default: 'PENDING',
    },
    refundAmount: { type: Number, default: 0 },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export const ReturnRequest: Model<ReturnRequestDocument> =
  mongoose.models.ReturnRequest ||
  mongoose.model<ReturnRequestDocument>('ReturnRequest', ReturnRequestSchema);
