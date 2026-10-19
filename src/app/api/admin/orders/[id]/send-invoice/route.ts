import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Order } from '@/server/models/Order';
import { getSessionFromRequest } from '@/server/auth';
import { generateInvoicePdf } from '@/server/services/invoiceService';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required.' },
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

    // Check email provider configuration
    const resendKey = process.env.RESEND_API_KEY;
    const smtpHost = process.env.SMTP_HOST;
    const hasEmailProvider = Boolean(resendKey || smtpHost);

    if (!hasEmailProvider) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          error:
            'Email delivery service is currently not configured. Please add SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) or a RESEND_API_KEY to your .env.local file to enable automated customer dispatch. You can still use the Download or Print PDF buttons above to share the invoice manually.',
        },
        { status: 422 }
      );
    }

    // If an email provider is configured in future:
    const { pdfBuffer, invoiceNumber } = await generateInvoicePdf({
      order,
      saveInvoiceNumber: true,
    });

    // Handle provider send (e.g. Resend)
    if (resendKey) {
      const fromEmail = process.env.EMAIL_FROM || 'invoices@aveezfashion.com';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [order.customerEmail],
          subject: `Your AVEEZ FASHION Invoice — Order ${order.orderNumber}`,
          text: `Dear ${order.customerName},\n\nThank you for choosing AVEEZ FASHION. Please find attached the official tax invoice (${invoiceNumber}) for your order ${order.orderNumber}.\n\nBest regards,\nAVEEZ FASHION Team`,
          attachments: [
            {
              filename: `AVEEZ-INVOICE-${invoiceNumber}.pdf`,
              content: pdfBuffer.toString('base64'),
            },
          ],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Email delivery failed at provider.');
      }

      // Record in status history
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: 'INVOICE_SENT',
        timestamp: new Date(),
        description: `Invoice ${invoiceNumber} emailed to ${order.customerEmail} by ${session.email}`,
        updatedBy: session.email,
      });
      await order.save();

      return NextResponse.json({
        success: true,
        message: `Invoice ${invoiceNumber} sent successfully to ${order.customerEmail}.`,
      });
    }

    return NextResponse.json({
      success: false,
      configured: false,
      error: 'SMTP integration is not yet connected.',
    }, { status: 422 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to dispatch invoice email.' },
      { status: 500 }
    );
  }
}
