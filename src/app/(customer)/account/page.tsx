import React from 'react';
import Link from 'next/link';
import { Package, User, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AccountPage() {
  const customer = {
    name: 'Arjun Mehta',
    email: 'arjun.mehta@example.com',
    phone: '+91 98765 43210',
    joined: 'October 2026',
  };

  const orders = [
    {
      orderNumber: 'AVZ-2026-004812',
      date: '07 Oct 2026',
      total: '₹3,499',
      items: 'Signature Boxy Heavyweight Hoodie (Size L)',
      status: 'PROCESSING',
      trackingUrl: '#',
    },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-3xl) var(--container-padding)' }}>
      <div style={{ borderBottom: '1px solid var(--color-gray-200)', paddingBottom: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
        <h1 style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--font-size-h2)', letterSpacing: 'var(--letter-spacing-tight)' }}>
          MY ACCOUNT
        </h1>
        <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-gray-500)', letterSpacing: 'var(--letter-spacing-wide)' }}>
          MEMBER SINCE {customer.joined.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-3xl)' }}>
        {/* Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <div style={{ backgroundColor: 'var(--color-white-off)', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-xs)', padding: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
              <User size={18} />
              <h2 style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 'bold', letterSpacing: 'var(--letter-spacing-wide)' }}>
                CUSTOMER PROFILE
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--font-size-body-sm)', color: 'var(--color-gray-700)' }}>
              <strong>{customer.name}</strong>
              <span>{customer.email}</span>
              <span>{customer.phone}</span>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-white-off)', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-xs)', padding: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
              <MapPin size={18} />
              <h2 style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 'bold', letterSpacing: 'var(--letter-spacing-wide)' }}>
                DEFAULT ADDRESS
              </h2>
            </div>
            <p style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-gray-600)', lineHeight: '1.5' }}>
              Flat 402, Skyline Residency, MG Road<br />
              Bengaluru, Karnataka - 560001<br />
              India
            </p>
          </div>
        </div>

        {/* Order History */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-lg)' }}>
            <Package size={20} />
            <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--font-size-h3)' }}>
              ORDER HISTORY ({orders.length})
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {orders.map((ord) => (
              <div
                key={ord.orderNumber}
                style={{
                  backgroundColor: 'var(--color-white-pure)',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: 'var(--radius-xs)',
                  padding: 'var(--space-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <strong style={{ fontSize: 'var(--font-size-body-sm)', letterSpacing: 'var(--letter-spacing-wide)' }}>
                      {ord.orderNumber}
                    </strong>
                    <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-gray-500)' }}>
                      Placed on {ord.date}
                    </div>
                  </div>
                  <Badge variant="default">{ord.status}</Badge>
                </div>

                <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-gray-700)', padding: 'var(--space-xs) 0' }}>
                  {ord.items}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-sm)' }}>
                  <span style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 'bold' }}>
                    TOTAL: {ord.total}
                  </span>
                  <Link href={ord.trackingUrl} style={{ fontSize: 'var(--font-size-caption)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span>TRACK SHIPMENT</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
