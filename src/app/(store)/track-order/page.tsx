'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './trackOrder.module.css';

const TIMELINE_STEPS = [
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'PACKED', label: 'Packed' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams?.get('orderNumber') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [verificationContact, setVerificationContact] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<any>(null);

  const fetchTracking = async (num: string, contact?: string) => {
    if (!num.trim()) {
      setError('Please enter your Aveez Fashion order number (e.g. AVZ-123456).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: num.trim(),
          verificationContact: contact ? contact.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.requiresVerification) {
          setNeedsVerification(true);
          setError(data.error);
        } else {
          setError(data.error || 'Failed to retrieve order tracking details.');
        }
        setOrderData(null);
      } else {
        setOrderData(data.data?.order);
        setNeedsVerification(false);
      }
    } catch (err: any) {
      setError(err.message || 'Network error retrieving order details.');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchTracking(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderNumber, verificationContact);
  };

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const orderIndex = TIMELINE_STEPS.findIndex((s) => s.key === currentStatus);
    const thisIndex = TIMELINE_STEPS.findIndex((s) => s.key === stepKey);

    if (currentStatus === 'CANCELLED') return 'cancelled';
    if (orderIndex === -1) {
      // If UNFULFILLED or PENDING_CONFIRMATION
      return thisIndex === 0 ? 'current' : 'pending';
    }
    if (thisIndex < orderIndex) return 'completed';
    if (thisIndex === orderIndex) return 'current';
    return 'pending';
  };

  return (
    <div className={styles.trackPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>
          TRACK YOUR SHIPMENT
        </h1>
        <p className={styles.subtitle}>
          Enter your Aveez order identifier to inspect real-time fulfillment progress, dispatch details, and verified courier tracking.
        </p>
      </div>

      {/* Lookup Form */}
      <form
        onSubmit={handleSubmit}
        className={styles.lookupCard}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              htmlFor="orderNumber"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              ORDER NUMBER
            </label>
            <input
              id="orderNumber"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. AVZ-382910"
              style={{
                width: '100%',
                height: '44px',
                padding: '0 12px',
                border: '1px solid var(--color-gray-300)',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.9375rem',
                fontFamily: 'var(--font-family-mono)',
              }}
            />
          </div>

          {needsVerification && (
            <div>
              <label
                htmlFor="verificationContact"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                  color: '#B45309',
                }}
              >
                SECURITY VERIFICATION: EMAIL OR 10-DIGIT MOBILE NUMBER
              </label>
              <input
                id="verificationContact"
                type="text"
                value={verificationContact}
                onChange={(e) => setVerificationContact(e.target.value)}
                placeholder="Enter email or phone used during checkout"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 12px',
                  border: '1px solid #F59E0B',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.9375rem',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '4px', display: 'block' }}>
                Required to protect private customer details for non-authenticated tracking.
              </span>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '0.875rem',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.8125rem',
              }}
            >
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" disabled={loading} fullWidth>
            {loading ? 'RETRIEVING ORDER STATUS...' : 'TRACK SHIPMENT'}
          </Button>
        </div>
      </form>

      {/* Tracking Results View */}
      {orderData && (
        <div className={styles.resultCard}>
          {/* Header Status Row */}
          <div className={styles.resultHeader}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', letterSpacing: '0.05em' }}>
                ORDER IDENTIFIER
              </span>
              <h2 style={{ fontFamily: 'var(--font-family-mono)', fontSize: '1.25rem', margin: '4px 0 0' }}>
                {orderData.orderNumber}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', letterSpacing: '0.05em' }}>
                CURRENT STATUS
              </span>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  marginTop: '4px',
                  color: orderData.fulfillmentStatus === 'CANCELLED' ? '#DC2626' : '#059669',
                }}
              >
                {orderData.fulfillmentStatus?.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          {orderData.fulfillmentStatus !== 'CANCELLED' ? (
            <div>
              {/* Desktop Horizontal Timeline */}
              <div className={styles.desktopTimeline}>
                {TIMELINE_STEPS.map((step) => {
                  const status = getStepStatus(step.key, orderData.fulfillmentStatus);
                  const isDone = status === 'completed';
                  const isCurrent = status === 'current';

                  return (
                    <div key={step.key} style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          height: '6px',
                          borderRadius: '3px',
                          backgroundColor: isDone || isCurrent ? 'var(--color-black-pure)' : 'var(--color-gray-200)',
                          marginBottom: '8px',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? 'var(--color-black-pure)' : 'var(--color-gray-500)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Vertical Timeline */}
              <div className={styles.mobileTimeline}>
                {TIMELINE_STEPS.map((step, idx) => {
                  const status = getStepStatus(step.key, orderData.fulfillmentStatus);
                  const isDone = status === 'completed';
                  const isCurrent = status === 'current';
                  const isLast = idx === TIMELINE_STEPS.length - 1;

                  return (
                    <div key={step.key} className={styles.mobileStepItem}>
                      {!isLast && (
                        <div
                          className={`${styles.stepConnector} ${
                            isDone ? styles.stepConnectorCompleted : ''
                          }`}
                        />
                      )}
                      <div
                        className={`${styles.stepDot} ${
                          isDone
                            ? styles.stepDotCompleted
                            : isCurrent
                            ? styles.stepDotCurrent
                            : ''
                        }`}
                      >
                        {isDone && <CheckCircle2 size={12} color="#FFFFFF" />}
                      </div>
                      <div className={styles.stepInfo}>
                        <span
                          className={`${styles.stepLabel} ${
                            isCurrent || isDone ? styles.stepLabelActive : ''
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className={styles.stepStatusText}>
                          {isCurrent
                            ? 'In Progress'
                            : isDone
                            ? 'Completed'
                            : 'Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: 'var(--radius-xs)',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#B91C1C',
              }}
            >
              <AlertTriangle size={20} />
              <div>
                <strong>THIS ORDER HAS BEEN CANCELLED</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.8125rem' }}>
                  Restocked to catalog inventory. If payment was collected, your refund will process within 7 calendar days.
                </p>
              </div>
            </div>
          )}

          {/* Courier & Dispatch Card */}
          <div
            style={{
              backgroundColor: 'var(--color-white-off)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-xs)',
              padding: '1.5rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                DESTINATION CITY
              </span>
              <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '0.9375rem' }}>
                {orderData.shippingAddress.city}, {orderData.shippingAddress.state} ({orderData.shippingAddress.pincode})
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                COURIER AWB / TRACKING
              </span>
              {orderData.trackingNumber ? (
                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 600 }}>
                    {orderData.carrier || 'Standard Courier'}: {orderData.trackingNumber}
                  </span>
                  {orderData.trackingUrl && (
                    <a
                      href={orderData.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        marginLeft: '8px',
                        color: 'var(--color-black-rich)',
                        textDecoration: 'underline',
                      }}
                    >
                      OPEN COURIER TRACKING <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ) : (
                <p style={{ margin: '4px 0 0', color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>
                  AWB number will be generated once packed by atelier.
                </p>
              )}
            </div>
          </div>

          {/* Status History Audit Log */}
          {Array.isArray(orderData.statusHistory) && orderData.statusHistory.length > 0 && (
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
                FULFILLMENT UPDATES
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {orderData.statusHistory.map((historyItem: any, idx: number) => (
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
                      <strong>{historyItem.status}</strong>
                      <span style={{ color: 'var(--color-gray-600)', marginLeft: '8px' }}>
                        {historyItem.description}
                      </span>
                    </div>
                    <span style={{ color: 'var(--color-gray-500)', fontSize: '0.75rem' }}>
                      {new Date(historyItem.timestamp).toLocaleString('en-IN', {
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

          {/* Need Assistance */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--color-gray-200)',
              paddingTop: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)' }}>
              Need assistance with this shipment?
            </span>
            <Link href={`/contact?orderNumber=${encodeURIComponent(orderData.orderNumber)}`}>
              <Button variant="outline" size="sm">
                CONTACT ATELIER SUPPORT
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
