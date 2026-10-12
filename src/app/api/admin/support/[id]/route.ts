import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { ContactInquiry } from '@/server/models/ContactInquiry';
import { getSessionFromRequest } from '@/server/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!['PENDING', 'IN_REVIEW', 'RESOLVED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const inquiry = await ContactInquiry.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { inquiry, message: 'Status updated successfully.' },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update inquiry.' },
      { status: 500 }
    );
  }
}
