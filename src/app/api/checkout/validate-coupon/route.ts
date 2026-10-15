import { NextRequest, NextResponse } from 'next/server';
import { validateCouponServer } from '@/server/coupons';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { couponCode, subtotal = 0 } = body;

    const result = await validateCouponServer(couponCode, Number(subtotal) || 0);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to validate coupon.' },
      { status: 500 }
    );
  }
}
