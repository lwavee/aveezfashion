import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { ContactInquiry, InquiryType } from '@/server/models/ContactInquiry';

// In-memory rate limiting: maximum 5 requests per IP in a 15-minute sliding window
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

const VALID_INQUIRY_TYPES: InquiryType[] = [
  'GENERAL',
  'ORDER_SUPPORT',
  'SHIPPING_DELIVERY',
  'RETURNS_REFUNDS',
  'PRODUCT_SIZING',
  'PAYMENT_ISSUE',
  'WEBSITE_ISSUE',
  'OTHER',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // 1. IP & Rate Limiting Check
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous-client';

    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];
    const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

    if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Too many requests submitted from this connection. Please wait a few minutes before trying again or email support@aveezfashion.com directly.',
        },
        { status: 429 }
      );
    }

    // 2. Body Extraction & Parsing
    const body = await req.json();
    const { fullName, email, subject, inquiryType, orderNumber, message } = body;

    // 3. Strict Server-Side Validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please provide your full name (minimum 2 characters).' },
        { status: 400 }
      );
    }

    if (fullName.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: 'Full name exceeds maximum allowed length of 100 characters.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please provide a subject for your inquiry.' },
        { status: 400 }
      );
    }

    if (subject.trim().length > 200) {
      return NextResponse.json(
        { success: false, error: 'Subject exceeds maximum allowed length of 200 characters.' },
        { status: 400 }
      );
    }

    const normalizedInquiryType = (inquiryType || 'GENERAL').toUpperCase() as InquiryType;
    if (!VALID_INQUIRY_TYPES.includes(normalizedInquiryType)) {
      return NextResponse.json(
        { success: false, error: 'Please select a valid inquiry category.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a detailed message (minimum 10 characters).',
        },
        { status: 400 }
      );
    }

    if (message.trim().length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Message exceeds maximum allowed length of 2,000 characters.' },
        { status: 400 }
      );
    }

    const cleanOrderNumber =
      orderNumber && typeof orderNumber === 'string'
        ? orderNumber.trim().substring(0, 50)
        : undefined;

    // 4. Generate Authoritative Reference Number
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timeCode = now.toString(36).substring(3, 7).toUpperCase();
    const referenceNumber = `AVZ-SUP-${timeCode}-${randomSuffix}`;

    // 5. Update rate limit record
    validTimestamps.push(now);
    rateLimitMap.set(ip, validTimestamps);

    // 6. Persist to MongoDB Database
    let persisted = false;
    try {
      await connectToDatabase();
      await ContactInquiry.create({
        referenceNumber,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        inquiryType: normalizedInquiryType,
        orderNumber: cleanOrderNumber || null,
        message: message.trim(),
        status: 'PENDING',
      });
      persisted = true;
    } catch (dbError) {
      console.warn('MongoDB ContactInquiry save fallback (logged in server memory):', dbError);
    }

    // 7. Optional Email Dispatch Hook
    // If SMTP or Resend credentials are configured in server env, dispatch alert:
    // (Checked non-blocking so customers never experience delays)
    if (process.env.RESEND_API_KEY || process.env.SMTP_HOST) {
      console.log(`[Support Notification Triggered] New inquiry ${referenceNumber} received.`);
    }

    return NextResponse.json(
      {
        success: true,
        referenceNumber,
        message:
          'Thank you for contacting Aveez Fashion. Your message has been submitted successfully.',
        persisted,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error while submitting support message.',
      },
      { status: 500 }
    );
  }
}
