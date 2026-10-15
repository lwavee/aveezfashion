import { connectToDatabase } from './db/connect';
import { Coupon } from './models/Coupon';

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discount: number;
  discountType: 'PERCENTAGE' | 'FLAT_AMOUNT' | 'FREE_SHIPPING';
  message: string;
}

export async function validateCouponServer(
  couponCode: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const cleanCode = (couponCode || '').trim().toUpperCase();

  if (!cleanCode) {
    return {
      valid: false,
      code: '',
      discount: 0,
      discountType: 'FLAT_AMOUNT',
      message: 'Please enter a promo code.',
    };
  }

  // 1. Check MongoDB Coupon collection first
  try {
    await connectToDatabase();
    const now = new Date();
    const dbCoupon = await Coupon.findOne({
      code: cleanCode,
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).lean();

    if (dbCoupon) {
      if (dbCoupon.usageLimit && dbCoupon.usageCount >= dbCoupon.usageLimit) {
        return {
          valid: false,
          code: cleanCode,
          discount: 0,
          discountType: dbCoupon.discountType,
          message: 'This promo code has reached its maximum usage limit.',
        };
      }

      if (subtotal < (dbCoupon.minimumOrderValue || 0)) {
        return {
          valid: false,
          code: cleanCode,
          discount: 0,
          discountType: dbCoupon.discountType,
          message: `Minimum order value of ₹${dbCoupon.minimumOrderValue.toLocaleString('en-IN')} required for this code.`,
        };
      }

      let discount = 0;
      if (dbCoupon.discountType === 'PERCENTAGE') {
        discount = Math.round((subtotal * dbCoupon.discountValue) / 100);
        if (dbCoupon.maxDiscountCap && discount > dbCoupon.maxDiscountCap) {
          discount = dbCoupon.maxDiscountCap;
        }
      } else if (dbCoupon.discountType === 'FLAT_AMOUNT') {
        discount = Math.min(dbCoupon.discountValue, subtotal);
      } else if (dbCoupon.discountType === 'FREE_SHIPPING') {
        discount = 99; // Standard shipping fee waived
      }

      return {
        valid: true,
        code: dbCoupon.code,
        discount,
        discountType: dbCoupon.discountType,
        message: dbCoupon.description || `Coupon ${dbCoupon.code} applied successfully!`,
      };
    }
  } catch (err) {
    // MongoDB fallback to standard brand promotions
  }

  // 2. Standard brand promotion codes
  if (cleanCode === 'AVEEZ10') {
    const discount = Math.round(subtotal * 0.1);
    return {
      valid: true,
      code: 'AVEEZ10',
      discount,
      discountType: 'PERCENTAGE',
      message: '10% Welcome Discount applied!',
    };
  }

  if (cleanCode === 'FIRST500') {
    if (subtotal < 2999) {
      return {
        valid: false,
        code: 'FIRST500',
        discount: 0,
        discountType: 'FLAT_AMOUNT',
        message: 'FIRST500 requires a minimum order value of ₹2,999.',
      };
    }
    return {
      valid: true,
      code: 'FIRST500',
      discount: 500,
      discountType: 'FLAT_AMOUNT',
      message: '₹500 Launch Discount applied!',
    };
  }

  return {
    valid: false,
    code: cleanCode,
    discount: 0,
    discountType: 'FLAT_AMOUNT',
    message: 'Invalid promo code. Please check and try again.',
  };
}
