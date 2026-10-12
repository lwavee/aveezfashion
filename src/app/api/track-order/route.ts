import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Order } from '@/server/models/Order';
import { getSessionFromRequest, normalizeEmail, normalizePhone } from '@/server/auth';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json();
    const { orderNumber, verificationContact } = body;

    if (!orderNumber || typeof orderNumber !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid order number.' },
        { status: 400 }
      );
    }

    const cleanOrderNumber = orderNumber.trim().toUpperCase();

    await connectToDatabase();

    const order = await Order.findOne({ orderNumber: cleanOrderNumber }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'No order found matching this order number.' },
        { status: 404 }
      );
    }

    // Check authorization:
    // If user is logged in and owns the order, allow
    const isOwnerBySession =
      session &&
      ((order.user && String(order.user) === session.userId) ||
        order.customerEmail.toLowerCase() === session.email.toLowerCase());

    const isAdmin = session?.role === 'ADMIN' || session?.role === 'STAFF';

    // If not logged in or not owning session, require matching email or phone
    if (!isOwnerBySession && !isAdmin) {
      if (!verificationContact || typeof verificationContact !== 'string') {
        return NextResponse.json(
          {
            success: false,
            error:
              'For your security, please provide the email or 10-digit mobile number associated with this order.',
            requiresVerification: true,
          },
          { status: 403 }
        );
      }

      const inputClean = verificationContact.trim().toLowerCase();
      const orderEmail = order.customerEmail?.toLowerCase() || '';
      const orderPhoneNormalized = normalizePhone(order.customerPhone || '');
      const inputPhoneNormalized = normalizePhone(inputClean);

      const emailMatches = orderEmail === inputClean;
      const phoneMatches =
        inputPhoneNormalized.length === 10 &&
        orderPhoneNormalized === inputPhoneNormalized;

      if (!emailMatches && !phoneMatches) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Verification failed. The contact detail does not match the record for this order.',
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: String(order._id),
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
          orderStatus: order.orderStatus || 'CONFIRMED',
          fulfillmentStatus: order.fulfillmentStatus || 'UNFULFILLED',
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          shippingAddress: {
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            pincode: order.shippingAddress.pincode,
          },
          trackingNumber: order.trackingNumber || null,
          trackingUrl: order.trackingUrl || null,
          carrier: order.carrier || null,
          estimatedDelivery: order.estimatedDelivery || null,
          statusHistory: order.statusHistory || [],
          items: order.items.map((item: any) => ({
            title: item.title,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve tracking information.' },
      { status: 500 }
    );
  }
}
