'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AccountNav } from '@/components/customer/AccountNav';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function OrderReturnRequestPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [requestType, setRequestType] = useState<'RETURN' | 'EXCHANGE'>('RETURN');
  const [selectedItems, setSelectedItems] = useState<{ [variantSku: string]: boolean }>({});
  const [exchangeSizes, setExchangeSizes] = useState<{ [variantSku: string]: string }>({});
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<any>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        if (res.status === 401) {
          router.push(`/login?redirect=/account/orders/${encodeURIComponent(orderId)}/return`);
          return;
        }
        const data = await res.json();
        if (data.success && data.data?.order) {
          const ord = data.data.order;
          setOrder(ord);

          // Check eligibility
          if (!ord.isReturnEligible && ord.fulfillmentStatus === 'DELIVERED') {
            setError(
              'The 7-calendar-day return window for this order has passed, or a request has already been filed.'
            );
          } else if (ord.fulfillmentStatus !== 'DELIVERED') {
            setError('Returns can only be raised for orders marked as DELIVERED.');
          }

          // Pre-select first item
          if (ord.items && ord.items.length > 0) {
            setSelectedItems({ [ord.items[0].variantSku]: true });
          }
        } else {
          setError(data.error || 'Failed to load order.');
        }
      } catch (err: any) {
        setError(err.message || 'Network error fetching order.');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId, router]);

  const toggleItem = (sku: string) => {
    setSelectedItems((prev) => ({ ...prev, [sku]: !prev[sku] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      alert('Please choose a reason for your request.');
      return;
    }

    const itemsToSubmit = order.items
      .filter((item: any) => selectedItems[item.variantSku])
      .map((item: any) => ({
        productId: item.product,
        variantSku: item.variantSku,
        title: item.title,
        size: item.size,
        exchangeSize: requestType === 'EXCHANGE' ? exchangeSizes[item.variantSku] || 'M' : undefined,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

    if (itemsToSubmit.length === 0) {
      alert('Please select at least one piece to return or exchange.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.orderNumber)}/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: requestType,
          items: itemsToSubmit,
          reason,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit return request.');
      }

      setSubmitSuccess(data.data?.returnRequest);
    } catch (err: any) {
      setError(err.message || 'Error submitting return request.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
          Verifying order eligibility for returns...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: 'var(--space-3xl) var(--container-padding)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          href={`/account/orders/${encodeURIComponent(orderId)}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--color-gray-600)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          <span>BACK TO ORDER {order?.orderNumber}</span>
        </Link>
      </div>

      <AccountNav />

      {submitSuccess ? (
        <div
          style={{
            backgroundColor: 'var(--color-white-pure)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '3rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <CheckCircle2 size={48} color="#059669" />
          <h1 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.75rem', margin: 0 }}>
            REQUEST SUBMITTED SUCCESSFULLY
          </h1>
          <p style={{ color: 'var(--color-gray-600)', fontSize: '0.9375rem', maxWidth: '500px', lineHeight: 1.5 }}>
            Your reference number is{' '}
            <strong style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-black-pure)' }}>
              {submitSuccess.requestId}
            </strong>
            . Our inspection atelier will review your request within 24–48 hours and schedule reverse pickup.
          </p>

          <div
            style={{
              backgroundColor: 'var(--color-white-off)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-xs)',
              padding: '1.25rem',
              maxWidth: '500px',
              width: '100%',
              fontSize: '0.8125rem',
              color: 'var(--color-gray-700)',
              textAlign: 'left',
              lineHeight: 1.5,
            }}
          >
            <strong>Reverse Pickup Protocol:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: '1.25rem' }}>
              <li>Keep the garment unworn, unwashed with all Aveez brand tags intact.</li>
              <li>Include the original luxury packaging and garment dust bag.</li>
              <li>Refund processing is guaranteed within 7 calendar days after inspection.</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Link href="/account/returns">
              <Button variant="primary" size="md">
                VIEW MY RETURNS
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" size="md">
                CONTINUE SHOPPING
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: 'var(--color-white-pure)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
          }}
        >
          {/* Header */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
              7-CALENDAR-DAY RETURN & EXCHANGE WINDOW
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '1.75rem',
                margin: '4px 0 0',
                letterSpacing: '-0.02em',
              }}
            >
              REQUEST RETURN OR EXCHANGE
            </h1>
            <p style={{ color: 'var(--color-gray-600)', fontSize: '0.875rem', marginTop: '6px' }}>
              Order: <strong style={{ fontFamily: 'var(--font-family-mono)' }}>{order?.orderNumber}</strong>
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Request Type Toggle */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              SELECT REQUEST TYPE
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label
                style={{
                  border: `2px solid ${requestType === 'RETURN' ? 'var(--color-black-pure)' : 'var(--color-gray-200)'}`,
                  borderRadius: 'var(--radius-xs)',
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: requestType === 'RETURN' ? 'var(--color-white-off)' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="requestType"
                  value="RETURN"
                  checked={requestType === 'RETURN'}
                  onChange={() => setRequestType('RETURN')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <strong>RETURN FOR REFUND</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--color-gray-600)' }}>
                    Refund processed to original payment method within 7 days of inspection.
                  </p>
                </div>
              </label>

              <label
                style={{
                  border: `2px solid ${requestType === 'EXCHANGE' ? 'var(--color-black-pure)' : 'var(--color-gray-200)'}`,
                  borderRadius: 'var(--radius-xs)',
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: requestType === 'EXCHANGE' ? 'var(--color-white-off)' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="requestType"
                  value="EXCHANGE"
                  checked={requestType === 'EXCHANGE'}
                  onChange={() => setRequestType('EXCHANGE')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <strong>SIZE EXCHANGE</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--color-gray-600)' }}>
                    Exchange for a different size of the same luxury piece.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Item Checklist */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              SELECT PIECES TO INCLUDE
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order?.items?.map((item: any) => {
                const isSelected = !!selectedItems[item.variantSku];

                return (
                  <div
                    key={item.variantSku}
                    style={{
                      border: `1px solid ${isSelected ? 'var(--color-black-pure)' : 'var(--color-gray-200)'}`,
                      borderRadius: 'var(--radius-xs)',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(item.variantSku)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      {item.image && (
                        <div
                          style={{
                            width: '48px',
                            height: '64px',
                            position: 'relative',
                            borderRadius: 'var(--radius-xs)',
                            overflow: 'hidden',
                          }}
                        >
                          <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} />
                        </div>
                      )}
                      <div>
                        <strong>{item.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                          Current Size: {item.size} • Qty: {item.quantity} • ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {requestType === 'EXCHANGE' && isSelected && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>NEW SIZE:</span>
                        <select
                          value={exchangeSizes[item.variantSku] || item.size}
                          onChange={(e) =>
                            setExchangeSizes((prev) => ({ ...prev, [item.variantSku]: e.target.value }))
                          }
                          style={{
                            height: '36px',
                            padding: '0 8px',
                            border: '1px solid var(--color-gray-300)',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '0.8125rem',
                          }}
                        >
                          {SIZES.map((sz) => (
                            <option key={sz} value={sz}>
                              {sz}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label
              htmlFor="reason"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              PRIMARY REASON
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{
                width: '100%',
                height: '44px',
                padding: '0 12px',
                border: '1px solid var(--color-gray-300)',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.875rem',
              }}
            >
              <option value="">-- Select a reason --</option>
              <option value="Incorrect size / Fit too tight">Incorrect size / Fit too tight</option>
              <option value="Incorrect size / Fit too loose">Incorrect size / Fit too loose</option>
              <option value="Fabric quality not as expected">Fabric quality not as expected</option>
              <option value="Defective or damaged garment">Defective or damaged garment</option>
              <option value="Item does not match photography">Item does not match photography</option>
              <option value="Received wrong item or color">Received wrong item or color</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              ADDITIONAL ATELIER NOTES (OPTIONAL)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe any specific fit or fabric details..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-gray-300)',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Policy Agreement */}
          <div
            style={{
              backgroundColor: 'var(--color-white-off)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-xs)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.75rem',
              color: 'var(--color-gray-600)',
            }}
          >
            <ShieldCheck size={18} color="#059669" />
            <span>
              By submitting this request, you confirm that garments are in original unworn condition with tags attached. Refunds are processed within 7 calendar days after inspection approval.
            </span>
          </div>

          <Button type="submit" variant="primary" size="lg" disabled={submitting || !!error}>
            {submitting ? 'SUBMITTING REQUEST...' : 'SUBMIT RETURN / EXCHANGE REQUEST'}
          </Button>
        </form>
      )}
    </div>
  );
}
