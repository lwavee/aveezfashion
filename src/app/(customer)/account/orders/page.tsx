'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  RotateCcw,
  XCircle,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AccountNav } from '@/components/customer/AccountNav';

type FilterTab = 'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [cancellingOrderNumber, setCancellingOrderNumber] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.status === 401) {
        router.push('/login?redirect=/account/orders');
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.orders)) {
        setOrders(data.data.orders);
      }
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [router]);

  const handleCancelOrder = async (orderNumber: string) => {
    if (!cancelReason.trim()) {
      setCancelError('Please select or provide a reason for cancellation.');
      return;
    }
    setActionLoading(true);
    setCancelError('');

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCancelError(data.error || 'Failed to cancel order.');
      } else {
        setCancellingOrderNumber(null);
        setCancelReason('');
        await fetchOrders();
      }
    } catch (err: any) {
      setCancelError(err.message || 'Error executing cancellation.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'DELIVERED') return o.fulfillmentStatus === 'DELIVERED';
    if (activeTab === 'CANCELLED') return o.fulfillmentStatus === 'CANCELLED';
    if (activeTab === 'ACTIVE') {
      return (
        o.fulfillmentStatus !== 'DELIVERED' &&
        o.fulfillmentStatus !== 'CANCELLED'
      );
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-3xl) var(--container-padding)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'var(--font-size-h2)',
            letterSpacing: 'var(--letter-spacing-tight)',
            margin: 0,
          }}
        >
          MY ORDERS
        </h1>
        <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem', marginTop: '4px' }}>
          Inspect active shipments, delivery status, and eligible cancellations or returns.
        </p>
      </div>

      <AccountNav />

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--color-gray-200)',
          paddingBottom: '0.5rem',
        }}
      >
        {(['ALL', 'ACTIVE', 'DELIVERED', 'CANCELLED'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              backgroundColor: activeTab === tab ? 'var(--color-black-pure)' : 'transparent',
              color: activeTab === tab ? 'var(--color-white-pure)' : 'var(--color-gray-600)',
              transition: 'all 0.15s ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
          Retrieving verified orders from your account...
        </div>
      ) : filteredOrders.length === 0 ? (
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
          <ShoppingBag size={44} color="var(--color-gray-400)" />
          <div>
            <h3 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.25rem', margin: 0 }}>
              NO ORDERS FOUND
            </h3>
            <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem', marginTop: '4px' }}>
              {activeTab === 'ALL'
                ? 'You have not placed any orders yet.'
                : `No orders matching status "${activeTab}".`}
            </p>
          </div>
          <Link href="/shop">
            <Button variant="primary" size="md">
              DISCOVER COLLECTIONS
            </Button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredOrders.map((order) => {
            const isDelivered = order.fulfillmentStatus === 'DELIVERED';
            const isCancelled = order.fulfillmentStatus === 'CANCELLED';
            const isPendingFulfillment =
              order.fulfillmentStatus === 'UNFULFILLED' ||
              order.fulfillmentStatus === 'PROCESSING' ||
              order.fulfillmentStatus === 'PENDING_CONFIRMATION';

            // 7-day policy window calculation
            let isReturnEligible = false;
            if (isDelivered && order.updatedAt) {
              const diffMs = Date.now() - new Date(order.updatedAt).getTime();
              const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
              isReturnEligible = days <= 7 && (!order.returnStatus || order.returnStatus === 'NONE');
            }

            return (
              <div
                key={order.orderNumber}
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
                {/* Order Top Bar */}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 700, fontSize: '0.9375rem' }}>
                      {order.orderNumber}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)' }}>
                      Placed on{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        padding: '3px 8px',
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
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '2px',
                        backgroundColor: '#F3F4F6',
                        color: '#374151',
                      }}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {Array.isArray(order.items) ? (
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
                            gap: '1rem',
                          }}
                        >
                          {itemImg && (
                            <div
                              style={{
                                width: '48px',
                                height: '64px',
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
                            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                              SIZE: {item.size || 'ONESIZE'} • QTY: {itemQty}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                            ₹{(itemPrice * itemQty).toLocaleString('en-IN')}
                          </div>
                        </div>
                      );
                    })
                  ) : typeof order.items === 'string' && order.items ? (
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)' }}>
                      {order.items}
                    </div>
                  ) : null}
                </div>

                {/* Bottom Row with Total and Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--color-gray-100)',
                    paddingTop: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                      TOTAL PAID
                    </span>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Link href={`/account/orders/${encodeURIComponent(order.orderNumber)}`}>
                      <Button variant="outline" size="sm">
                        VIEW DETAILS
                      </Button>
                    </Link>

                    <Link href={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`}>
                      <Button variant="secondary" size="sm">
                        <Truck size={14} style={{ marginRight: '4px' }} />
                        TRACK
                      </Button>
                    </Link>

                    {isReturnEligible && (
                      <Link href={`/account/orders/${encodeURIComponent(order.orderNumber)}/return`}>
                        <Button variant="outline" size="sm">
                          <RotateCcw size={14} style={{ marginRight: '4px' }} />
                          RETURN / EXCHANGE
                        </Button>
                      </Link>
                    )}

                    {isPendingFulfillment && (
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ color: '#DC2626' }}
                        onClick={() => {
                          setCancellingOrderNumber(order.orderNumber);
                          setCancelReason('');
                          setCancelError('');
                        }}
                      >
                        CANCEL
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingOrderNumber && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setCancellingOrderNumber(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-white-pure)',
              borderRadius: 'var(--radius-xs)',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                CANCEL ORDER ({cancellingOrderNumber})
              </h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', margin: 0, lineHeight: 1.5 }}>
              Are you sure you wish to cancel this order? Unfulfilled items will be immediately restocked. If paid online, your refund will be processed back to original source within 7 calendar days.
            </p>

            <div>
              <label
                htmlFor="cancelReason"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                REASON FOR CANCELLATION
              </label>
              <select
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 10px',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">-- Please select a reason --</option>
                <option value="Changed mind / No longer needed">Changed mind / No longer needed</option>
                <option value="Ordered incorrect size or color">Ordered incorrect size or color</option>
                <option value="Found alternative item">Found alternative item</option>
                <option value="Delivery timeline too long">Delivery timeline too long</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {cancelError && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                {cancelError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => setCancellingOrderNumber(null)}
                disabled={actionLoading}
              >
                KEEP ORDER
              </Button>
              <Button
                variant="primary"
                size="md"
                style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
                onClick={() => handleCancelOrder(cancellingOrderNumber)}
                disabled={actionLoading}
              >
                {actionLoading ? 'CANCELLING...' : 'CONFIRM CANCELLATION'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
