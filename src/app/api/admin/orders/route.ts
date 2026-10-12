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

    if (session.role !== 'ADMIN' && session.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    const formattedOrders = orders.map((ord) => ({
      id: String(ord._id),
      orderNumber: ord.orderNumber,
      customer: ord.customerName || ord.customerEmail || 'Guest Customer',
      customerEmail: ord.customerEmail || '',
      customerPhone: ord.customerPhone || '',
      items: (ord.items || [])
        .map((i) => `${i.title} (${i.size}) × ${i.quantity}`)
        .join(', '),
      itemsCount: (ord.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0),
      amount: `₹${(ord.pricing?.grandTotal || 0).toLocaleString('en-IN')}`,
      rawAmount: ord.pricing?.grandTotal || 0,
      payment: `${ord.paymentStatus} (${ord.paymentMethod})`,
      paymentStatus: ord.paymentStatus,
      paymentMethod: ord.paymentMethod,
      fulfillment: ord.fulfillmentStatus,
      shippingAddress: ord.shippingAddress,
      date: ord.createdAt
        ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'N/A',
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
        totalCount: formattedOrders.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders.' },
      { status: 500 }
    );
  }
}
