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
        productId: product._id,
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

    const freeShippingThreshold = 1999;
    const shippingFee = recalculatedSubtotal >= freeShippingThreshold ? 0 : 99;
    const taxTotal = Math.round((recalculatedSubtotal - discountTotal) * 0.12);
    const grandTotal = Math.max(0, recalculatedSubtotal - discountTotal + shippingFee);

    const orderNumber = `AVZ-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    // Estimated delivery: 4 business days from order date
    const estimatedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

    // For COD: Atomically decrement stock immediately upon order placement
    const decrementedItems: { productId: any; variantSku: string; quantity: number }[] = [];
    if (isCod) {
      for (const item of validatedItems) {
        const updateRes = await Product.updateOne(
          {
            _id: item.productId,
            'variants.sku': item.variantSku,
            'variants.stock': { $gte: item.quantity },
          },
          { $inc: { 'variants.$.stock': -item.quantity } }
        );

        if (updateRes.modifiedCount === 0) {
          // Stock was claimed concurrently; roll back any decrements already made for this order
          for (const dec of decrementedItems) {
            await Product.updateOne(
              { _id: dec.productId, 'variants.sku': dec.variantSku },
              { $inc: { 'variants.$.stock': dec.quantity } }
            );
          }
          return NextResponse.json(
            {
              success: false,
              error: `Stock for "${item.title}" (${item.size}) was just reserved by another customer. Please adjust your bag.`,
            },
            { status: 409 }
          );
        }

        decrementedItems.push({
          productId: item.productId,
          variantSku: item.variantSku,
          quantity: item.quantity,
        });
      }
    }

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
