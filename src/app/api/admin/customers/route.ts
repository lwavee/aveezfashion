import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { User } from '@/server/models/User';
import { getSessionFromRequest } from '@/server/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);

    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN' && session.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const customers = await User.find({ role: 'CUSTOMER' })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = customers.map((c: any) => ({
      id: String(c._id),
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Customer',
      email: c.email,
      phone: c.phone || 'N/A',
      role: c.role,
      joinedDate: c.createdAt
        ? new Date(c.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : 'N/A',
    }));

    return NextResponse.json({
      success: true,
      data: {
        customers: formatted,
        totalCount: formatted.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customers.' },
      { status: 500 }
    );
  }
}
