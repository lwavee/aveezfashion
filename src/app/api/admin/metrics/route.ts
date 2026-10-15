import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Order } from '@/server/models/Order';
import { Product } from '@/server/models/Product';
import { User } from '@/server/models/User';
import { ReturnRequest } from '@/server/models/ReturnRequest';
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

    // 1. Settled Net Revenue (exclude cancelled or refunded orders)
    const paidOrders = await Order.find({
      paymentStatus: 'PAID',
      orderStatus: { $nin: ['CANCELLED', 'REFUNDED'] },
    }).lean();
    const grossRevenue = paidOrders.reduce((sum, o) => sum + (o.pricing?.grandTotal || 0), 0);
    const paidCount = paidOrders.length;

    // Processed refunds from ReturnRequest records
    const processedRefunds = await ReturnRequest.find({ refundStatus: 'PROCESSED' }).lean();
    const totalRefunded = processedRefunds.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
    const netRevenue = Math.max(0, grossRevenue - totalRefunded);

    // Pending return/exchange requests
    const pendingReturnsCount = await ReturnRequest.countDocuments({
      status: { $in: ['PENDING', 'APPROVED', 'PICKUP_SCHEDULED', 'INSPECTED'] },
    });

    // 2. Confirmed real orders
    const totalOrders = await Order.countDocuments({});
    const processingCount = await Order.countDocuments({ fulfillmentStatus: 'PROCESSING' });

    // 3. Real registered customers count
    const registeredCustomers = await User.countDocuments({ role: 'CUSTOMER' });

    // 4. Real active catalog SKUs & variants from actual products
    const activeProducts = await Product.find({
      status: { $ne: 'ARCHIVED' },
    }).lean();
    let totalVariants = 0;
    let lowStockCount = 0;
    const lowStockItems: Array<{
      productId: string;
      title: string;
      sku: string;
      size: string;
      color: string;
      stock: number;
    }> = [];

    for (const prod of activeProducts) {
      for (const variant of prod.variants || []) {
        totalVariants++;
        const currentStock = typeof variant.stock === 'number' ? variant.stock : 0;
        if (currentStock <= 5) {
          lowStockCount++;
          lowStockItems.push({
            productId: String(prod._id),
            title: prod.title,
            sku: variant.sku || `${prod.slug}-${variant.size}`,
            size: variant.size || 'One Size',
            color: variant.color || 'Standard',
            stock: currentStock,
          });
        }
      }
    }

    // Sort lowest stock first
    lowStockItems.sort((a, b) => a.stock - b.stock);

    // 5. Real pending fulfillment count (unfulfilled or in processing)
    const pendingFulfillment = await Order.countDocuments({
      fulfillmentStatus: { $in: ['UNFULFILLED', 'PROCESSING'] },
    });

    // 6. Recent Orders from actual database records only
    const ordersList = await Order.find({}).sort({ createdAt: -1 }).limit(10).lean();

    const formattedOrders = ordersList.map((ord) => {
      const itemsSummary = (ord.items || [])
        .map((i) => `${i.title} (${i.size}) × ${i.quantity}`)
        .join(', ');

      const formattedDate = ord.createdAt
        ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'N/A';

      return {
        id: String(ord._id),
        orderNumber: ord.orderNumber,
        customer: ord.customerName || ord.customerEmail || 'Guest Customer',
        customerEmail: ord.customerEmail || '',
        customerPhone: ord.customerPhone || '',
        items: itemsSummary || 'No item details',
        amount: `₹${(ord.pricing?.grandTotal || 0).toLocaleString('en-IN')}`,
        rawAmount: ord.pricing?.grandTotal || 0,
        payment: `${ord.paymentStatus} (${ord.paymentMethod})`,
        paymentStatus: ord.paymentStatus,
        paymentMethod: ord.paymentMethod,
        fulfillment: ord.fulfillmentStatus,
        date: formattedDate,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalRevenue: {
            value: `₹${netRevenue.toLocaleString('en-IN')}`,
            rawValue: netRevenue,
            grossValue: grossRevenue,
            refundedValue: totalRefunded,
            change:
              paidCount > 0
                ? `Net settled from ${paidCount} paid order(s)${totalRefunded > 0 ? ` (₹${totalRefunded.toLocaleString('en-IN')} refunded)` : ''}`
                : 'No paid orders settled yet',
          },
          confirmedOrders: {
            value: `${totalOrders}`,
            rawValue: totalOrders,
            change:
              totalOrders > 0
                ? `${processingCount} order(s) in processing`
                : 'No customer orders recorded yet',
          },
          pendingFulfillment: {
            value: `${pendingFulfillment}`,
            rawValue: pendingFulfillment,
            change:
              pendingFulfillment > 0
                ? 'Awaiting dispatch & tracking'
                : 'All orders fulfilled',
          },
          totalProducts: {
            value: `${activeProducts.length}`,
            rawValue: activeProducts.length,
            totalVariants,
            change: `${totalVariants} total active SKU variants`,
          },
          lowStockAlerts: {
            value: `${lowStockCount}`,
            rawValue: lowStockCount,
            change:
              lowStockCount > 0
                ? `${lowStockCount} SKU(s) at or below threshold (≤5)`
                : 'All variant inventory healthy (>5 units)',
          },
          registeredCustomers: {
            value: `${registeredCustomers}`,
            rawValue: registeredCustomers,
            change:
              registeredCustomers > 0
                ? 'Verified database customer accounts'
                : 'No customer accounts registered yet',
          },
          pendingReturns: {
            value: `${pendingReturnsCount}`,
            rawValue: pendingReturnsCount,
            change:
              pendingReturnsCount > 0
                ? 'Awaiting inspection or pickup'
                : 'No pending returns',
          },
        },
        recentOrders: formattedOrders,
        lowStockItems: lowStockItems.slice(0, 10),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch admin metrics.' },
      { status: 500 }
    );
  }
}
