import React from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Package,
  Truck,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Returns & Exchanges Guide | Aveez Fashion',
  description:
    'Our transparent 7-calendar-day return and exchange policy. Guaranteed inspection and 7-day refund processing timeline.',
};

export default function ReturnsExchangesPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '3.5rem var(--container-padding) 5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-gray-500)',
          }}
        >
          AVEEZ ATELIER COMMITMENT
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '2.5rem',
            letterSpacing: '-0.02em',
            marginTop: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          RETURNS & EXCHANGES
        </h1>
        <p style={{ color: 'var(--color-gray-600)', fontSize: '1rem', maxWidth: '580px', margin: '0 auto' }}>
          We want you to feel confident in every Aveez Fashion piece. If the fit, fabric, or style does not meet your expectations, our dedicated return concierge is here to assist.
        </p>
      </div>

      {/* 3 Pillars Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--color-white-pure)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '1.75rem',
            textAlign: 'center',
          }}
        >
          <Clock size={32} color="var(--color-black-pure)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>7-DAY WINDOW</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', margin: 0, lineHeight: 1.5 }}>
            Submit a return or size exchange request within 7 calendar days of confirmed delivery.
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-white-pure)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '1.75rem',
            textAlign: 'center',
          }}
        >
          <RotateCcw size={32} color="var(--color-black-pure)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>SIZE EXCHANGES</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', margin: 0, lineHeight: 1.5 }}>
            Complimentary reverse pickup and replacement dispatch for all standard size adjustments.
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-white-pure)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '1.75rem',
            textAlign: 'center',
          }}
        >
          <ShieldCheck size={32} color="#059669" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>7-DAY REFUND TIMELINE</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', margin: 0, lineHeight: 1.5 }}>
            Refunds are credited to your original payment method within a maximum of 7 calendar days.
          </p>
        </div>
      </div>

      {/* Detailed Policy Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Section 1 */}
        <section
          style={{
            backgroundColor: 'var(--color-white-pure)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '2rem',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.375rem', marginBottom: '1rem' }}>
            1. ELIGIBILITY & GARMENT CONDITION
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)', lineHeight: 1.6, marginBottom: '1rem' }}>
            To protect our artisanal standards and ensure safety for all clients, items submitted for return or exchange must satisfy the following strict criteria:
          </p>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--color-gray-700)', lineHeight: 1.7 }}>
            <li>Garments must be entirely unworn, unaltered, and unwashed.</li>
            <li>All original Aveez Fashion woven security tags and labels must remain intact and untampered.</li>
            <li>Items must be returned in their original packaging, including dust bags and garment covers.</li>
            <li>Footwear and accessories, when offered, must have pristine unblemished soles and finishes.</li>
            <li>Undergarments and custom bespoke pieces are final sale for hygiene and exclusivity reasons.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section
          style={{
            backgroundColor: 'var(--color-white-pure)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '2rem',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.375rem', marginBottom: '1rem' }}>
            2. STEP-BY-STEP RETURN & EXCHANGE PROCESS
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div style={{ borderLeft: '2px solid var(--color-black-pure)', paddingLeft: '1rem' }}>
              <strong style={{ fontSize: '0.875rem' }}>Step 1: File Request</strong>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', margin: '4px 0 0' }}>
                Navigate to your account orders and click &quot;Return / Exchange&quot; next to the delivered piece.
              </p>
            </div>

            <div style={{ borderLeft: '2px solid var(--color-black-pure)', paddingLeft: '1rem' }}>
              <strong style={{ fontSize: '0.875rem' }}>Step 2: Reverse Pickup</strong>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', margin: '4px 0 0' }}>
                Our logistics partner arrives at your address within 48–72 hours to collect the packaged garment.
              </p>
            </div>

            <div style={{ borderLeft: '2px solid var(--color-black-pure)', paddingLeft: '1rem' }}>
              <strong style={{ fontSize: '0.875rem' }}>Step 3: Atelier Inspection</strong>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', margin: '4px 0 0' }}>
                Our quality control team inspects garment fabric, seams, and tags upon warehouse receipt.
              </p>
            </div>

            <div style={{ borderLeft: '2px solid var(--color-black-pure)', paddingLeft: '1rem' }}>
              <strong style={{ fontSize: '0.875rem' }}>Step 4: Refund Disbursement</strong>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', margin: '4px 0 0' }}>
                Prepaid orders are credited to original payment source within 7 calendar days. COD orders receive bank transfer.
              </p>
            </div>
          </div>
        </section>

        {/* Action Callout */}
        <div
          style={{
            backgroundColor: 'var(--color-black-rich)',
            color: 'var(--color-white-pure)',
            borderRadius: 'var(--radius-xs)',
            padding: '2.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.5rem', margin: 0 }}>
            READY TO RAISE A RETURN OR EXCHANGE?
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-400)', maxWidth: '480px', margin: 0 }}>
            Sign in to your customer dashboard to select eligible delivered items and initiate immediate reverse pickup.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <Link href="/account/orders">
              <Button variant="secondary" size="md">
                <span>VIEW MY DELIVERED ORDERS</span>
                <ArrowRight size={16} style={{ marginLeft: 6 }} />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="md" style={{ color: 'var(--color-white-pure)', borderColor: 'var(--color-gray-600)' }}>
                CONTACT CONCIERGE
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
