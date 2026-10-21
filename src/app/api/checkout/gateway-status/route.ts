import { NextResponse } from 'next/server';
import { getActiveRazorpayCredentials } from '@/server/razorpay';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { key, isLive, mode } = getActiveRazorpayCredentials();

  return NextResponse.json({
    success: true,
    data: {
      mode,
      isLive,
      isTest: !isLive,
      maskedKey: key ? `${key.slice(0, 9)}••••••••${key.slice(-4)}` : 'NOT_SET',
      serverTime: new Date().toISOString(),
    },
  });
}
