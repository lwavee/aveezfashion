import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { ReturnRequest } from '@/server/models/ReturnRequest';
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
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const query: any = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { requestId: regex },
        { orderNumber: regex },
        { customerEmail: regex },
        { customerName: regex },
      ];
    }

    const total = await ReturnRequest.countDocuments(query);
    const returns = await ReturnRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        returns: returns.map((r) => ({ ...r, id: String(r._id) })),
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
      { success: false, error: error.message || 'Failed to fetch return requests.' },
      { status: 500 }
    );
  }
}
