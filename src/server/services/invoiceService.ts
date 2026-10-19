import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { connectToDatabase } from '@/server/db/connect';
import { Settings } from '@/server/models/Settings';
import { Order, OrderDocument } from '@/server/models/Order';

interface InvoiceGenerationOptions {
  order: OrderDocument | any;
  saveInvoiceNumber?: boolean;
}

/**
 * Format Indian Rupee currency
 */
function formatCurrency(amount: number): string {
  return `INR ${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format Date in Indian Standard Time (IST)
 */
function formatDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  }) + ' IST';
}

/**
 * Generates an idempotent, unique invoice number for an order
 * Pattern: INV-YYYY-XXXXXX (derived from orderNumber if exists, preserving existing issued number)
 */
export async function getOrGenerateInvoiceNumber(order: any): Promise<string> {
  if (order.invoiceNumber) {
    return order.invoiceNumber;
  }

  // Derive from order number if standard AVZ format
  const year = new Date().getFullYear();
  let baseNumber = '';
  if (order.orderNumber && order.orderNumber.includes('-')) {
    const parts = order.orderNumber.split('-');
    baseNumber = parts[parts.length - 1];
  } else {
    baseNumber = Math.floor(100000 + Math.random() * 900000).toString();
  }

  let candidate = `INV-${year}-${baseNumber}`;
  
  // Verify collision safety
  const existing = await Order.findOne({ invoiceNumber: candidate, _id: { $ne: order._id } });
  if (existing) {
    candidate = `INV-${year}-${baseNumber}-${Math.floor(10 + Math.random() * 90)}`;
  }

  return candidate;
}

/**
 * Generate a genuine A4 PDF invoice for an order using PDFKit
 */
export async function generateInvoicePdf({
  order,
  saveInvoiceNumber = true,
}: InvoiceGenerationOptions): Promise<{ pdfBuffer: Buffer; invoiceNumber: string }> {
  await connectToDatabase();

  // Load store settings
  const settings = await Settings.findOne({}).lean().catch(() => null);
  const storeName = settings?.storeName || 'AVEEZ FASHION';
  const supportEmail = settings?.supportEmail || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'fashionaveez@gmail.com';
  const supportPhone = settings?.supportPhone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+91 89551 09628';
  const storeWebsite = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aveezfashion.com';

  // Ensure unique invoice number
  let invoiceNumber = order.invoiceNumber;
  if (!invoiceNumber) {
    invoiceNumber = await getOrGenerateInvoiceNumber(order);
    if (saveInvoiceNumber && order._id) {
      try {
        await Order.findByIdAndUpdate(order._id, {
          invoiceNumber,
          invoiceIssuedAt: new Date(),
        });
        order.invoiceNumber = invoiceNumber;
        order.invoiceIssuedAt = new Date();
      } catch (err) {
        console.warn('Could not persist invoiceNumber to order:', err);
      }
    }
  }

  const invoiceDate = formatDate(order.invoiceIssuedAt || new Date());
  const orderDate = formatDate(order.createdAt);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `AVEEZ FASHION Invoice — ${invoiceNumber}`,
          Author: 'AVEEZ FASHION',
          Subject: `Retail Sales Invoice for Order ${order.orderNumber}`,
          Keywords: 'invoice, aveez, luxury fashion, streetwear, apparel',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve({ pdfBuffer: Buffer.concat(buffers), invoiceNumber }));
      doc.on('error', (err) => reject(err));

      const pageWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      const margin = 40;
      const contentWidth = pageWidth - margin * 2; // 515.28 pt

      // --- HEADER: LOGO & BRAND CONTACT ---
      // Prefer clean horizontal logo; fallback to primary logo
      const horizontalLogo = path.resolve('public/brand/horizontal-logo.png');
      const primaryLogo = path.resolve('public/brand/primary-logo.png');
      const logoPath = fs.existsSync(horizontalLogo) ? horizontalLogo : primaryLogo;
      const hasLogo = fs.existsSync(logoPath);

      let logoHeight = 35;
      const logoWidth = 155;

      if (hasLogo) {
        try {
          const img = (doc as any).openImage(logoPath);
          const naturalHeight = logoWidth * (img.height / img.width);
          if (naturalHeight > 55) {
            // Cap height to 50 if vertical logo is used
            const scaledW = (50 / img.height) * img.width;
            doc.image(logoPath, margin, margin, { width: scaledW, height: 50 });
            logoHeight = 50;
          } else {
            doc.image(logoPath, margin, margin, { width: logoWidth });
            logoHeight = naturalHeight;
          }
        } catch {
          doc.fontSize(20).font('Helvetica-Bold').fillColor('#0A0A0A').text(storeName, margin, margin);
          logoHeight = 25;
        }
      } else {
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#0A0A0A').text(storeName, margin, margin);
        logoHeight = 25;
      }

      // Brand Contact Info (Right Aligned, Explicit Coordinates)
      const brandInfoX = 330;
      const brandW = 225;
      let contactY = margin;

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#0A0A0A')
        .text('AVEEZ FASHION', brandInfoX, contactY, { width: brandW, align: 'right' });
      contactY += 13;

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#555555')
        .text('Luxury Streetwear & Handcrafted Essentials', brandInfoX, contactY, { width: brandW, align: 'right' });
      contactY += 12;

      doc.text(`Email: ${supportEmail}`, brandInfoX, contactY, { width: brandW, align: 'right' });
      contactY += 12;

      doc.text(`Phone: ${supportPhone}`, brandInfoX, contactY, { width: brandW, align: 'right' });
      contactY += 12;

      doc.text(
        `Web: ${storeWebsite.replace('https://', '').replace('http://', '')}`,
        brandInfoX,
        contactY,
        { width: brandW, align: 'right' }
      );
      contactY += 14;

      // Horizontal separator rule placed cleanly below the entire header block
      const headerBottom = Math.max(margin + logoHeight, contactY);
      const sepY = headerBottom + 10;

      doc
        .strokeColor('#E5E5E5')
        .lineWidth(1)
        .moveTo(margin, sepY)
        .lineTo(pageWidth - margin, sepY)
        .stroke();

      // --- INVOICE METADATA & TITLE ---
      const metaY = sepY + 12;
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#0A0A0A')
        .text('TAX INVOICE / RETAIL RECEIPT', margin, metaY);

      // Left Column Metadata
      let leftY = metaY + 22;
      const metaLineH = 14;

      doc.fontSize(8.5).font('Helvetica').fillColor('#666666').text('Invoice Number:', margin, leftY, { width: 85 });
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0A0A0A').text(invoiceNumber, margin + 85, leftY, { width: 160 });
      leftY += metaLineH;

      doc.fontSize(8.5).font('Helvetica').fillColor('#666666').text('Invoice Date:', margin, leftY, { width: 85 });
      doc.fontSize(8.5).font('Helvetica').fillColor('#111111').text(invoiceDate, margin + 85, leftY, { width: 160 });
      leftY += metaLineH;

      // Right Column Metadata (Clean 2-column key/value layout with zero overlap)
      const rightX = 330;
      const rightW = 225;
      let rightY = metaY + 22;

      doc.fontSize(8.5).font('Helvetica').fillColor('#666666').text('Order Number:', rightX, rightY, { width: 95 });
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0A0A0A').text(order.orderNumber, rightX + 95, rightY, { width: rightW - 95, align: 'right' });
      rightY += metaLineH;

      doc.fontSize(8.5).font('Helvetica').fillColor('#666666').text('Order Placed:', rightX, rightY, { width: 95 });
      doc.fontSize(8.5).font('Helvetica').fillColor('#111111').text(orderDate, rightX + 95, rightY, { width: rightW - 95, align: 'right' });
      rightY += metaLineH;

      doc.fontSize(8.5).font('Helvetica').fillColor('#666666').text('Payment Method:', rightX, rightY, { width: 95 });
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#111111').text(
        order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid Online',
        rightX + 95,
        rightY,
        { width: rightW - 95, align: 'right' }
      );
      rightY += metaLineH;

      doc.fontSize(8.5).font('Helvetica').fillColor('#666666').text('Payment Status:', rightX, rightY, { width: 95 });
      doc.fontSize(8.5).font('Helvetica-Bold')
        .fillColor(order.paymentStatus === 'PAID' ? '#166534' : '#854D0E')
        .text(order.paymentStatus || 'PENDING', rightX + 95, rightY, { width: rightW - 95, align: 'right' });
      rightY += metaLineH;

      // --- ADDRESS CARDS (BILLING & SHIPPING) ---
      const addressBoxY = Math.max(leftY, rightY) + 14;
      const colWidth = (contentWidth - 20) / 2;
      const boxHeight = 90;

      // Shipping Address Box
      doc
        .rect(margin, addressBoxY, colWidth, boxHeight)
        .strokeColor('#EEEEEE')
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#777777')
        .text('SHIPPING ADDRESS (DELIVERY DESTINATION)', margin + 10, addressBoxY + 10)
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#0A0A0A')
        .text(order.shippingAddress?.recipientName || order.customerName, margin + 10, addressBoxY + 24)
        .font('Helvetica')
        .fillColor('#444444')
        .text(
          [
            order.shippingAddress?.house,
            order.shippingAddress?.streetAddress,
            order.shippingAddress?.landmark,
          ]
            .filter(Boolean)
            .join(', '),
          margin + 10,
          addressBoxY + 37,
          { width: colWidth - 20, height: 26, ellipsis: true }
        )
        .text(
          `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} — ${order.shippingAddress?.pincode || ''}`,
          margin + 10,
          addressBoxY + 62
        )
        .text(`Phone: ${order.shippingAddress?.phone || order.customerPhone || 'N/A'}`, margin + 10, addressBoxY + 74);

      // Billing Address Box
      const billX = margin + colWidth + 20;
      doc
        .rect(billX, addressBoxY, colWidth, boxHeight)
        .strokeColor('#EEEEEE')
        .lineWidth(1)
        .stroke();

      const hasDistinctBilling =
        order.billingAddress &&
        order.billingAddress.streetAddress &&
        order.billingAddress.streetAddress !== order.shippingAddress?.streetAddress;

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#777777')
        .text('BILLING ADDRESS', billX + 10, addressBoxY + 10)
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#0A0A0A');

      if (hasDistinctBilling) {
        doc
          .text(order.billingAddress.recipientName || order.customerName, billX + 10, addressBoxY + 24)
          .font('Helvetica')
          .fillColor('#444444')
          .text(
            [
              order.billingAddress.house,
              order.billingAddress.streetAddress,
              order.billingAddress.landmark,
            ]
              .filter(Boolean)
              .join(', '),
            billX + 10,
            addressBoxY + 37,
            { width: colWidth - 20, height: 26, ellipsis: true }
          )
          .text(
            `${order.billingAddress.city || ''}, ${order.billingAddress.state || ''} — ${order.billingAddress.pincode || ''}`,
            billX + 10,
            addressBoxY + 62
          )
          .text(`Phone: ${order.billingAddress.phone || order.customerPhone || 'N/A'}`, billX + 10, addressBoxY + 74);
      } else {
        doc
          .text(order.customerName, billX + 10, addressBoxY + 24)
          .font('Helvetica')
          .fillColor('#555555')
          .text('Same as shipping address', billX + 10, addressBoxY + 37)
          .text(`Email: ${order.customerEmail}`, billX + 10, addressBoxY + 50)
          .text(`Phone: ${order.customerPhone || 'N/A'}`, billX + 10, addressBoxY + 64);
      }

      // --- ORDERED ITEMS TABLE ---
      let tableY = addressBoxY + boxHeight + 16;

      // Table Header Background
      doc
        .rect(margin, tableY, contentWidth, 20)
        .fillColor('#0A0A0A')
        .fill();

      // Table Headers
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF');
      doc.text('#', margin + 6, tableY + 6, { width: 20 });
      doc.text('ITEM DESCRIPTION', margin + 30, tableY + 6, { width: 230 });
      doc.text('SIZE/COLOUR', margin + 265, tableY + 6, { width: 90 });
      doc.text('QTY', margin + 360, tableY + 6, { width: 35, align: 'center' });
      doc.text('UNIT PRICE', margin + 395, tableY + 6, { width: 60, align: 'right' });
      doc.text('TOTAL', margin + 455, tableY + 6, { width: 55, align: 'right' });

      tableY += 20;

      // Table Rows
      const items = order.items || [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Page break safety check
        if (tableY > pageHeight - 160) {
          doc.addPage();
          tableY = margin;

          // Re-render header on new page
          doc
            .rect(margin, tableY, contentWidth, 20)
            .fillColor('#0A0A0A')
            .fill();
          doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF');
          doc.text('#', margin + 6, tableY + 6, { width: 20 });
          doc.text('ITEM DESCRIPTION', margin + 30, tableY + 6, { width: 230 });
          doc.text('SIZE/COLOUR', margin + 265, tableY + 6, { width: 90 });
          doc.text('QTY', margin + 360, tableY + 6, { width: 35, align: 'center' });
          doc.text('UNIT PRICE', margin + 395, tableY + 6, { width: 60, align: 'right' });
          doc.text('TOTAL', margin + 455, tableY + 6, { width: 55, align: 'right' });
          tableY += 20;
        }

        const rowHeight = 28;
        // Alternating zebra stripe
        if (i % 2 === 1) {
          doc
            .rect(margin, tableY, contentWidth, rowHeight)
            .fillColor('#F9F9F9')
            .fill();
        }

        // Bottom border
        doc
          .strokeColor('#EEEEEE')
          .lineWidth(0.5)
          .moveTo(margin, tableY + rowHeight)
          .lineTo(pageWidth - margin, tableY + rowHeight)
          .stroke();

        doc.fontSize(8).font('Helvetica').fillColor('#555555');
        doc.text(String(i + 1), margin + 6, tableY + 7, { width: 20 });

        doc.font('Helvetica-Bold').fillColor('#111111');
        doc.text(item.title, margin + 30, tableY + 5, { width: 230, ellipsis: true });
        if (item.variantSku) {
          doc.fontSize(7).font('Helvetica').fillColor('#777777').text(`SKU: ${item.variantSku}`, margin + 30, tableY + 16);
        }

        doc.fontSize(8).font('Helvetica').fillColor('#333333');
        const variantDesc = [item.size, item.color].filter(Boolean).join(' / ') || 'Standard';
        doc.text(variantDesc, margin + 265, tableY + 7, { width: 90 });

        doc.text(String(item.quantity || 1), margin + 360, tableY + 7, { width: 35, align: 'center' });
        doc.text(`Rs. ${Number(item.unitPrice || 0).toLocaleString('en-IN')}`, margin + 395, tableY + 7, {
          width: 60,
          align: 'right',
        });
        doc.font('Helvetica-Bold').fillColor('#0A0A0A');
        doc.text(`Rs. ${Number(item.totalPrice || item.unitPrice * item.quantity).toLocaleString('en-IN')}`, margin + 455, tableY + 7, {
          width: 55,
          align: 'right',
        });

        tableY += rowHeight;
      }

      // --- FINANCIAL BREAKDOWN & TOTALS ---
      let totalsY = tableY + 15;
      if (totalsY > pageHeight - 140) {
        doc.addPage();
        totalsY = margin;
      }

      const totalsBoxWidth = 230;
      const totalsX = pageWidth - margin - totalsBoxWidth;

      const subtotal = order.pricing?.subtotal || items.reduce((s: number, i: any) => s + (i.totalPrice || 0), 0);
      const discount = order.pricing?.discountTotal || 0;
      const tax = order.pricing?.taxTotal || 0;
      const shipping = order.pricing?.shippingFee || 0;
      const grandTotal = order.pricing?.grandTotal || (subtotal - discount + tax + shipping);

      // Notes on left column
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#0A0A0A')
        .text('TERMS & CONDITIONS', margin, totalsY)
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor('#666666')
        .text(
          '1. All goods sold are subject to Aveez Fashion 7-day return & exchange policy.\n' +
            '2. Items must remain unused, unworn, and unwashed with original security tags attached.\n' +
            '3. For tracking and support inquiries, write to support@aveezfashion.com.',
          margin,
          totalsY + 14,
          { width: 250 }
        );

      // Financial lines on right
      let lineY = totalsY;
      const renderTotalLine = (label: string, val: string, bold = false) => {
        doc
          .fontSize(8.5)
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor(bold ? '#0A0A0A' : '#555555')
          .text(label, totalsX, lineY, { width: 115 })
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor(bold ? '#0A0A0A' : '#333333')
          .text(val, totalsX + 115, lineY, { width: 115, align: 'right' });
        lineY += 13;
      };

      renderTotalLine('Subtotal:', `Rs. ${subtotal.toLocaleString('en-IN')}`);
      if (discount > 0) {
        renderTotalLine('Discount Applied:', `-Rs. ${discount.toLocaleString('en-IN')}`);
      }
      renderTotalLine('Estimated Shipping:', shipping === 0 ? 'FREE' : `Rs. ${shipping.toLocaleString('en-IN')}`);
      if (tax > 0) {
        renderTotalLine('Applicable GST/Tax:', `Rs. ${tax.toLocaleString('en-IN')}`);
      }

      // Grand Total Highlight Bar
      lineY += 2;
      const grandTotalBarY = lineY;
      doc
        .rect(totalsX, grandTotalBarY, totalsBoxWidth, 24)
        .fillColor('#0A0A0A')
        .fill();

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#FFFFFF')
        .text('GRAND TOTAL:', totalsX + 10, grandTotalBarY + 7, { width: 105 })
        .text(`Rs. ${grandTotal.toLocaleString('en-IN')}`, totalsX + 105, grandTotalBarY + 7, {
          width: totalsBoxWidth - 115,
          align: 'right',
        });

      // --- FOOTER & BRAND SIGN-OFF ---
      const footerY = pageHeight - margin - 35;
      doc
        .strokeColor('#E5E5E5')
        .lineWidth(1)
        .moveTo(margin, footerY)
        .lineTo(pageWidth - margin, footerY)
        .stroke();

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#0A0A0A')
        .text(
          'THANK YOU FOR CHOOSING AVEEZ FASHION',
          margin,
          footerY + 10,
          { width: contentWidth, align: 'center' }
        )
        .fontSize(7)
        .font('Helvetica')
        .fillColor('#777777')
        .text(
          'Contemporary Streetwear & Handcrafted Essentials • Uncompromising Quality & Fit • www.aveezfashion.com',
          margin,
          footerY + 22,
          { width: contentWidth, align: 'center' }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
