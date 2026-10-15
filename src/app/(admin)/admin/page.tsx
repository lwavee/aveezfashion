'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  Shirt,
  AlertTriangle,
  Users,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Inbox,
  ExternalLink,
  PackageCheck,
} from 'lucide-react';
import styles from './admin.module.css';

interface DashboardMetrics {
  totalRevenue: { value: string; rawValue: number; change: string; grossValue?: number; refundedValue?: number };
  confirmedOrders: { value: string; rawValue: number; change: string };
  pendingFulfillment: { value: string; rawValue: number; change: string };
  totalProducts: { value: string; rawValue: number; change: string; totalVariants?: number };
  lowStockAlerts: { value: string; rawValue: number; change: string };
  registeredCustomers: { value: string; rawValue: number; change: string };
  pendingReturns?: { value: string; rawValue: number; change: string };
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

interface LowStockItem {
  productId: string;
  title: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrderRow[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/metrics');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Telemetry request failed with status ${res.status}`);
      }

      const data = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Invalid telemetry payload received.');
      }

      setMetrics(data.data.metrics);
      setRecentOrders(Array.isArray(data.data.recentOrders) ? data.data.recentOrders : []);
      setLowStockItems(Array.isArray(data.data.lowStockItems) ? data.data.lowStockItems : []);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to live platform telemetry.');
      setMetrics(null);
      setRecentOrders([]);
      setLowStockItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Operational pending orders
  const pendingOrders = recentOrders.filter(
    (o) => o.fulfillment === 'PROCESSING' || o.fulfillment === 'UNFULFILLED'
  );

