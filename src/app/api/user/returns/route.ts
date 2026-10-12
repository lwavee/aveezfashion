import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { ReturnRequest } from '@/server/models/ReturnRequest';
import { getSessionFromRequest } from '@/server/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to view your returns.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const returns = await ReturnRequest.find({
      $or: [
        { userId: session.userId },
        { customerEmail: session.email.toLowerCase() },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        returns: returns.map((r) => ({
          ...r,
          id: String(r._id),
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch returns.' },
      { status: 500 }
    );
  }
}
