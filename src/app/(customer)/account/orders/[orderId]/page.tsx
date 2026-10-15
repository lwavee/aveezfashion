'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  Truck,
  RotateCcw,
  MapPin,
  CreditCard,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AccountNav } from '@/components/customer/AccountNav';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        if (res.status === 401) {
          router.push(`/login?redirect=/account/orders/${encodeURIComponent(orderId)}`);
          return;
        }
        const data = await res.json();
        if (data.success && data.data?.order) {
          setOrder(data.data.order);
        } else {
          setError(data.error || 'Unable to load order details.');
        }
      } catch (err: any) {
        setError(err.message || 'Network error fetching order.');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
          Loading order details from secure database...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: '900px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <AlertCircle size={44} color="#DC2626" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          ORDER NOT FOUND
        </h1>
        <p style={{ color: 'var(--color-gray-600)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {error || 'This order does not exist or you do not have permission to view it.'}
        </p>
        <Link href="/account/orders">
          <Button variant="outline" size="md">
            RETURN TO ORDERS
          </Button>
        </Link>
      </div>
    );
  }

  const isDelivered = order.fulfillmentStatus === 'DELIVERED';
  const isCancelled = order.fulfillmentStatus === 'CANCELLED';
  const isReturnEligible = order.isReturnEligible;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-3xl) var(--container-padding)' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          href="/account/orders"
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
          <span>BACK TO ALL ORDERS</span>
        </Link>
      </div>

      <AccountNav />

      {/* Main Order Card */}
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
        {/* Order Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid var(--color-gray-200)',
            paddingBottom: '1.5rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
              ORDER IDENTIFIER
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-family-mono)',
                fontSize: '1.5rem',
                margin: '4px 0 0',
                letterSpacing: '-0.02em',
              }}
            >
              {order.orderNumber}
            </h1>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)', marginTop: '4px' }}>
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                padding: '4px 10px',
                borderRadius: '2px',
                backgroundColor: isDelivered
                  ? '#ECFDF5'
                  : isCancelled
                  ? '#FEF2F2'
                  : '#EFF6FF',
                color: isDelivered
                  ? '#059669'
                  : isCancelled
                  ? '#DC2626'
                  : '#2563EB',
              }}
            >
              {order.fulfillmentStatus?.replace(/_/g, ' ')}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-600)' }}>
              Payment: <strong>{order.paymentStatus}</strong> ({order.paymentMethod})
            </span>
          </div>
        </div>

        {/* Action Buttons Top Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`}>
            <Button variant="primary" size="sm">
              <Truck size={14} style={{ marginRight: '6px' }} />
              TRACK SHIPMENT
            </Button>
          </Link>

          {isReturnEligible && (
            <Link href={`/account/orders/${encodeURIComponent(order.orderNumber)}/return`}>
              <Button variant="outline" size="sm">
                <RotateCcw size={14} style={{ marginRight: '6px' }} />
                REQUEST RETURN OR EXCHANGE (7-DAY POLICY)
              </Button>
            </Link>
          )}

          <Link href={`/contact?orderNumber=${encodeURIComponent(order.orderNumber)}`}>
            <Button variant="ghost" size="sm">
              CONTACT SUPPORT
            </Button>
          </Link>
        </div>

        {/* Purchased Products */}
        <div>
          <h2
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderBottom: '1px solid var(--color-gray-200)',
              paddingBottom: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            ITEMS IN THIS SHIPMENT ({order.items?.length || 0})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.isArray(order.items) &&
              order.items.map((item: any, idx: number) => {
                const itemImg = item.image || item.thumbnailImage;
                const itemPrice = item.price ?? item.unitPrice ?? 0;
                const itemQty = item.quantity || 1;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      paddingBottom: '1rem',
                      borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid var(--color-gray-100)',
                    }}
                  >
                    {itemImg && (
                      <div
                        style={{
                          width: '64px',
                          height: '85px',
                          position: 'relative',
                          backgroundColor: 'var(--color-gray-100)',
                          borderRadius: 'var(--radius-xs)',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <Image src={itemImg} alt={item.title || 'Product'} fill style={{ objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{item.title}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                        SIZE: {item.size || 'ONESIZE'} • COLOR: {item.color || 'Default'} • SKU: {item.variantSku || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-700)', marginTop: '2px' }}>
                        QTY: {itemQty} × ₹{itemPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                      ₹{(itemPrice * itemQty).toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Address and Payment Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            backgroundColor: 'var(--color-white-off)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '1.5rem',
          }}
        >
          {/* Shipping Address Snapshot */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
              <MapPin size={18} />
              <strong style={{ fontSize: '0.8125rem', letterSpacing: '0.05em' }}>
                IMMUTABLE SHIPPING ADDRESS
              </strong>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
              <strong>{order.customerName}</strong>
              <br />
              {order.shippingAddress?.house && `${order.shippingAddress.house}, `}
              {order.shippingAddress?.streetAddress}
              {order.shippingAddress?.landmark && `, near ${order.shippingAddress.landmark}`}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              <br />
              Contact Phone: {order.customerPhone}
              <br />
              Email: {order.customerEmail}
            </div>
          </div>

          {/* Price Breakdown */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
              <CreditCard size={18} />
              <strong style={{ fontSize: '0.8125rem', letterSpacing: '0.05em' }}>
                PAYMENT BREAKDOWN
              </strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-600)' }}>
                <span>Subtotal</span>
                <span>₹{(order.totalAmount - (order.shippingFee || 0) + (order.discountTotal || 0)).toLocaleString('en-IN')}</span>
              </div>
              {order.discountTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>Discount</span>
                  <span>-₹{order.discountTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-600)' }}>
                <span>Standard Delivery</span>
                <span>{order.shippingFee ? `₹${order.shippingFee}` : 'FREE'}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--color-gray-200)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9375rem' }}>
                <span>Final Total</span>
                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Courier & AWB section if exists */}
        {order.trackingNumber && (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <strong style={{ fontSize: '0.875rem', color: '#1E40AF' }}>DISPATCHED WITH {order.carrier || 'COURIER'}</strong>
              <div style={{ fontSize: '0.8125rem', color: '#1E3A8A', marginTop: '2px', fontFamily: 'var(--font-family-mono)' }}>
                AWB TRACKING NUMBER: {order.trackingNumber}
              </div>
            </div>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#1E40AF',
                  textDecoration: 'underline',
                }}
              >
                OPEN LIVE CARRIER PORTAL <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}

        {/* Timeline Updates */}
        {Array.isArray(order.statusHistory) && order.statusHistory.length > 0 && (
          <div>
            <h3
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderBottom: '1px solid var(--color-gray-200)',
                paddingBottom: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              ORDER LIFECYCLE AUDIT LOG
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {order.statusHistory.map((h: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8125rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid var(--color-gray-100)',
                  }}
                >
                  <div>
                    <strong>{h.status}</strong>
                    <span style={{ color: 'var(--color-gray-600)', marginLeft: '8px' }}>
                      {h.description}
                    </span>
                  </div>
                  <span style={{ color: 'var(--color-gray-500)', fontSize: '0.75rem' }}>
                    {new Date(h.timestamp).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
