import React from 'react';
import Link from 'next/link';
import {
  Truck,
  ShieldCheck,
  Clock,
  MapPin,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Shipping & Delivery Policy | Aveez Fashion',
  description:
    'Comprehensive delivery guidelines for Aveez Fashion orders across India. Dispatch timelines, shipping charges, tracking, and Cash on Delivery.',
};

export default function ShippingDeliveryPage() {
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
          LOGISTICS & FULFILLMENT
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
          SHIPPING & DELIVERY
        </h1>
        <p style={{ color: 'var(--color-gray-600)', fontSize: '1rem', maxWidth: '580px', margin: '0 auto' }}>
          Every Aveez Fashion piece is inspected, hand-steamed, and securely packaged at our central atelier before dispatch. Learn about our delivery network and shipping commitments.
        </p>
      </div>

      {/* Highlights Grid */}
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
          <Truck size={32} color="var(--color-black-pure)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>FREE DELIVERY</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', margin: 0, lineHeight: 1.5 }}>
            Complimentary shipping on all orders of ₹2,499 and above. Flat ₹99 delivery fee for orders below threshold.
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
          <Clock size={32} color="var(--color-black-pure)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>24-48 HR DISPATCH</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', margin: 0, lineHeight: 1.5 }}>
            Orders are processed, quality-verified, and handed over to premier courier partners within 24 to 48 business hours.
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
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>TAMPER-PROOF PACKAGING</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', margin: 0, lineHeight: 1.5 }}>
            Shipments are sealed in branded, moisture-resistant luxury boxes with unique serialized security tape.
          </p>
        </div>
      </div>

      {/* Policy Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <section
          style={{
            backgroundColor: 'var(--color-white-pure)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '2rem',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.375rem', marginBottom: '1rem' }}>
            1. ESTIMATED DELIVERY TIMELINES
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)', lineHeight: 1.6, marginBottom: '1rem' }}>
            We partner with reliable logistics networks to ensure rapid, dependable fulfillment across India:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-white-off)', borderRadius: 'var(--radius-xs)' }}>
              <strong>Tier 1 Metro Cities</strong>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', marginTop: '4px' }}>
                Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune: <strong>2 to 4 business days</strong>.
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--color-white-off)', borderRadius: 'var(--radius-xs)' }}>
              <strong>Tier 2 & Regional Hubs</strong>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', marginTop: '4px' }}>
                State capitals and major commercial centers across India: <strong>4 to 6 business days</strong>.
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--color-white-off)', borderRadius: 'var(--radius-xs)' }}>
              <strong>Remote & Special Zones</strong>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', marginTop: '4px' }}>
                Northeastern regions, Jammu & Kashmir, and remote pincodes: <strong>5 to 8 business days</strong>.
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            backgroundColor: 'var(--color-white-pure)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '2rem',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.375rem', marginBottom: '1rem' }}>
            2. CASH ON DELIVERY (COD) PROTOCOL
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
            Cash on Delivery is available across serviceable pin codes in India for orders up to ₹10,000. Our logistics partners require exact payment in Indian Rupees upon delivery. For security and anti-fraud compliance, high-value COD orders may receive an automated confirmation prompt prior to dispatch.
          </p>
        </section>

        <section
          style={{
            backgroundColor: 'var(--color-white-pure)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '2rem',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.375rem', marginBottom: '1rem' }}>
            3. SHIPMENT TRACKING & ADDRESS ADJUSTMENTS
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
            Once dispatched, you will receive an SMS and email notification with your official Courier AWB tracking number. You can monitor your shipment directly at our{' '}
            <Link href="/track-order" style={{ textDecoration: 'underline', fontWeight: 600 }}>
              Track Your Order portal
            </Link>
            . If you need to correct an address before your parcel leaves our fulfillment center, please contact support immediately at{' '}
            <a href="mailto:support@aveezfashion.com" style={{ textDecoration: 'underline' }}>
              support@aveezfashion.com
            </a>
            .
          </p>
        </section>

        {/* Quick Links Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-white-off)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Track an existing parcel?</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--color-gray-600)' }}>
              Access status timelines, courier partners, and live dispatch updates.
            </p>
          </div>
          <Link href="/track-order">
            <Button variant="primary" size="md">
              TRACK MY SHIPMENT
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
