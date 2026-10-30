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
    const identifier = params.id;

    await connectToDatabase();

    // Query by MongoDB ObjectId or human-readable orderNumber
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

    // Do not expose uncompleted checkout drafts
    if (order.orderStatus === 'DRAFT_CHECKOUT' || order.paymentStatus === 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Order payment was not completed.' },
        { status: 400 }
      );
    }

    // Security check: require ownership for authenticated users, or allow admin
    const isAdmin = session?.role === 'ADMIN' || session?.role === 'STAFF';
    if (!isAdmin) {
      if (session) {
        const isOwner =
          (order.user && String(order.user) === session.userId) ||
          order.customerEmail.toLowerCase() === session.email.toLowerCase();
        if (!isOwner) {
          return NextResponse.json(
            { success: false, error: 'Forbidden: You do not have access to this order.' },
            { status: 403 }
          );
        }
      }
    }

    // Determine return/exchange eligibility (within 7 days of delivery)
    const isDelivered = order.fulfillmentStatus === 'DELIVERED';
    let isReturnEligible = false;
    let daysSinceDelivery = 0;
    if (isDelivered && order.updatedAt) {
      const diffMs = Date.now() - new Date(order.updatedAt).getTime();
      daysSinceDelivery = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      isReturnEligible = daysSinceDelivery <= 7 && order.returnStatus === 'NONE';
    }

    const isCancelEligible =
      order.fulfillmentStatus === 'UNFULFILLED' ||
      order.fulfillmentStatus === 'PROCESSING' ||
      order.fulfillmentStatus === 'PENDING_CONFIRMATION';

    const normalizedItems = (order.items || []).map((i: any) => ({
      ...i,
      productId: String(i.productId || ''),
      price: i.unitPrice ?? i.price ?? 0,
      unitPrice: i.unitPrice ?? i.price ?? 0,
      quantity: i.quantity || 1,
      totalPrice: i.totalPrice ?? ((i.unitPrice ?? 0) * (i.quantity || 1)),
      image: i.thumbnailImage ?? i.image ?? '/brand/clothing-label-mark.svg',
      thumbnailImage: i.thumbnailImage ?? i.image ?? '/brand/clothing-label-mark.svg',
    }));

    return NextResponse.json({
      success: true,
      data: {
        order: {
          ...order,
          id: String(order._id),
          items: normalizedItems,
          totalAmount: order.pricing?.grandTotal || 0,
          isReturnEligible,
          isCancelEligible,
          daysSinceDelivery,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order details.' },
      { status: 500 }
    );
  }
}
