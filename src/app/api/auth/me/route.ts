import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { User } from '@/server/models/User';
import { getSessionFromRequest } from '@/server/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);

    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, user: null, error: 'Unauthenticated' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        { success: false, user: null, error: 'User not found' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, user: null, error: error.message || 'Session verification failed' },
      { status: 500 }
    );
  }
}
