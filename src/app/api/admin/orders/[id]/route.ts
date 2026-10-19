import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Order } from '@/server/models/Order';
import { getSessionFromRequest } from '@/server/auth';

export async function GET(
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

    await connectToDatabase();
    const identifier = params.id;
    let order = null;
    if (identifier.startsWith('AVZ-')) {
      order = await Order.findOne({ orderNumber: identifier }).lean();
    } else {
      try {
        order = await Order.findById(identifier).lean();
      } catch {
        order = await Order.findOne({ orderNumber: identifier }).lean();
      }
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order.' },
      { status: 500 }
    );
  }
}

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
    const {
      fulfillmentStatus,
      orderStatus,
      paymentStatus,
      cancellationReason,
      carrier,
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
      statusNote,
    } = body;

    await connectToDatabase();

    const identifier = params.id;
    let order = null;
    if (identifier.startsWith('AVZ-')) {
      order = await Order.findOne({ orderNumber: identifier });
    } else {
      try {
        order = await Order.findById(identifier);
      } catch {
        order = await Order.findOne({ orderNumber: identifier });
      }
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    // --- 1. FULFILLMENT STATUS VALIDATION & TRANSITIONS ---
    if (fulfillmentStatus && fulfillmentStatus !== order.fulfillmentStatus) {
      const current = order.fulfillmentStatus || 'UNFULFILLED';
      const target = fulfillmentStatus;

      // Transition matrix definition
      const ALLOWED_TRANSITIONS: Record<string, string[]> = {
        PENDING: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
        PENDING_CONFIRMATION: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
        UNFULFILLED: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
        CONFIRMED: ['PROCESSING', 'PACKED', 'CANCELLED'],
        PROCESSING: ['PACKED', 'SHIPPED', 'CANCELLED'],
        PACKED: ['SHIPPED', 'CANCELLED'],
        SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED'],
        OUT_FOR_DELIVERY: ['DELIVERED', 'RETURN_REQUESTED', 'RETURNED'],
        DELIVERED: ['RETURN_REQUESTED', 'RETURNED'],
        RETURN_REQUESTED: ['RETURNED', 'REFUNDED'],
        RETURNED: ['REFUNDED'],
        CANCELLED: [],
        REFUNDED: [],
      };

      const allowedNext = ALLOWED_TRANSITIONS[current] || [];
      if (!allowedNext.includes(target)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status transition: Cannot change order from '${current}' to '${target}'. Allowed next statuses: ${allowedNext.length > 0 ? allowedNext.join(', ') : 'None (Terminal State)'}.`,
          },
          { status: 400 }
        );
      }

      // Handle cancellation logic
      if (target === 'CANCELLED') {
        const reason = cancellationReason?.trim() || statusNote?.trim();
        if (!reason) {
          return NextResponse.json(
            {
              success: false,
              error: 'A cancellation reason is required to cancel an order.',
            },
            { status: 400 }
          );
        }

        order.cancellationReason = reason;
        order.cancelledAt = new Date();
        order.cancelledBy = session.email;

        // Idempotent exact-once stock restoration
        if (!order.stockRestored) {
          const { Product } = await import('@/server/models/Product');
          for (const item of order.items || []) {
            try {
              if (item.productId && item.variantSku) {
                await Product.updateOne(
                  { _id: item.productId, 'variants.sku': item.variantSku },
                  { $inc: { 'variants.$.stock': item.quantity } }
                );
              }
            } catch (restockErr) {
              console.warn('Inventory restoration notice:', restockErr);
            }
          }
          order.stockRestored = true;
        }
      }

      const previousStatus = order.fulfillmentStatus;
      order.fulfillmentStatus = target;

      // Status history entry
      const description =
        statusNote?.trim() ||
        (target === 'CANCELLED'
          ? `Order cancelled by ${session.email}. Reason: ${order.cancellationReason}`
          : `Fulfillment updated from ${previousStatus} to ${target} by administrator (${session.email})`);

      if (!order.statusHistory) {
        order.statusHistory = [];
      }
      order.statusHistory.push({
        status: target,
        previousStatus,
        timestamp: new Date(),
        note: statusNote?.trim() || undefined,
        description,
        updatedBy: session.email,
      });
    }

    if (orderStatus && orderStatus !== order.orderStatus) {
      order.orderStatus = orderStatus;
    }

    // --- 2. PAYMENT STATUS VALIDATION ---
    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      if (paymentStatus === 'PAID') {
        if (order.paymentMethod === 'ONLINE_GATEWAY') {
          const paymentRef = body.gatewayPaymentId || body.paymentReference || order.gatewayPaymentId;
          if (!paymentRef) {
            return NextResponse.json(
              {
                success: false,
                error: 'Cannot mark online gateway order as PAID without a verified payment transaction reference.',
              },
              { status: 400 }
            );
          }
          order.gatewayPaymentId = paymentRef;
        } else if (order.paymentMethod === 'COD' && order.fulfillmentStatus !== 'DELIVERED') {
          return NextResponse.json(
            {
              success: false,
              error: 'Cannot mark Cash on Delivery order as PAID until fulfillment status is DELIVERED.',
            },
            { status: 400 }
          );
        }
      }

      const prevPaymentStatus = order.paymentStatus;
      order.paymentStatus = paymentStatus;

      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: `PAYMENT_${paymentStatus}`,
        previousStatus: prevPaymentStatus,
        timestamp: new Date(),
        description: `Payment status updated from ${prevPaymentStatus} to ${paymentStatus} by administrator (${session.email})`,
        updatedBy: session.email,
      });
    }

    // --- 3. CARRIER & TRACKING INFORMATION ---
    if (carrier !== undefined) order.carrier = carrier.trim();
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber.trim();
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl.trim();
    if (estimatedDelivery !== undefined) order.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : undefined;

    await order.save();

    return NextResponse.json({
      success: true,
      data: {
        order,
        message: 'Order updated successfully.',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order.' },
      { status: 500 }
    );
  }
}
