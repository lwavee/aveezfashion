'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, RefreshCw, AlertCircle, Inbox, X, Truck, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import styles from '../admin.module.css';

interface OrderItem {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  items: string;
  itemsCount: number;
  amount: string;
  payment: string;
  paymentStatus: string;
  fulfillment: string;
  date: string;
  carrier?: string;
  trackingNumber?: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected order for status update modal
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [newFulfillmentStatus, setNewFulfillmentStatus] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load orders.');
      setOrders(Array.isArray(data.data?.orders) ? data.data.orders : []);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve orders.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenModal = (ord: OrderItem) => {
    setSelectedOrder(ord);
    setNewFulfillmentStatus(ord.fulfillment);
    setCarrier(ord.carrier || 'Delhivery');
    setTrackingNumber(ord.trackingNumber || '');
    setTrackingUrl('');
    setStatusNote('');
    setUpdateSuccess('');
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    setUpdateSuccess('');

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.orderNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfillmentStatus: newFulfillmentStatus,
          carrier: carrier.trim(),
          trackingNumber: trackingNumber.trim(),
          trackingUrl: trackingUrl.trim() || undefined,
          statusNote: statusNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order.');

      setUpdateSuccess('Order fulfillment and tracking updated successfully.');
      setTimeout(() => {
        setSelectedOrder(null);
        fetchOrders();
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>ORDER MANAGEMENT</h1>
          <p className={styles.pageSubtitle}>
            Live customer orders, payment verification, fulfillment progress, and tracking dispatch.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: 'var(--color-white-pure)',
            border: '1px solid var(--color-gray-300)',
            borderRadius: 'var(--radius-xs)',
            fontSize: 'var(--font-size-caption)',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            color: 'var(--color-black-rich)',
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>REFRESH ORDERS</span>
        </button>
      </div>

      {error && (
        <div className={styles.errorState}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={fetchOrders} className={styles.retryBtn}>
            RETRY
          </button>
        </div>
      )}

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            CUSTOMER ORDERS QUEUE ({isLoading ? '...' : orders.length})
          </h2>
        </div>

        {isLoading ? (
          <div className={styles.loadingCard}>Loading orders from database...</div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <Inbox size={42} color="var(--color-gray-400)" />
            <span className={styles.emptyStateTitle}>NO ORDERS YET</span>
            <p className={styles.emptyStateText}>
              All verified customer orders will be listed here with payment and fulfillment status.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ORDER NUMBER</th>
                  <th>CUSTOMER</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                  <th>PAYMENT</th>
                  <th>FULFILLMENT</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => router.push(`/admin/orders/${ord.id}`)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view complete order details and manage fulfillment"
                  >
                    <td>
                      <strong>{ord.orderNumber}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{ord.customer}</strong>
                        {ord.customerEmail && (
                          <div style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>{ord.customerEmail}</div>
                        )}
                        {ord.customerPhone && (
                          <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>{ord.customerPhone}</div>
                        )}
                      </div>
                    </td>
                    <td>{ord.items}</td>
                    <td>
                      <strong>{ord.amount}</strong>
                    </td>
                    <td>
                      <Badge variant={ord.paymentStatus === 'PAID' ? 'default' : 'sale'}>
                        {ord.payment}
                      </Badge>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusDot} ${
                          ord.fulfillment === 'PROCESSING'
                            ? styles.statusProcessing
                            : ord.fulfillment === 'SHIPPED' || ord.fulfillment === 'DELIVERED'
                            ? styles.statusShipped
                            : styles.statusUnfulfilled
                        }`}
                      >
                        {ord.fulfillment}
                      </span>
                    </td>
                    <td className={styles.dateCol}>{ord.date}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Link href={`/admin/orders/${ord.id}`}>
                        <Button variant="outline" size="sm">
                          MANAGE
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Status & Tracking Modal */}
      {selectedOrder && (
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
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-white-pure)',
              borderRadius: 'var(--radius-xs)',
              maxWidth: '540px',
              width: '100%',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                  UPDATE FULFILLMENT & CARRIER
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.25rem', fontFamily: 'var(--font-family-mono)' }}>
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', lineHeight: 1.5 }}>
              Customer: <strong>{selectedOrder.customer}</strong> ({selectedOrder.customerEmail} • {selectedOrder.customerPhone})
              <br />
              Amount: <strong>{selectedOrder.amount}</strong> ({selectedOrder.payment})
            </div>

            {updateSuccess && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                ✓ {updateSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  FULFILLMENT STATUS
                </label>
                <select
                  value={newFulfillmentStatus}
                  onChange={(e) => setNewFulfillmentStatus(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 10px',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="UNFULFILLED">UNFULFILLED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}
                  >
                    COURIER CARRIER
                  </label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="e.g. Delhivery / Bluedart"
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 10px',
                      border: '1px solid var(--color-gray-300)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}
                  >
                    AWB TRACKING NUMBER
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DEL789123456"
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 10px',
                      border: '1px solid var(--color-gray-300)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  CARRIER TRACKING URL (OPTIONAL)
                </label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://www.delhivery.com/track/package/..."
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 10px',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  AUDIT LOG NOTE
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Quality inspection passed, shipped via air express..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                <Button type="button" variant="outline" size="md" onClick={() => setSelectedOrder(null)}>
                  CANCEL
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={isUpdating}>
                  {isUpdating ? 'SAVING UPDATES...' : 'SAVE & UPDATE TIMELINE'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
