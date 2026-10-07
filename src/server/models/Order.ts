import mongoose, { Schema, Document, Model } from 'mongoose';
import { Order as IOrder } from '@/types';

export interface OrderDocument extends Omit<IOrder, '_id' | 'user'>, Document {
  user?: mongoose.Types.ObjectId | null;
}

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String, required: true },
    title: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true },
    thumbnailImage: { type: String, required: true },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    recipientName: { type: String, required: true },
    phone: { type: String, required: true },
    streetAddress: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    customerPhone: { type: String, required: true },
    items: [OrderItemSchema],
    shippingAddress: ShippingAddressSchema,
    pricing: {
      subtotal: { type: Number, required: true },
      discountTotal: { type: Number, default: 0 },
      taxTotal: { type: Number, default: 0 },
      shippingFee: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    paymentMethod: {
      type: String,
      enum: ['ONLINE_GATEWAY', 'COD'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: [
        'UNFULFILLED',
        'PROCESSING',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'RETURNED',
      ],
      default: 'UNFULFILLED',
      index: true,
    },
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    courierName: { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

export const Order: Model<OrderDocument> =
  mongoose.models.Order || mongoose.model<OrderDocument>('Order', OrderSchema);
