import fs from 'fs';
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

import { generateInvoicePdf } from '@/server/services/invoiceService';

const mockOrder = {
  orderNumber: 'AVZ-2026-999999',
  invoiceNumber: 'INV-2026-999999',
  createdAt: new Date(),
  invoiceIssuedAt: new Date(),
  customerName: 'Test Customer',
  customerEmail: 'test@example.com',
  customerPhone: '+91 9999999999',
  shippingAddress: {
    fullName: 'Test Customer',
    addressLine1: '123 Fashion Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
  },
  items: [
    {
      title: 'Premium Boxy Fit Tee',
      size: 'L',
      color: 'White',
      quantity: 1,
      unitPrice: 1999,
      totalPrice: 1999,
    },
  ],
  pricing: {
    subtotal: 1999,
    discount: 0,
    shippingFee: 0,
    codFee: 0,
    gstAmount: 240,
    grandTotal: 1999,
  },
  payment: {
    method: 'PREPAID',
    status: 'PAID',
  },
  status: 'DELIVERED',
};

async function main() {
  const res = await generateInvoicePdf({ order: mockOrder, saveInvoiceNumber: false });
  console.log('RESULT: Generated PDF successfully! Size:', res.pdfBuffer.length, 'bytes');
  process.exit(0);
}

main().catch((err) => {
  console.error('ERROR:', err);
  process.exit(1);
});
