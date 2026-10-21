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

    // Find confirmed orders belonging to this user (exclude unpaid checkout drafts)
    const orders = await Order.find({
      $or: [
        { user: session.userId },
        { customerEmail: session.email },
      ],
      orderStatus: { $ne: 'DRAFT_CHECKOUT' },
      paymentStatus: 'PAID',
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map((ord) => {
      const itemsList = (ord.items || []).map((i: any) => ({
        productId: String(i.productId || ''),
        variantSku: i.variantSku || '',
        title: i.title || 'Apparel Item',
        size: i.size || 'ONESIZE',
        color: i.color || 'Default',
        price: i.unitPrice ?? i.price ?? 0,
        unitPrice: i.unitPrice ?? i.price ?? 0,
        quantity: i.quantity || 1,
        totalPrice: i.totalPrice ?? ((i.unitPrice ?? 0) * (i.quantity || 1)),
        image: i.thumbnailImage ?? i.image ?? '/images/placeholder.jpg',
        thumbnailImage: i.thumbnailImage ?? i.image ?? '/images/placeholder.jpg',
      }));

      const grandTotal = ord.pricing?.grandTotal || 0;

      return {
        id: String(ord._id),
        orderNumber: ord.orderNumber,
        createdAt: ord.createdAt,
        date: ord.createdAt
          ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : 'Recent',
        total: `₹${grandTotal.toLocaleString('en-IN')}`,
        totalAmount: grandTotal,
        pricing: ord.pricing || { grandTotal },
        items: itemsList,
        itemsSummary: itemsList.map((i) => `${i.title} (${i.size}) × ${i.quantity}`).join(', '),
        fulfillmentStatus: ord.fulfillmentStatus || 'PROCESSING',
        status: ord.fulfillmentStatus || 'PROCESSING',
        paymentStatus: ord.paymentStatus || 'PENDING',
        paymentMethod: ord.paymentMethod || 'ONLINE_GATEWAY',
        returnStatus: (ord as any).returnStatus || 'NONE',
        deliveredAt: (ord as any).deliveredAt || null,
        shippingAddress: ord.shippingAddress,
        trackingNumber: ord.trackingNumber || '',
        carrier: ord.carrier || '',
        trackingUrl: ord.trackingUrl || '#',
      };
    });

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
