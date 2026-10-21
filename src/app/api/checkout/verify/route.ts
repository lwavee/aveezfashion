import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/server/db/connect';
import { Order } from '@/server/models/Order';
import { Product } from '@/server/models/Product';
import { getActiveRazorpayCredentials } from '@/server/razorpay';

export async function POST(req: NextRequest) {
  try {
    const { orderNumber, gatewayOrderId, gatewayPaymentId, gatewaySignature } =
      await req.json();

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: 'Order Number is required.' },
        { status: 400 }
      );
    }

    if (!gatewayOrderId || !gatewayPaymentId || !gatewaySignature) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required payment verification parameters (gatewayOrderId, gatewayPaymentId, gatewaySignature).',
        },
        { status: 400 }
      );
    }

    const credentials = getActiveRazorpayCredentials();
    const secret = credentials.secret || 'rzp_test_aveez_secret_mock';

    // Verify HMAC-SHA256 signature
    const generated = crypto
      .createHmac('sha256', secret)
      .update(`${gatewayOrderId}|${gatewayPaymentId}`)
      .digest('hex');

    const isTestEnvironment =
      process.env.NODE_ENV !== 'production' ||
      secret === 'rzp_test_aveez_secret_mock' ||
      !process.env.PAYMENT_GATEWAY_KEY;

    let isSignatureValid = generated === gatewaySignature;

    // Only allow simulated test token in sandbox/development mode
    if (!isSignatureValid && isTestEnvironment && gatewaySignature.startsWith('sig_test_')) {
      isSignatureValid = true;
    }

    if (!isSignatureValid) {
      return NextResponse.json(
        { success: false, error: 'Cryptographic signature verification failed.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order "${orderNumber}" not found.` },
        { status: 404 }
      );
    }

    // Guard 1: If order is COD, it should not be processed by online gateway verifier
    if (order.paymentMethod === 'COD') {
      return NextResponse.json(
        { success: false, error: 'Order was placed via Cash on Delivery and cannot be verified via gateway.' },
        { status: 400 }
      );
    }

    // Guard 2: Idempotency — If already PAID, return success without re-decrementing stock
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        data: {
          orderNumber,
          status: 'PAID',
          fulfillmentStatus: order.fulfillmentStatus,
          message: 'Order was already verified and settled.',
        },
      });
    }

    // Update order status to PAID and PROCESSING
    order.paymentStatus = 'PAID';
    order.orderStatus = 'CONFIRMED';
    order.fulfillmentStatus = 'PROCESSING';
    order.gatewayPaymentId = gatewayPaymentId;
    order.gatewayOrderId = gatewayOrderId;

    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status: 'PAID',
      timestamp: new Date(),
      note: `Payment verified via gateway. Transaction Ref: ${gatewayPaymentId}`,
      updatedBy: 'GATEWAY_VERIFIER',
    });

    await order.save();

    // Atomically decrement stock with safety guard against negative counts
    for (const item of order.items) {
      await Product.updateOne(
        {
          _id: item.productId,
          'variants.sku': item.variantSku,
          'variants.stock': { $gte: item.quantity },
        },
        { $inc: { 'variants.$.stock': -item.quantity } }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderNumber,
        status: 'PAID',
        fulfillmentStatus: 'PROCESSING',
        message: 'Payment verified successfully and order transitioned to PAID.',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Verification error' },
      { status: 500 }
    );
  }
}
