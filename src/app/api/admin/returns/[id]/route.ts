import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { ReturnRequest } from '@/server/models/ReturnRequest';
import { Order } from '@/server/models/Order';
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
    const { status, refundStatus, refundAmount, adminNotes } = body;

    await connectToDatabase();

    const returnReq = await ReturnRequest.findById(params.id);
    if (!returnReq) {
      return NextResponse.json(
        { success: false, error: 'Return request not found.' },
        { status: 404 }
      );
    }

    if (status) returnReq.status = status;
    if (refundStatus) returnReq.refundStatus = refundStatus;
    if (typeof refundAmount === 'number') returnReq.refundAmount = refundAmount;
    if (adminNotes !== undefined) returnReq.adminNotes = adminNotes;

    await returnReq.save();

    // Sync with Order
    const order = await Order.findById(returnReq.orderId);
    if (order) {
      if (status === 'APPROVED') {
        order.returnStatus = 'APPROVED';
      } else if (status === 'REJECTED') {
        order.returnStatus = 'REJECTED';
      } else if (status === 'COMPLETED') {
        order.returnStatus = returnReq.type === 'EXCHANGE' ? 'EXCHANGED' : 'REFUNDED';
      }
      await order.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        returnRequest: returnReq,
        message: 'Return request updated successfully.',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update return request.' },
      { status: 500 }
    );
  }
}
