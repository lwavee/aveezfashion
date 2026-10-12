import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { ContactInquiry } from '@/server/models/ContactInquiry';
import { getSessionFromRequest } from '@/server/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const query: any = {};
    if (status && status !== 'ALL') query.status = status;
    if (type && type !== 'ALL') query.inquiryType = type;
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { referenceNumber: regex },
        { fullName: regex },
        { email: regex },
        { subject: regex },
        { orderNumber: regex },
      ];
    }

    const total = await ContactInquiry.countDocuments(query);
    const inquiries = await ContactInquiry.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        inquiries: inquiries.map((iq) => ({ ...iq, id: String(iq._id) })),
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customer support inquiries.' },
      { status: 500 }
    );
  }
}
