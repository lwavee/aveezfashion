import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Order } from '@/server/models/Order';
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

    await connectToDatabase();

    // Find orders belonging to this user
    const orders = await Order.find({
      $or: [
        { user: session.userId },
        { customerEmail: session.email },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map((ord) => ({
      orderNumber: ord.orderNumber,
      date: ord.createdAt
        ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : 'Recent',
      total: `₹${(ord.pricing?.grandTotal || 0).toLocaleString('en-IN')}`,
      items: (ord.items || [])
        .map((i) => `${i.title} (${i.size}) × ${i.quantity}`)
        .join(', '),
      status: ord.fulfillmentStatus,
      paymentStatus: ord.paymentStatus,
      trackingUrl: ord.trackingUrl || '#',
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customer orders.' },
      { status: 500 }
    );
  }
}
