import React from 'react';
import { DollarSign, ShoppingBag, Users, Shirt, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import styles from './admin.module.css';

export default function AdminDashboardPage() {
  const metrics = [
    {
      title: 'TOTAL REVENUE',
      value: '₹2,48,500',
      change: '+18.4% vs last week',
      icon: <DollarSign size={22} />,
    },
    {
      title: 'CONFIRMED ORDERS',
      value: '48',
      change: '4 in processing',
      icon: <ShoppingBag size={22} />,
    },
    {
      title: 'REGISTERED CUSTOMERS',
      value: '182',
      change: '+24 new this month',
      icon: <Users size={22} />,
    },
    {
      title: 'ACTIVE CATALOG SKUS',
      value: '24 Variants',
      change: 'Across 6 master products',
      icon: <Shirt size={22} />,
    },
    {
      title: 'LOW STOCK ALERTS',
      value: '1 SKU',
      change: 'Slate Gray Trouser (Size XL)',
      icon: <AlertTriangle size={22} color="var(--color-warning)" />,
    },
    {
      title: 'PENDING FULFILLMENT',
      value: '3 Orders',
      change: 'Awaiting courier AWB',
      icon: <Clock size={22} />,
    },
  ];

  const recentOrders = [
    {
      orderNumber: 'AVZ-2026-004812',
      customer: 'Arjun Mehta',
      items: 'Signature Boxy Hoodie (L)',
      amount: '₹3,499',
      payment: 'PAID (UPI)',
      fulfillment: 'PROCESSING',
      date: 'Today, 10:24 AM',
    },
    {
      orderNumber: 'AVZ-2026-004811',
      customer: 'Kavita Sharma',
      items: 'Minimalist Relaxed Tee (M)',
      amount: '₹1,699',
      payment: 'PAID (CARD)',
      fulfillment: 'SHIPPED',
      date: 'Yesterday, 04:15 PM',
    },
    {
      orderNumber: 'AVZ-2026-004810',
      customer: 'Rohan Verma',
      items: 'Pleated Trouser (L) + Hoodie (XL)',
      amount: '₹7,398',
      payment: 'PENDING (COD)',
      fulfillment: 'UNFULFILLED',
      date: 'Yesterday, 02:40 PM',
    },
    {
      orderNumber: 'AVZ-2026-004809',
      customer: 'Pooja Nair',
      items: 'Cropped Structured Jacket (S)',
      amount: '₹4,299',
      payment: 'PAID (UPI)',
      fulfillment: 'DELIVERED',
      date: '06 Oct 2026',
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>EXECUTIVE OVERVIEW</h1>
          <p className={styles.pageSubtitle}>
            Live platform telemetry, catalog fulfillment, and revenue metrics.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className={styles.metricsGrid}>
        {metrics.map((m, idx) => (
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

      {/* Recent Orders Section */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>RECENT ORDERS FULFILLMENT QUEUE</h2>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>PIECES</th>
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
                  <td>{ord.customer}</td>
                  <td>{ord.items}</td>
                  <td>
                    <strong>{ord.amount}</strong>
                  </td>
                  <td>
                    <Badge variant={ord.payment.includes('PAID') ? 'default' : 'sale'}>
                      {ord.payment}
                    </Badge>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusDot} ${ord.fulfillment === 'PROCESSING' ? styles.statusProcessing : ord.fulfillment === 'SHIPPED' ? styles.statusShipped : styles.statusUnfulfilled}`}
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
      </div>
    </div>
  );
}
