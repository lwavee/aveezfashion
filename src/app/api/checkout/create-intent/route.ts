import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Order } from '@/server/models/Order';
import { Product } from '@/server/models/Product';
import { initialProducts, paymentTestProduct } from '@/server/db/seedData';
import { getSessionFromRequest } from '@/server/auth';
import { getActiveRazorpayCredentials } from '@/server/razorpay';

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

    // ZERO CLIENT TRUST: Server-authoritative price, stock & availability validation
    let recalculatedSubtotal = 0;
    const validatedItems = [];
    const isCod = paymentMethod === 'COD';

    for (const clientItem of items) {
      let product = await Product.findOne({
        $or: [{ slug: clientItem.slug }, { _id: clientItem.productId }],
      }).lean();

      if (!product) {
        product = initialProducts.find((p) => p.slug === clientItem.slug) as any;
      }

      if (!product && (clientItem.slug === 'aveez-payment-test-product' || clientItem.variantSku === 'AVZ-TEST-PAY-001-STD')) {
        product = paymentTestProduct as any;
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

      // Locate specific variant to validate inventory
      const matchingVariant = (product.variants || []).find(
        (v: any) =>
          v.sku === clientItem.variantSku ||
          (v.size === clientItem.size && v.color?.toLowerCase() === clientItem.color?.toLowerCase()) ||
          v.size === clientItem.size
      );

      if (!matchingVariant) {
        return NextResponse.json(
          {
            success: false,
            error: `Selected variant (Size: ${clientItem.size}, Color: ${clientItem.color || 'Default'}) for "${product.title}" is unavailable.`,
          },
          { status: 422 }
        );
      }

      const currentStock = matchingVariant.stock || 0;
      if (currentStock < verifiedQuantity) {
        return NextResponse.json(
          {
            success: false,
            error:
              currentStock <= 0
                ? `"${product.title}" (Size: ${matchingVariant.size}) is sold out.`
                : `Only ${currentStock} unit(s) remaining for "${product.title}" (Size: ${matchingVariant.size}). Please adjust your bag quantity.`,
          },
          { status: 422 }
        );
      }

      recalculatedSubtotal += verifiedItemTotal;

      const heroImg =
        typeof product.images?.[0] === 'string'
          ? product.images[0]
          : product.images?.[0]?.url || clientItem.image || '';

      validatedItems.push({
        productId:
          product._id && /^[0-9a-fA-F]{24}$/.test(String(product._id))
            ? product._id
            : '6ad9256373bf492b785b2001',
        variantSku: matchingVariant.sku,
        title: product.title,
        size: matchingVariant.size,
        color: matchingVariant.color,
        unitPrice: verifiedUnitPrice,
        quantity: verifiedQuantity,
        totalPrice: verifiedItemTotal,
        thumbnailImage: heroImg,
      });
    }

    // Dynamic Server-side Coupon validation
    let discountTotal = 0;
    if (couponCode) {
      const { validateCouponServer } = await import('@/server/coupons');
      const couponRes = await validateCouponServer(couponCode, recalculatedSubtotal);
      if (couponRes.valid) {
        discountTotal = couponRes.discount;
      }
    }

    // Check if order contains the temporary internal payment test item
    const isTestOrder = validatedItems.some(
      (item) => item.variantSku === 'AVZ-TEST-PAY-001-STD' || item.title.includes('Payment Test Product')
    );

    // Cash on Delivery is strictly disabled by merchant preference
    if (isCod || paymentMethod === 'COD') {
      return NextResponse.json(
        {
          success: false,
          error:
            'Cash on Delivery is currently unavailable. Please complete your order securely via online payment.',
        },
        { status: 400 }
      );
    }

    const freeShippingThreshold = 1999;
    // Controlled test product: exact ₹1.00 shipping charge (Subtotal: ₹1.00 + Shipping: ₹1.00 = Total: ₹2.00)
    // All normal products preserve existing shipping calculation rules
    const shippingFee = isTestOrder
      ? 1
      : recalculatedSubtotal >= freeShippingThreshold
      ? 0
      : 99;

    const taxTotal = Math.round((recalculatedSubtotal - discountTotal) * 0.12);
    const grandTotal = Math.max(0, recalculatedSubtotal - discountTotal + shippingFee);

    const orderNumber = `AVZ-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    // Estimated delivery: 4 business days from order date
    const estimatedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

    // Clean up any stale uncompleted checkout drafts for this customer
    await Order.deleteMany({
      $or: [
        { customerEmail: customer.email.toLowerCase() },
        ...(session?.userId ? [{ user: session.userId }] : []),
      ],
      orderStatus: 'DRAFT_CHECKOUT',
      paymentStatus: { $in: ['PENDING', 'UNPAID'] },
    });

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
        status: 'DRAFT_CHECKOUT',
        timestamp: new Date(),
        note: 'Checkout session created. Awaiting successful gateway payment verification.',
        updatedBy: 'SYSTEM',
      },
    ];

    // Order is created as DRAFT_CHECKOUT and will ONLY be finalized upon verified payment
    const orderDoc = await Order.create({
      orderNumber,
      idempotencyKey: idempotencyKey || undefined,
      user: session?.userId || null,
      customerName: customer.name,
      customerEmail: customer.email.toLowerCase(),
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
      paymentMethod: ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'ONLINE_GATEWAY'].includes(paymentMethod)
        ? paymentMethod
        : 'ONLINE_GATEWAY',
      paymentStatus: 'PENDING',
      fulfillmentStatus: 'PENDING',
      orderStatus: 'DRAFT_CHECKOUT',
      statusHistory: initialHistory,
      estimatedDelivery,
    });

    let gatewayOrderId = `order_gw_${orderNumber}_${Date.now()}`;
    const credentials = getActiveRazorpayCredentials();
    const rzpKey = credentials.key;
    const rzpSecret = credentials.secret;

    if (!isCod && rzpKey && rzpSecret) {
      try {
        const auth = Buffer.from(`${rzpKey}:${rzpSecret}`).toString('base64');
        const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            amount: Math.round(grandTotal * 100),
            currency: 'INR',
            receipt: orderNumber,
            notes: {
              orderNumber,
              customerEmail: customer.email,
              paymentMethod: orderDoc.paymentMethod,
            },
          }),
        });

        if (rzpRes.ok) {
          const rzpJson = await rzpRes.json();
          if (rzpJson.id) {
            gatewayOrderId = rzpJson.id;
          }
        }
      } catch {
        // Fallback to simulated gateway order id if test environment
      }
    }

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
        razorpayKeyId: rzpKey || 'rzp_test_aveez_fashion_key',
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
