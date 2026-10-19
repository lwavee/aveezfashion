import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Order } from '@/server/models/Order';
import { getSessionFromRequest } from '@/server/auth';
import { generateInvoicePdf } from '@/server/services/invoiceService';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required to generate or download invoices.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const identifier = params.id;
    let order = null;

    if (identifier.startsWith('AVZ-')) {
      order = await Order.findOne({ orderNumber: identifier });
    } else {
      try {
        order = await Order.findById(identifier);
      } catch {
        order = await Order.findOne({ orderNumber: identifier });
      }
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    const { pdfBuffer, invoiceNumber } = await generateInvoicePdf({
      order,
      saveInvoiceNumber: true,
    });

    const isDownload = req.nextUrl.searchParams.get('download') === 'true';
    const disposition = isDownload ? 'attachment' : 'inline';

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="AVEEZ-INVOICE-${invoiceNumber}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Invoice PDF generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate invoice PDF.' },
      { status: 500 }
    );
  }
}
