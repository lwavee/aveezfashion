import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Order } from '@/server/models/Order';
import { Product } from '@/server/models/Product';
import { getSessionFromRequest } from '@/server/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const identifier = params.id;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Requested by customer prior to dispatch';

    await connectToDatabase();

    let order = null;
    if (identifier.startsWith('AVZ-')) {
      order = await Order.findOne({ orderNumber: identifier });
    } else {
      order = await Order.findById(identifier);
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    // Security check: verify ownership
    const isAdmin = session?.role === 'ADMIN' || session?.role === 'STAFF';
    if (!isAdmin) {
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Authentication required to cancel order.' },
          { status: 401 }
        );
      }

      const isOwner =
        (order.user && String(order.user) === session.userId) ||
        order.customerEmail.toLowerCase() === session.email.toLowerCase();

      if (!isOwner) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You do not own this order.' },
          { status: 403 }
        );
      }
    }

    // Check cancellation eligibility
    const cancellableStatuses = ['UNFULFILLED', 'PROCESSING', 'PENDING_CONFIRMATION'];
    if (!cancellableStatuses.includes(order.fulfillmentStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Order cannot be cancelled because it is already ${order.fulfillmentStatus}.`,
        },
        { status: 400 }
      );
    }

    order.fulfillmentStatus = 'CANCELLED';
    order.orderStatus = 'CANCELLED';
    order.cancellationReason = reason;

    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date().toISOString(),
      note: `Cancelled: ${reason}`,
      updatedBy: isAdmin ? 'ADMIN' : 'CUSTOMER',
    });

    await order.save();

    // Restock items atomically
    for (const item of order.items || []) {
      try {
        await Product.updateOne(
          { _id: item.productId, 'variants.sku': item.variantSku },
          { $inc: { 'variants.$.stock': item.quantity } }
        );
      } catch (e) {
        console.warn('Restock warning:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order has been successfully cancelled and inventory restocked.',
      data: {
        orderNumber: order.orderNumber,
        status: order.fulfillmentStatus,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel order.' },
      { status: 500 }
    );
  }
}
