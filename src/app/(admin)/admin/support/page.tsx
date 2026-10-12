'use client';

import React, { useEffect, useState } from 'react';
import { Mail, RefreshCw, AlertCircle, Inbox, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import styles from '../admin.module.css';

interface InquiryItem {
  id: string;
  _id?: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  subject: string;
  inquiryType: string;
  orderNumber?: string;
  message: string;
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED';
  createdAt: string;
}

export default function AdminSupportPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);

  const fetchInquiries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/support');
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load support inquiries.');
      setInquiries(Array.isArray(data.data?.inquiries) ? data.data.inquiries : []);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve customer inquiries.');
      setInquiries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchInquiries();
        if (selectedInquiry && (selectedInquiry.id === id || selectedInquiry._id === id)) {
          setSelectedInquiry((prev: any) => ({ ...prev, status }));
        }
      }
    } catch {
      // error handling
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>CUSTOMER SUPPORT INQUIRIES</h1>
          <p className={styles.pageSubtitle}>
            Live customer questions, order inquiries, and concierge service requests.
          </p>
        </div>
        <button
          onClick={fetchInquiries}
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
          <span>REFRESH INQUIRIES</span>
        </button>
      </div>

      {error && (
        <div className={styles.errorState}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={fetchInquiries} className={styles.retryBtn}>
            RETRY
          </button>
        </div>
      )}

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            INQUIRIES QUEUE ({isLoading ? '...' : inquiries.length})
          </h2>
        </div>

        {isLoading ? (
          <div className={styles.loadingCard}>Loading inquiries from database...</div>
        ) : inquiries.length === 0 ? (
          <div className={styles.emptyState}>
            <Inbox size={42} color="var(--color-gray-400)" />
            <span className={styles.emptyStateTitle}>NO SUPPORT INQUIRIES</span>
            <p className={styles.emptyStateText}>
              Client submissions through the official contact concierge will appear here.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>REF NUMBER</th>
                  <th>CLIENT</th>
                  <th>TYPE</th>
                  <th>SUBJECT</th>
                  <th>ORDER REF</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((iq) => {
                  const iqId = iq.id || iq._id || '';

                  return (
                    <tr key={iqId || iq.referenceNumber}>
                      <td>
                        <strong>{iq.referenceNumber}</strong>
                      </td>
                      <td>
                        <div>
                          <strong>{iq.fullName}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>{iq.email}</div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{iq.inquiryType}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px' }}>{iq.subject}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px' }}>
                          {iq.orderNumber || '—'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusDot} ${
                            iq.status === 'RESOLVED'
                              ? styles.statusShipped
                              : iq.status === 'IN_REVIEW'
                              ? styles.statusProcessing
                              : styles.statusUnfulfilled
                          }`}
                        >
                          {iq.status}
                        </span>
                      </td>
                      <td className={styles.dateCol}>
                        {new Date(iq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInquiry(iq)}
                          >
                            VIEW
                          </Button>
                          {iq.status !== 'RESOLVED' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleUpdateStatus(iqId, 'RESOLVED')}
                            >
                              RESOLVE
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
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
          onClick={() => setSelectedInquiry(null)}
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
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                INQUIRY: {selectedInquiry.referenceNumber}
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem' }}>{selectedInquiry.subject}</h3>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', lineHeight: 1.5 }}>
              From: <strong>{selectedInquiry.fullName}</strong> ({selectedInquiry.email})
              <br />
              Inquiry Type: <strong>{selectedInquiry.inquiryType}</strong>
              {selectedInquiry.orderNumber && (
                <div>
                  Related Order: <strong>{selectedInquiry.orderNumber}</strong>
                </div>
              )}
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-white-off)',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '4px',
                padding: '1rem',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--color-black-rich)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {selectedInquiry.message}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedInquiry.id || selectedInquiry._id || '', 'IN_REVIEW')}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Mark In Review
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedInquiry.id || selectedInquiry._id || '', 'RESOLVED')}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #059669',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Mark Resolved
                </button>
              </div>

              <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(null)}>
                CLOSE
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
