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

    const updates: any = {};

    if (fulfillmentStatus && fulfillmentStatus !== order.fulfillmentStatus) {
      updates.fulfillmentStatus = fulfillmentStatus;
      order.fulfillmentStatus = fulfillmentStatus;

      // Status history entry
      const description =
        statusNote ||
        `Fulfillment updated to ${fulfillmentStatus} by administrator (${session.email})`;
      if (!order.statusHistory) {
        order.statusHistory = [];
      }
      order.statusHistory.push({
        status: fulfillmentStatus,
        timestamp: new Date().toISOString(),
        description,
        updatedBy: session.email,
      });
    }

    if (orderStatus && orderStatus !== order.orderStatus) {
      updates.orderStatus = orderStatus;
      order.orderStatus = orderStatus;
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: orderStatus,
        timestamp: new Date().toISOString(),
        description: `Order status set to ${orderStatus} by administrator (${session.email})`,
        updatedBy: session.email,
      });
    }

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

      updates.paymentStatus = paymentStatus;
      order.paymentStatus = paymentStatus;
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: `PAYMENT_${paymentStatus}`,
        timestamp: new Date().toISOString(),
        description: `Payment status updated to ${paymentStatus} by administrator (${session.email})`,
        updatedBy: session.email,
      });
    }

    if (carrier !== undefined) order.carrier = carrier;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
    if (estimatedDelivery !== undefined) order.estimatedDelivery = estimatedDelivery;

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
