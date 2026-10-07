import mongoose, { Schema, Document, Model } from 'mongoose';

export interface CartDocument extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: {
    productId: mongoose.Types.ObjectId;
    variantSku: string;
    quantity: number;
  }[];
  couponCode?: string;
  updatedAt: Date;
}

const CartSchema = new Schema<CartDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
    sessionId: { type: String, sparse: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        variantSku: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
      },
    ],
    couponCode: { type: String },
  },
  { timestamps: true }
);

export const Cart: Model<CartDocument> =
  mongoose.models.Cart || mongoose.model<CartDocument>('Cart', CartSchema);