  return (
    <div className={styles.container}>
      {/* 1. Page Header (Restrained, professional SaaS styling) */}
      <div className={styles.pageHeader}>
        <div className={styles.titleStack}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Monitor your store operations and recent activity.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={isLoading}
            className={styles.syncBtn}
            title="Sync metrics with live database"
          >
            <RefreshCw size={13} className={isLoading ? styles.spinning : ''} />
            <span>{isLoading ? 'SYNCING...' : 'SYNC TELEMETRY'}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorContent}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button type="button" onClick={fetchDashboardData} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {/* 2. Compact KPI Cards Grid (6 Essential Real Operational Metrics) */}
      <div className={styles.kpiGrid}>
        {/* KPI 1: Verified Sales Revenue */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Verified Sales Revenue</span>
            <div className={styles.kpiIconWrapper}>
              <IndianRupee size={15} />
            </div>
          </div>
          <div className={styles.kpiValue}>
            {isLoading ? '—' : metrics?.totalRevenue.value || '₹0'}
          </div>
          <p className={styles.kpiSubtitle}>
            {isLoading ? 'Calculating settled orders...' : metrics?.totalRevenue.change || 'Net settled from paid orders'}
          </p>
        </div>

        {/* KPI 2: Total Orders */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Total Orders</span>
            <div className={styles.kpiIconWrapper}>
              <ShoppingBag size={15} />
            </div>
          </div>
          <div className={styles.kpiValue}>
            {isLoading ? '—' : metrics?.confirmedOrders.value || '0'}
          </div>
          <p className={styles.kpiSubtitle}>
            {isLoading ? 'Counting order records...' : metrics?.confirmedOrders.change || 'Total confirmed transactions'}
          </p>
        </div>

        {/* KPI 3: Pending Fulfilment */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Pending Fulfilment</span>
            <div className={styles.kpiIconWrapper}>
              <Clock size={15} />
            </div>
          </div>
          <div className={styles.kpiValue}>
            {isLoading ? '—' : metrics?.pendingFulfillment.value || '0'}
          </div>
          <p className={styles.kpiSubtitle}>
            {isLoading ? 'Checking queue...' : metrics?.pendingFulfillment.change || 'Awaiting dispatch'}
          </p>
        </div>

        {/* KPI 4: Total Products */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Total Products</span>
            <div className={styles.kpiIconWrapper}>
              <Shirt size={15} />
            </div>
          </div>
          <div className={styles.kpiValue}>
            {isLoading ? '—' : metrics?.totalProducts.value || '0'}
          </div>
          <p className={styles.kpiSubtitle}>
            {isLoading ? 'Scanning catalog...' : metrics?.totalProducts.change || 'Active catalog items'}
          </p>
        </div>

        {/* KPI 5: Low Stock Items */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Low Stock Items</span>
            <div className={styles.kpiIconWrapper}>
              <AlertTriangle
                size={15}
                className={
                  (metrics?.lowStockAlerts.rawValue || 0) > 0 ? styles.warningIcon : ''
                }
              />
            </div>
          </div>
          <div className={styles.kpiValue}>
            {isLoading ? '—' : metrics?.lowStockAlerts.value || '0'}
          </div>
          <p className={styles.kpiSubtitle}>
            {isLoading ? 'Auditing variant stock...' : metrics?.lowStockAlerts.change || 'Units ≤ 5 threshold'}
          </p>
        </div>

        {/* KPI 6: Registered Customers */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Registered Customers</span>
            <div className={styles.kpiIconWrapper}>
              <Users size={15} />
            </div>
          </div>
          <div className={styles.kpiValue}>
            {isLoading ? '—' : metrics?.registeredCustomers.value || '0'}
          </div>
          <p className={styles.kpiSubtitle}>
            {isLoading ? 'Counting accounts...' : metrics?.registeredCustomers.change || 'Verified database profiles'}
          </p>
        </div>
      </div>

      {/* 3. Balanced Two-Column Section: Recent Orders (Left) & Inventory Alerts (Right) */}
      <div className={styles.twoColumnGrid}>
        {/* Left Column: Recent Orders */}
        <section className={styles.card} aria-label="Recent Orders">
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <h2 className={styles.cardTitle}>Recent Orders</h2>
              <span className={styles.cardBadge}>
                {isLoading ? '...' : `${recentOrders.length} records`}
              </span>
            </div>
            <Link href="/admin/orders" className={styles.viewAllLink}>
              <span>View All Orders</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className={styles.cardBody}>
            {isLoading ? (
              <div className={styles.loadingPlaceholder}>
                Loading recent orders from database...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className={styles.emptyState}>
                <Inbox size={32} className={styles.emptyIcon} />
                <span className={styles.emptyTitle}>No Orders Found</span>
                <p className={styles.emptyDesc}>
                  Customer orders will automatically populate here as transactions are completed.
                </p>
              </div>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Order #</th>
                      <th scope="col">Customer</th>
                      <th scope="col">Date</th>
                      <th scope="col">Payment</th>
                      <th scope="col">Fulfilment</th>
                      <th scope="col" className={styles.alignRight}>Total</th>
                      <th scope="col" className={styles.alignRight}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.slice(0, 5).map((ord) => (
                      <tr key={ord.id || ord.orderNumber}>
                        <td className={styles.orderNumberCell}>
                          <Link href={`/admin/orders`} className={styles.orderLink}>
                            {ord.orderNumber}
                          </Link>
                        </td>
                        <td>
                          <div className={styles.customerCell}>
                            <span className={styles.customerName}>{ord.customer}</span>
                            {ord.customerEmail && (
                              <span className={styles.customerEmail}>{ord.customerEmail}</span>
                            )}
                          </div>
                        </td>
                        <td className={styles.dateCell}>{ord.date}</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              ord.paymentStatus === 'PAID'
                                ? styles.statusPaid
                                : styles.statusPending
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              ord.fulfillment === 'SHIPPED'
                                ? styles.statusShipped
                                : ord.fulfillment === 'PROCESSING'
                                ? styles.statusProcessing
                                : styles.statusUnfulfilled
                            }`}
                          >
                            {ord.fulfillment}
                          </span>
                        </td>
                        <td className={`${styles.totalCell} ${styles.alignRight}`}>
                          {ord.amount}
                        </td>
                        <td className={styles.alignRight}>
                          <Link href="/admin/orders" className={styles.tableActionBtn}>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Inventory Alerts */}
        <section className={styles.card} aria-label="Inventory Alerts">
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <h2 className={styles.cardTitle}>Inventory Alerts</h2>
              <span className={styles.cardBadge}>
                {isLoading ? '...' : `${lowStockItems.length} alert${lowStockItems.length === 1 ? '' : 's'}`}
              </span>
            </div>
            <Link href="/admin/inventory" className={styles.viewAllLink}>
              <span>Manage Inventory</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className={styles.cardBody}>
            {isLoading ? (
              <div className={styles.loadingPlaceholder}>
                Scanning catalog stock levels...
              </div>
            ) : lowStockItems.length === 0 ? (
              <div className={styles.healthyInventoryState}>
                <CheckCircle2 size={32} className={styles.healthyIcon} />
                <span className={styles.healthyTitle}>All Inventory Healthy</span>
                <p className={styles.healthyDesc}>
                  Every SKU variant in the active catalog currently has more than 5 units in stock.
                </p>
                <Link href="/admin/inventory" className={styles.secondaryActionBtn}>
                  Audit Full Stock
                </Link>
              </div>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Product & Variant</th>
                      <th scope="col">Stock</th>
                      <th scope="col" className={styles.alignRight}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.slice(0, 6).map((item, index) => (
                      <tr key={`${item.productId}-${item.sku}-${index}`}>
                        <td>
                          <div className={styles.inventoryItemCell}>
                            <span className={styles.inventoryTitle}>{item.title}</span>
                            <span className={styles.inventoryMeta}>
                              Size: <strong>{item.size}</strong> • Color: {item.color}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${styles.stockBadge} ${
                              item.stock === 0 ? styles.stockOut : styles.stockLow
                            }`}
                          >
                            {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                          </span>
                        </td>
                        <td className={styles.alignRight}>
                          <Link href="/admin/inventory" className={styles.tableActionBtn}>
                            Restock
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 4. Compact Pending Fulfilment Summary Panel */}
      <section className={styles.card} aria-label="Pending Fulfilment Summary">
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <PackageCheck size={16} className={styles.sectionHeaderIcon} />
            <h2 className={styles.cardTitle}>Operational Fulfilment Queue</h2>
            <span className={styles.cardBadge}>
              {pendingOrders.length} awaiting dispatch
            </span>
          </div>
          <Link href="/admin/orders" className={styles.viewAllLink}>
            <span>Process Orders</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className={styles.cardBody}>
          {pendingOrders.length === 0 ? (
            <div className={styles.healthyInventoryState}>
              <CheckCircle2 size={28} className={styles.healthyIcon} />
              <span className={styles.healthyTitle}>All Orders Fulfilled</span>
              <p className={styles.healthyDesc}>
                There are no open orders awaiting packing, label creation, or carrier dispatch.
              </p>
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Order ID</th>
                    <th scope="col">Customer Contact</th>
                    <th scope="col">Purchased Items</th>
                    <th scope="col">Order Value</th>
                    <th scope="col">Current Status</th>
                    <th scope="col" className={styles.alignRight}>Management</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td className={styles.orderNumberCell}>
                        <Link href="/admin/orders" className={styles.orderLink}>
                          {ord.orderNumber}
                        </Link>
                      </td>
                      <td>
                        <div className={styles.customerCell}>
                          <span className={styles.customerName}>{ord.customer}</span>
                          <span className={styles.customerEmail}>{ord.customerPhone || ord.customerEmail}</span>
                        </div>
                      </td>
                      <td className={styles.itemsSummaryCell}>{ord.items}</td>
                      <td className={styles.totalCell}>{ord.amount}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles.statusProcessing}`}>
                          {ord.fulfillment}
                        </span>
                      </td>
                      <td className={styles.alignRight}>
                        <Link href="/admin/orders" className={styles.tableActionBtn}>
                          Update Status →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
