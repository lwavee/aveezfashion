'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Shirt,
  AlertTriangle,
  Clock,
  RefreshCw,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import styles from './admin.module.css';

interface DashboardMetrics {
  totalRevenue: { value: string; rawValue: number; change: string };
  confirmedOrders: { value: string; rawValue: number; change: string };
  registeredCustomers: { value: string; rawValue: number; change: string };
  activeCatalogSkus: { value: string; rawValue: number; change: string };
  lowStockAlerts: { value: string; rawValue: number; change: string };
  pendingFulfillment: { value: string; rawValue: number; change: string };
}

interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  items: string;
  amount: string;
  rawAmount: number;
  payment: string;
  paymentStatus: string;
  paymentMethod: string;
  fulfillment: string;
  date: string;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/metrics');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch telemetry (${res.status})`);
      }

      const data = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Invalid telemetry data received.');
      }

      setMetrics(data.data.metrics);
      setRecentOrders(Array.isArray(data.data.recentOrders) ? data.data.recentOrders : []);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to live platform telemetry.');
      // Never fall back to mock data
      setMetrics(null);
      setRecentOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const metricCards = metrics
    ? [
        {
          title: 'TOTAL REVENUE',
          value: metrics.totalRevenue.value,
          change: metrics.totalRevenue.change,
          icon: <DollarSign size={22} />,
        },
        {
          title: 'CONFIRMED ORDERS',
          value: metrics.confirmedOrders.value,
          change: metrics.confirmedOrders.change,
          icon: <ShoppingBag size={22} />,
        },
        {
          title: 'REGISTERED CUSTOMERS',
          value: metrics.registeredCustomers.value,
          change: metrics.registeredCustomers.change,
          icon: <Users size={22} />,
        },
        {
          title: 'ACTIVE CATALOG SKUS',
          value: metrics.activeCatalogSkus.value,
          change: metrics.activeCatalogSkus.change,
          icon: <Shirt size={22} />,
        },
        {
          title: 'LOW STOCK ALERTS',
          value: metrics.lowStockAlerts.value,
          change: metrics.lowStockAlerts.change,
          icon: (
            <AlertTriangle
              size={22}
              color={metrics.lowStockAlerts.rawValue > 0 ? 'var(--color-warning)' : 'var(--color-gray-400)'}
            />
          ),
        },
        {
          title: 'PENDING FULFILLMENT',
          value: metrics.pendingFulfillment.value,
          change: metrics.pendingFulfillment.change,
          icon: <Clock size={22} />,
        },
      ]
    : [];

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>EXECUTIVE OVERVIEW</h1>
          <p className={styles.pageSubtitle}>
            Live platform telemetry, catalog fulfillment, and revenue metrics.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
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
          <span>SYNC TELEMETRY</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className={styles.errorState}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={fetchDashboardData} className={styles.retryBtn}>
            RETRY
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      {isLoading && !metrics ? (
        <div className={styles.loadingCard}>
          <span>Connecting to platform database & calculating metrics...</span>
        </div>
      ) : (
        <div className={styles.metricsGrid}>
          {metricCards.map((m, idx) => (
            <div key={idx} className={styles.metricCard}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>{m.title}</span>
                <div className={styles.metricIcon}>{m.icon}</div>
              </div>
              <div className={styles.metricValue}>{m.value}</div>
              <span className={styles.metricChange}>{m.change}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent Orders Section */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            RECENT ORDERS FULFILLMENT QUEUE ({isLoading ? '...' : recentOrders.length})
          </h2>
        </div>

        {isLoading && recentOrders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
            Loading order fulfillment queue...
          </div>
        ) : recentOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <Inbox size={42} color="var(--color-gray-400)" />
            <span className={styles.emptyStateTitle}>NO ORDERS YET</span>
            <p className={styles.emptyStateText}>
              Live customer orders will appear here automatically as transactions are recorded in the system.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>CUSTOMER</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                  <th>PAYMENT</th>
                  <th>FULFILLMENT STATUS</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.orderNumber}>
                    <td>
                      <strong>{ord.orderNumber}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{ord.customer}</strong>
                        {ord.customerEmail && (
                          <div style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>{ord.customerEmail}</div>
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
                            : ord.fulfillment === 'SHIPPED'
                            ? styles.statusShipped
                            : styles.statusUnfulfilled
                        }`}
                      >
                        {ord.fulfillment}
                      </span>
                    </td>
                    <td className={styles.dateCol}>{ord.date}</td>
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
