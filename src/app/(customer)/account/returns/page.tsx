'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AccountNav } from '@/components/customer/AccountNav';

export default function CustomerReturnsPage() {
  const router = useRouter();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReturns() {
      try {
        const res = await fetch('/api/user/returns');
        if (res.status === 401) {
          router.push('/login?redirect=/account/returns');
          return;
        }
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.returns)) {
          setReturns(data.data.returns);
        }
      } catch {
        // error handling
      } finally {
        setLoading(false);
      }
    }
    loadReturns();
  }, [router]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-3xl) var(--container-padding)' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'var(--font-size-h2)',
            letterSpacing: 'var(--letter-spacing-tight)',
            margin: 0,
          }}
        >
          RETURNS & EXCHANGES
        </h1>
        <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem', marginTop: '4px' }}>
          Monitor your active return approvals, reverse pickup scheduling, and 7-day refund disbursements.
        </p>
      </div>

      <AccountNav />

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
          Loading your return requests...
        </div>
      ) : returns.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--color-white-pure)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <RotateCcw size={44} color="var(--color-gray-400)" />
          <div>
            <h3 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.25rem', margin: 0 }}>
              NO ACTIVE RETURN REQUESTS
            </h3>
            <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem', marginTop: '4px', maxWidth: '400px' }}>
              You do not have any open return or exchange requests. Eligible delivered orders can be returned within 7 calendar days.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/account/orders">
              <Button variant="primary" size="md">
                CHECK ORDER ELIGIBILITY
              </Button>
            </Link>
            <Link href="/returns-exchanges">
              <Button variant="outline" size="md">
                READ RETURN POLICY
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {returns.map((item) => {
            const isApproved = item.status === 'APPROVED' || item.status === 'COMPLETED';
            const isRejected = item.status === 'REJECTED';

            return (
              <div
                key={item.requestId}
                style={{
                  backgroundColor: 'var(--color-white-pure)',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    borderBottom: '1px solid var(--color-gray-100)',
                    paddingBottom: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', letterSpacing: '0.05em' }}>
                      REQUEST ID
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-family-mono)', fontSize: '1rem', margin: '2px 0 0' }}>
                      {item.requestId}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        padding: '3px 8px',
                        borderRadius: '2px',
                        backgroundColor: isApproved
                          ? '#ECFDF5'
                          : isRejected
                          ? '#FEF2F2'
                          : '#FFFBEB',
                        color: isApproved
                          ? '#059669'
                          : isRejected
                          ? '#DC2626'
                          : '#B45309',
                      }}
                    >
                      {item.status}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '2px',
                        backgroundColor: 'var(--color-gray-100)',
                        color: 'var(--color-gray-700)',
                      }}
                    >
                      {item.type}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)' }}>
                      Related Order:{' '}
                      <Link
                        href={`/account/orders/${encodeURIComponent(item.orderNumber)}`}
                        style={{ fontWeight: 700, color: 'var(--color-black-pure)', textDecoration: 'underline' }}
                      >
                        {item.orderNumber}
                      </Link>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', marginTop: '4px' }}>
                      Reason: <strong>{item.reason}</strong>
                    </div>

                    {/* Pieces */}
                    <div style={{ marginTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gray-500)' }}>
                        REQUESTED PIECES:
                      </span>
                      <ul style={{ margin: '4px 0 0', paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
                        {item.items?.map((piece: any, idx: number) => (
                          <li key={idx}>
                            {piece.title} (Size: {piece.size}
                            {piece.exchangeSize ? ` → Exchange to: ${piece.exchangeSize}` : ''}, Qty:{' '}
                            {piece.quantity})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'var(--color-white-off)',
                      border: '1px solid var(--color-gray-200)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                      REFUND TELEMETRY
                    </span>
                    <div>
                      Status: <strong>{item.refundStatus || 'PENDING'}</strong>
                    </div>
                    {item.refundAmount > 0 && (
                      <div>
                        Amount: <strong>₹{item.refundAmount.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                      Guaranteed processing timeline: within 7 calendar days after inspection.
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--color-gray-100)',
                    paddingTop: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                    Last updated on{' '}
                    {new Date(item.updatedAt || item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <Link href={`/contact?orderNumber=${encodeURIComponent(item.orderNumber)}`}>
                    <Button variant="ghost" size="sm">
                      <HelpCircle size={14} style={{ marginRight: '4px' }} />
                      CONTACT SUPPORT
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
