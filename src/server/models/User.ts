import mongoose, { Schema, Document, Model } from 'mongoose';
import { User as IUser } from '@/types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {
  passwordHash: string;
  tokenVersion: number;
  failedLoginAttempts: number;
  lockUntil?: Date;
  mustChangePassword?: boolean;
  fullName: string;
}

const AddressSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    recipientName: { type: String, required: true },
    phone: { type: String, required: true },
    house: { type: String },
    streetAddress: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    addressType: { type: String, enum: ['HOME', 'WORK', 'OTHER'], default: 'HOME' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<UserDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['CUSTOMER', 'STAFF', 'ADMIN'],
      default: 'CUSTOMER',
      index: true,
    },
    defaultShippingAddress: { type: AddressSchema },
    addresses: { type: [AddressSchema], default: [] },
    tokenVersion: { type: Number, default: 0 },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    mustChangePassword: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
UserSchema.virtual('fullName').get(function (this: UserDocument) {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

if (process.env.NODE_ENV !== 'production' && mongoose.models.User) {
  delete (mongoose.models as any).User;
}

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
