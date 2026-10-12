import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Order } from '@/server/models/Order';
import { Product } from '@/server/models/Product';
import { User } from '@/server/models/User';
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

    // 1. Revenue from real PAID orders
    const paidOrders = await Order.find({ paymentStatus: 'PAID' }).lean();
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.pricing?.grandTotal || 0), 0);
    const paidCount = paidOrders.length;

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
    const lowStockDetails: string[] = [];

    for (const prod of activeProducts) {
      for (const variant of prod.variants || []) {
        totalVariants++;
        if ((variant.stock || 0) <= 5) {
          lowStockCount++;
          if (lowStockDetails.length < 2) {
            lowStockDetails.push(`${prod.title} (${variant.size})`);
          }
        }
      }
    }

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
            value: `₹${totalRevenue.toLocaleString('en-IN')}`,
            rawValue: totalRevenue,
            change: paidCount > 0 ? `From ${paidCount} settled order(s)` : 'No paid orders settled yet',
          },
          confirmedOrders: {
            value: `${totalOrders}`,
            rawValue: totalOrders,
            change:
              totalOrders > 0
                ? `${processingCount} order(s) in processing`
                : 'No customer orders recorded yet',
          },
          registeredCustomers: {
            value: `${registeredCustomers}`,
            rawValue: registeredCustomers,
            change:
              registeredCustomers > 0
                ? 'Verified database accounts'
                : 'No customer accounts registered yet',
          },
          activeCatalogSkus: {
            value: `${totalVariants} Variants`,
            rawValue: totalVariants,
            change: `Across ${activeProducts.length} live master product(s)`,
          },
          lowStockAlerts: {
            value: `${lowStockCount} SKU${lowStockCount === 1 ? '' : 's'}`,
            rawValue: lowStockCount,
            change:
              lowStockCount > 0
                ? lowStockDetails.join(', ') + (lowStockCount > 2 ? ' ...' : '')
                : 'All variant inventory healthy (>5 units)',
          },
          pendingFulfillment: {
            value: `${pendingFulfillment} Order${pendingFulfillment === 1 ? '' : 's'}`,
            rawValue: pendingFulfillment,
            change:
              pendingFulfillment > 0
                ? 'Awaiting fulfillment/dispatch'
                : 'All orders fulfilled',
          },
        },
        recentOrders: formattedOrders,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch admin metrics.' },
      { status: 500 }
    );
  }
}
