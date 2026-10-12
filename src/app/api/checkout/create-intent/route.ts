import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Order } from '@/server/models/Order';
import { Product } from '@/server/models/Product';
import { initialProducts } from '@/server/db/seedData';
import { getSessionFromRequest } from '@/server/auth';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json();
    const {
      customer,
      shippingAddress,
      items,
      couponCode,
      paymentMethod,
      idempotencyKey,
    } = body;

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { success: false, error: 'Customer details are required.' },
        { status: 400 }
      );
    }

    if (!shippingAddress?.streetAddress || !shippingAddress?.city || !shippingAddress?.pincode) {
      return NextResponse.json(
        { success: false, error: 'Complete shipping address is required.' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Shopping bag must contain at least 1 item.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Idempotency check: prevent duplicate order creation
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey }).lean();
      if (existingOrder) {
        return NextResponse.json({
          success: true,
          data: {
            orderNumber: existingOrder.orderNumber,
            grandTotal: existingOrder.pricing.grandTotal,
            subtotal: existingOrder.pricing.subtotal,
            discountTotal: existingOrder.pricing.discountTotal,
            shippingFee: existingOrder.pricing.shippingFee,
            gatewayOrderId: `gateway_${existingOrder.orderNumber}`,
            currency: 'INR',
            paymentMethod: existingOrder.paymentMethod,
            message: 'Order already recorded.',
          },
        });
      }
    }

    // ZERO CLIENT TRUST: Server-authoritative price & availability validation
    let recalculatedSubtotal = 0;
    const validatedItems = [];

    for (const clientItem of items) {
      let product = await Product.findOne({
        $or: [{ slug: clientItem.slug }, { _id: clientItem.productId }],
      }).lean();

      if (!product) {
        product = initialProducts.find((p) => p.slug === clientItem.slug) as any;
      }

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product "${clientItem.title}" is no longer available.` },
          { status: 422 }
        );
      }

      const verifiedUnitPrice = product.salePrice || product.basePrice || 1699;
      const verifiedQuantity = Math.max(1, parseInt(clientItem.quantity, 10) || 1);
      const verifiedItemTotal = verifiedUnitPrice * verifiedQuantity;

      recalculatedSubtotal += verifiedItemTotal;

      const heroImg =
        typeof product.images?.[0] === 'string'
          ? product.images[0]
          : product.images?.[0]?.url || clientItem.image || '';

      validatedItems.push({
        productId: product._id,
        variantSku: clientItem.variantSku,
        title: product.title,
        size: clientItem.size,
        color: clientItem.color,
        unitPrice: verifiedUnitPrice,
        quantity: verifiedQuantity,
        totalPrice: verifiedItemTotal,
        thumbnailImage: heroImg,
      });
    }

    // Server-side Coupon validation
    let discountTotal = 0;
    const cleanCoupon = (couponCode || '').trim().toUpperCase();
    if (cleanCoupon === 'AVEEZ10') {
      discountTotal = Math.round(recalculatedSubtotal * 0.1);
    } else if (cleanCoupon === 'FIRST500' && recalculatedSubtotal >= 2999) {
      discountTotal = 500;
    }

    const freeShippingThreshold = 1999;
    const shippingFee = recalculatedSubtotal >= freeShippingThreshold ? 0 : 99;
    const taxTotal = Math.round((recalculatedSubtotal - discountTotal) * 0.12);
    const grandTotal = Math.max(0, recalculatedSubtotal - discountTotal + shippingFee);

    const orderNumber = `AVZ-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    // Estimated delivery: 4 days from order date
    const estimatedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

    const isCod = paymentMethod === 'COD';

    // Build immutable address snapshot
    const addressSnapshot = {
      recipientName: shippingAddress.recipientName || customer.name,
      phone: shippingAddress.phone || customer.phone,
      house: shippingAddress.house || '',
      streetAddress: shippingAddress.streetAddress,
      landmark: shippingAddress.landmark || '',
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pincode,
      addressType: shippingAddress.addressType || 'HOME',
    };

    const initialHistory = [
      {
        status: isCod ? 'CONFIRMED' : 'PENDING_PAYMENT',
        timestamp: new Date(),
        note: isCod ? 'Order confirmed via Cash on Delivery.' : 'Awaiting payment verification.',
        updatedBy: 'SYSTEM',
      },
    ];

    const orderDoc = await Order.create({
      orderNumber,
      idempotencyKey: idempotencyKey || undefined,
      user: session?.userId || null,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      items: validatedItems,
      shippingAddress: addressSnapshot,
      pricing: {
        subtotal: recalculatedSubtotal,
        discountTotal,
        taxTotal,
        shippingFee,
        grandTotal,
        currency: 'INR',
      },
      paymentMethod: isCod ? 'COD' : 'ONLINE_GATEWAY',
      paymentStatus: 'PENDING',
      fulfillmentStatus: isCod ? 'PROCESSING' : 'UNFULFILLED',
      orderStatus: isCod ? 'CONFIRMED' : 'PENDING',
      statusHistory: initialHistory,
      estimatedDelivery,
    });

    const gatewayOrderId = `order_gw_${orderNumber}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      data: {
        orderId: String(orderDoc._id),
        orderNumber,
        grandTotal,
        subtotal: recalculatedSubtotal,
        discountTotal,
        shippingFee,
        gatewayOrderId,
        currency: 'INR',
        paymentMethod: orderDoc.paymentMethod,
        message: 'Order created with server-verified pricing and address snapshot.',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Checkout failed.' },
      { status: 500 }
    );
  }
}
