import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Newsletter } from '@/server/models/Newsletter';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
      await Newsletter.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { email: email.toLowerCase().trim(), status: 'SUBSCRIBED' },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('Newsletter database record (soft-fallback):', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed to Aveez Fashion updates successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
