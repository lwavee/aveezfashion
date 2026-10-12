'use client';

import React, { useEffect, useState } from 'react';
import { RotateCcw, RefreshCw, AlertCircle, Inbox, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import styles from '../admin.module.css';

interface ReturnItem {
  id: string;
  _id?: string;
  requestId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type: 'RETURN' | 'EXCHANGE';
  items: any[];
  reason: string;
  notes?: string;
  status: string;
  refundStatus: string;
  refundAmount: number;
  adminNotes?: string;
  createdAt: string;
}

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected for management
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newRefundStatus, setNewRefundStatus] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  const fetchReturns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/returns');
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load returns.');
      setReturns(Array.isArray(data.data?.returns) ? data.data.returns : []);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve return requests.');
      setReturns([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleOpenModal = (ret: ReturnItem) => {
    setSelectedReturn(ret);
    setNewStatus(ret.status);
    setNewRefundStatus(ret.refundStatus || 'PENDING');
    setRefundAmount(ret.refundAmount || 0);
    setAdminNotes(ret.adminNotes || '');
    setUpdateSuccess('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    setIsUpdating(true);
    setUpdateSuccess('');

    try {
      const res = await fetch(`/api/admin/returns/${selectedReturn.id || selectedReturn._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          refundStatus: newRefundStatus,
          refundAmount: Number(refundAmount),
          adminNotes: adminNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update return request.');

      setUpdateSuccess('Return request updated successfully.');
      setTimeout(() => {
        setSelectedReturn(null);
        fetchReturns();
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Failed to update return request');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>RETURNS & EXCHANGES MANAGEMENT</h1>
          <p className={styles.pageSubtitle}>
            Review customer return requests, approve pickups, record inspections, and disburse 7-day refunds.
          </p>
        </div>
        <button
          onClick={fetchReturns}
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
          <span>REFRESH RETURNS</span>
        </button>
      </div>

      {error && (
        <div className={styles.errorState}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={fetchReturns} className={styles.retryBtn}>
            RETRY
          </button>
        </div>
      )}

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            RETURN REQUESTS QUEUE ({isLoading ? '...' : returns.length})
          </h2>
        </div>

        {isLoading ? (
          <div className={styles.loadingCard}>Loading return requests from database...</div>
        ) : returns.length === 0 ? (
          <div className={styles.emptyState}>
            <Inbox size={42} color="var(--color-gray-400)" />
            <span className={styles.emptyStateTitle}>NO RETURN REQUESTS</span>
            <p className={styles.emptyStateText}>
              All customer-submitted return and exchange requests will appear here with order references.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>REQUEST ID</th>
                  <th>ORDER NUMBER</th>
                  <th>CUSTOMER</th>
                  <th>TYPE</th>
                  <th>REASON</th>
                  <th>STATUS</th>
                  <th>REFUND</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((ret) => (
                  <tr key={ret.id || ret.requestId}>
                    <td>
                      <strong>{ret.requestId}</strong>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-family-mono)' }}>{ret.orderNumber}</span>
                    </td>
                    <td>
                      <div>
                        <strong>{ret.customerName}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>{ret.customerEmail}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{ret.type}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--color-gray-700)' }}>{ret.reason}</span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusDot} ${
                          ret.status === 'APPROVED' || ret.status === 'COMPLETED'
                            ? styles.statusShipped
                            : ret.status === 'REJECTED'
                            ? styles.statusUnfulfilled
                            : styles.statusProcessing
                        }`}
                      >
                        {ret.status}
                      </span>
                    </td>
                    <td>
                      <Badge variant={ret.refundStatus === 'PROCESSED' ? 'default' : 'sale'}>
                        {ret.refundStatus || 'PENDING'}
                      </Badge>
                    </td>
                    <td className={styles.dateCol}>
                      {new Date(ret.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td>
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal(ret)}>
                        MANAGE
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Request Modal */}
      {selectedReturn && (
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
          onClick={() => setSelectedReturn(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-white-pure)',
              borderRadius: 'var(--radius-xs)',
              maxWidth: '560px',
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
                  RETURN CONCIERGE WORKFLOW
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.25rem', fontFamily: 'var(--font-family-mono)' }}>
                  {selectedReturn.requestId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReturn(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', lineHeight: 1.5 }}>
              Order: <strong>{selectedReturn.orderNumber}</strong> • Customer: <strong>{selectedReturn.customerName}</strong>
              <br />
              Reason: <strong>{selectedReturn.reason}</strong>
              {selectedReturn.notes && (
                <div style={{ marginTop: '4px', fontStyle: 'italic' }}>Notes: &quot;{selectedReturn.notes}&quot;</div>
              )}
            </div>

            {/* Pieces */}
            <div style={{ backgroundColor: 'var(--color-white-off)', padding: '10px', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                REQUESTED GARMENTS:
              </span>
              <ul style={{ margin: '4px 0 0', paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
                {selectedReturn.items?.map((piece: any, idx: number) => (
                  <li key={idx}>
                    {piece.title} (Size: {piece.size}
                    {piece.exchangeSize ? ` → Exchange: ${piece.exchangeSize}` : ''}, Qty: {piece.quantity})
                  </li>
                ))}
              </ul>
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

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                    STATUS
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 10px',
                      border: '1px solid var(--color-gray-300)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="PICKUP_SCHEDULED">PICKUP_SCHEDULED</option>
                    <option value="INSPECTED">INSPECTED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
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
                    REFUND STATUS
                  </label>
                  <select
                    value={newRefundStatus}
                    onChange={(e) => setNewRefundStatus(e.target.value)}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 10px',
                      border: '1px solid var(--color-gray-300)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSED">PROCESSED</option>
                    <option value="FAILED">FAILED</option>
                    <option value="NOT_APPLICABLE">NOT_APPLICABLE</option>
                  </select>
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
                  REFUND AMOUNT (₹)
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
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
                  ADMIN / INSPECTION NOTES
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record reason for approval, rejection, or refund details..."
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
                <Button type="button" variant="outline" size="md" onClick={() => setSelectedReturn(null)}>
                  CANCEL
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={isUpdating}>
                  {isUpdating ? 'SAVING...' : 'SAVE DECISION'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
