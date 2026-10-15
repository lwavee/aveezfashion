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
    house: { type: String },
    streetAddress: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    addressType: { type: String, default: 'HOME' },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
    description: { type: String },
    updatedBy: { type: String, default: 'SYSTEM' },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    idempotencyKey: { type: String, sparse: true, index: true },
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
        'PENDING_CONFIRMATION',
        'CONFIRMED',
        'UNFULFILLED',
        'PROCESSING',
        'PACKED',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'RETURNED',
      ],
      default: 'UNFULFILLED',
      index: true,
    },
    returnStatus: {
      type: String,
      enum: [
        'NONE',
        'REQUESTED',
        'APPROVED',
        'PICKUP_SCHEDULED',
        'INSPECTED',
        'REFUNDED',
        'EXCHANGED',
        'REJECTED',
      ],
      default: 'NONE',
      index: true,
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    cancellationReason: { type: String },
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    courierName: { type: String },
    carrier: { type: String },
    estimatedDelivery: { type: Date },
    gatewayPaymentId: { type: String },
    gatewayOrderId: { type: String },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models.Order) {
  delete (mongoose.models as any).Order;
}

export const Order: Model<OrderDocument> =
  mongoose.models.Order || mongoose.model<OrderDocument>('Order', OrderSchema);
