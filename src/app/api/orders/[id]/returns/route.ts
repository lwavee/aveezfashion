import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Order } from '@/server/models/Order';
import { ReturnRequest } from '@/server/models/ReturnRequest';
import { getSessionFromRequest } from '@/server/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const identifier = params.id;
    const body = await req.json();
    const { items, type = 'RETURN', reason, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one item to return or exchange.' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please select a reason for your request.' },
        { status: 400 }
      );
    }

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

    // Verify customer ownership
    const isAdmin = session?.role === 'ADMIN' || session?.role === 'STAFF';
    if (!isAdmin) {
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Authentication required to submit return request.' },
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

    // Verify delivery and 7-calendar-day policy window
    if (order.fulfillmentStatus !== 'DELIVERED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only delivered orders are eligible for return or exchange.',
        },
        { status: 400 }
      );
    }

    if (order.updatedAt) {
      const diffMs = Date.now() - new Date(order.updatedAt).getTime();
      const daysSinceDelivery = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      if (daysSinceDelivery > 7) {
        return NextResponse.json(
          {
            success: false,
            error: `Return window expired. Orders must be returned within 7 calendar days of delivery (delivered ${daysSinceDelivery} days ago).`,
          },
          { status: 400 }
        );
      }
    }

    // Prevent duplicate return requests on same order
    const existingReq = await ReturnRequest.findOne({
      orderId: order._id,
      status: { $in: ['PENDING', 'APPROVED', 'PICKUP_SCHEDULED'] },
    });
    if (existingReq) {
      return NextResponse.json(
        {
          success: false,
          error: `A return request (${existingReq.requestId}) is already in progress for this order.`,
        },
        { status: 409 }
      );
    }

    // Calculate refund amount
    const validatedReturnItems = [];
    let calculatedRefundAmount = 0;

    for (const reqItem of items) {
      const matchedOrderItem = (order.items || []).find(
        (oi) => oi.variantSku === reqItem.variantSku
      );

      if (matchedOrderItem) {
        const qty = Math.min(
          matchedOrderItem.quantity,
          Math.max(1, parseInt(reqItem.quantity, 10) || 1)
        );
        const itemTotal = matchedOrderItem.unitPrice * qty;
        calculatedRefundAmount += itemTotal;

        validatedReturnItems.push({
          productId: matchedOrderItem.productId,
          variantSku: matchedOrderItem.variantSku,
          title: matchedOrderItem.title,
          size: matchedOrderItem.size,
          exchangeSize: reqItem.exchangeSize || undefined,
          quantity: qty,
          unitPrice: matchedOrderItem.unitPrice,
        });
      }
    }

    if (validatedReturnItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Selected items could not be matched to this order.' },
        { status: 400 }
      );
    }

    const requestId = `RET-${new Date().getFullYear()}-${Math.floor(
      10000 + Math.random() * 90000
    )}`;

    const returnRequest = await ReturnRequest.create({
      requestId,
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId: order.user || session?.userId || null,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      type: type === 'EXCHANGE' ? 'EXCHANGE' : 'RETURN',
      items: validatedReturnItems,
      reason: reason.trim(),
      notes: notes ? notes.trim() : undefined,
      status: 'PENDING',
      refundStatus: type === 'EXCHANGE' ? 'NOT_APPLICABLE' : 'PENDING',
      refundAmount: type === 'EXCHANGE' ? 0 : calculatedRefundAmount,
    });

    order.returnStatus = 'REQUESTED';
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'RETURN_REQUESTED',
      timestamp: new Date().toISOString(),
      note: `${type === 'EXCHANGE' ? 'Exchange' : 'Return'} request submitted (${requestId}): ${reason}`,
      updatedBy: 'CUSTOMER',
    });
    await order.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Return request submitted successfully.',
        data: {
          requestId: returnRequest.requestId,
          status: returnRequest.status,
          refundAmount: returnRequest.refundAmount,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit return request.' },
      { status: 500 }
    );
  }
}
