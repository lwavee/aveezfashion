import React from 'react';
import { connectToDatabase } from '@/server/db/connect';
import { Coupon } from '@/server/models/Coupon';
import { Tag, CheckCircle2, Ticket } from 'lucide-react';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  await connectToDatabase();
  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.titleStack}>
          <h1 className={styles.pageTitle}>Coupons & Promotions</h1>
          <p className={styles.pageSubtitle}>
            Configure promotional discount codes, cart thresholds, and redemption caps.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <Ticket size={16} className={styles.sectionHeaderIcon} />
            <h2 className={styles.cardTitle}>Active Promotional Vouchers</h2>
            <span className={styles.cardBadge}>{coupons.length} promotional rules</span>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Voucher Code</th>
                  <th scope="col">Discount Value</th>
                  <th scope="col">Min Order Value</th>
                  <th scope="col">Expiry Date</th>
                  <th scope="col">Usage Count</th>
                  <th scope="col" className={styles.alignRight}>Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={String(c._id) || c.code}>
                    <td>
                      <div className={styles.inventoryItemCell}>
                        <strong style={{ letterSpacing: '0.08em', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {c.code}
                        </strong>
                        <span className={styles.inventoryMeta}>{c.description || 'Promotional coupon'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0A0A0A' }}>
                        {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </span>
                    </td>
                    <td>
                      ₹{(c.minimumOrderValue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className={styles.dateCell}>
                      {c.validUntil ? new Date(c.validUntil).toLocaleDateString('en-IN') : 'No Expiry'}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {c.usageCount || 0} redeemed
                    </td>
                    <td className={styles.alignRight}>
                      <span className={`${styles.statusBadge} ${c.isActive ? styles.statusPaid : styles.statusPending}`}>
                        <CheckCircle2 size={11} style={{ marginRight: '4px' }} />
                        {c.isActive ? 'Active' : 'Paused'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
