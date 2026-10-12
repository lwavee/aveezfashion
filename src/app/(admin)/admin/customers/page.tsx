'use client';

import React, { useEffect, useState } from 'react';
import { Users, RefreshCw, AlertCircle, UserX } from 'lucide-react';
import styles from '../admin.module.css';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  joinedDate: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/customers');
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load customers.');
      setCustomers(Array.isArray(data.data?.customers) ? data.data.customers : []);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve customers.');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>REGISTERED CUSTOMERS</h1>
          <p className={styles.pageSubtitle}>
            Verified customer accounts, contact details, and account creation dates.
          </p>
        </div>
        <button
          onClick={fetchCustomers}
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
          <span>SYNC CUSTOMERS</span>
        </button>
      </div>

      {error && (
        <div className={styles.errorState}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={fetchCustomers} className={styles.retryBtn}>
            RETRY
          </button>
        </div>
      )}

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            VERIFIED CUSTOMER ACCOUNTS ({isLoading ? '...' : customers.length})
          </h2>
        </div>

        {isLoading ? (
          <div className={styles.loadingCard}>Loading customer accounts from database...</div>
        ) : customers.length === 0 ? (
          <div className={styles.emptyState}>
            <UserX size={42} color="var(--color-gray-400)" />
            <span className={styles.emptyStateTitle}>NO CUSTOMERS REGISTERED YET</span>
            <p className={styles.emptyStateText}>
              When users register on the website, their verified accounts will be listed here.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>CUSTOMER NAME</th>
                  <th>EMAIL ADDRESS</th>
                  <th>MOBILE NUMBER</th>
                  <th>ACCOUNT ROLE</th>
                  <th>REGISTRATION DATE</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          backgroundColor: '#E0E7FF',
                          color: '#3730A3',
                          borderRadius: '3px',
                        }}
                      >
                        {c.role}
                      </span>
                    </td>
                    <td className={styles.dateCol}>{c.joinedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
