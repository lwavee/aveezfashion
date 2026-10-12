'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  MapPin,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        const json = await res.json();
        if (json.success && json.data?.order) {
          setOrder(json.data.order);
        } else {
          setError(json.error || 'Unable to retrieve order details.');
        }
      } catch (err: any) {
        setError(err.message || 'Network error fetching order confirmation.');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ maxWidth: '680px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
          Retrieving verified order confirmation...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: '680px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <AlertCircle size={44} color="#DC2626" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          ORDER NOT FOUND
        </h1>
        <p style={{ color: 'var(--color-gray-600)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {error || 'We could not locate the requested order.'}
        </p>
        <Link href="/shop">
          <Button variant="primary" size="md">
            EXPLORE OUR CATALOG
          </Button>
        </Link>
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'PAID';
  const isCOD = order.paymentMethod === 'COD';
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div style={{ maxWidth: '720px', margin: '2rem auto', padding: '0 var(--container-padding) 4rem' }}>
      <div
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
        {/* Header with Monogram */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
          <Logo variant="clothing-label" width={70} height={96} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', marginTop: '0.5rem' }}>
            <CheckCircle2 size={28} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.1em' }}>
              VERIFIED ORDER
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '2rem',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            ORDER CONFIRMED
          </h1>
          <span
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '0.875rem',
              color: 'var(--color-gray-600)',
            }}
          >
            REF: {order.orderNumber} • {orderDate}
          </span>
        </div>

        {/* Status Callout */}
        <div
          style={{
            backgroundColor: 'var(--color-white-off)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '1.25rem',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            color: 'var(--color-gray-700)',
          }}
        >
          {isCOD ? (
            <p style={{ margin: 0 }}>
              Your order has been confirmed for <strong>Cash on Delivery</strong>. Our team will verify the delivery address and dispatch your items. Please keep exact cash ready upon arrival.
            </p>
          ) : isPaid ? (
            <p style={{ margin: 0 }}>
              Payment confirmed successfully. Your pieces have been sent to our fulfillment atelier for quality inspection, steaming, and secure tamper-proof packaging.
            </p>
          ) : (
            <p style={{ margin: 0, color: '#D97706' }}>
              Order placed. Payment status is currently <strong>PENDING</strong>. Once confirmed by your payment provider, your order will be scheduled for immediate dispatch.
            </p>
          )}
        </div>

        {/* Items Summary */}
        <div>
          <h2
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderBottom: '1px solid var(--color-gray-200)',
              paddingBottom: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            PURCHASED PIECES ({order.items.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order.items.map((item: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid var(--color-gray-100)',
                }}
              >
                {item.image && (
                  <div
                    style={{
                      width: '56px',
                      height: '74px',
                      position: 'relative',
                      backgroundColor: 'var(--color-gray-100)',
                      borderRadius: 'var(--radius-xs)',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                    SIZE: {item.size} • QTY: {item.quantity}
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery & Payment Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            borderTop: '1px solid var(--color-gray-200)',
            paddingTop: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
              <MapPin size={16} />
              <strong style={{ fontSize: '0.8125rem', letterSpacing: '0.05em' }}>SHIPPING DESTINATION</strong>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', lineHeight: 1.5 }}>
              {order.shippingAddress.house && `${order.shippingAddress.house}, `}
              {order.shippingAddress.streetAddress}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              <br />
              Recipient: {order.customerName} ({order.customerPhone})
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
              <CreditCard size={16} />
              <strong style={{ fontSize: '0.8125rem', letterSpacing: '0.05em' }}>PAYMENT METHOD</strong>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', lineHeight: 1.5 }}>
              {isCOD ? 'Cash on Delivery (COD)' : 'Prepaid Online Payment'}
              <br />
              Status: <span style={{ fontWeight: 600, color: isPaid ? '#059669' : 'inherit' }}>{order.paymentStatus}</span>
              <br />
              Total Amount: <strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Link href={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`}>
            <Button variant="primary" size="lg" fullWidth>
              <Truck size={16} style={{ marginRight: '8px' }} />
              TRACK YOUR SHIPMENT
            </Button>
          </Link>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Link href="/account/orders">
              <Button variant="outline" size="md" fullWidth>
                VIEW MY ORDERS
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" size="md" fullWidth>
                CONTINUE SHOPPING
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Support Info */}
        <div
          style={{
            borderTop: '1px solid var(--color-gray-200)',
            paddingTop: '1rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--color-gray-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ShieldCheck size={14} />
          <span>Have questions about your order? Reach us at support@aveezfashion.com</span>
        </div>
      </div>
    </div>
  );
}
