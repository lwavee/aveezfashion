import React from 'react';
import { CatalogService } from '@/server/services/catalogService';
import { Settings as SettingsIcon, ShieldCheck, Mail, Phone, Truck, CreditCard } from 'lucide-react';
import { SeasonalThemeSettings } from '@/components/admin/SeasonalThemeSettings';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await CatalogService.getSettings();

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.titleStack}>
          <h1 className={styles.pageTitle}>Settings & Appearance</h1>
          <p className={styles.pageSubtitle}>
            Store preferences, seasonal campaigns, Diwali mode, shipping thresholds, and compliance.
          </p>
        </div>
      </div>

      {/* Seasonal Theme Control Center (Diwali Mode + Backblaze B2 Assets) */}
      <SeasonalThemeSettings initialTheme={settings.seasonalTheme} />

      <div className={styles.twoColumnGrid}>
        {/* Store Profile */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <SettingsIcon size={16} className={styles.sectionHeaderIcon} />
              <h2 className={styles.cardTitle}>General Store Profile</h2>
            </div>
            <span className={`${styles.statusBadge} ${styles.statusPaid}`}>Active</span>
          </div>

          <div className={styles.cardBody} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>Store Name</span>
              <p style={{ margin: '3px 0 0', fontWeight: 700, color: '#0A0A0A', fontSize: '0.9375rem' }}>{settings.storeName}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>Support Email</span>
                <p style={{ margin: '3px 0 0', fontSize: '0.8125rem', color: '#0A0A0A' }}>{settings.supportEmail}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>Support Phone</span>
                <p style={{ margin: '3px 0 0', fontSize: '0.8125rem', color: '#0A0A0A' }}>{settings.supportPhone}</p>
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>Store Currency</span>
              <p style={{ margin: '3px 0 0', fontWeight: 600, fontSize: '0.8125rem', color: '#0A0A0A' }}>{settings.currency} (Indian Rupee ₹)</p>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Parameters */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <Truck size={16} className={styles.sectionHeaderIcon} />
              <h2 className={styles.cardTitle}>Shipping & Payments</h2>
            </div>
          </div>

          <div className={styles.cardBody} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>Free Shipping Threshold</span>
                <p style={{ margin: '3px 0 0', fontWeight: 700, color: '#0A0A0A', fontSize: '0.875rem' }}>₹{settings.freeShippingThreshold?.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>Standard Shipping Fee</span>
                <p style={{ margin: '3px 0 0', fontWeight: 600, color: '#0A0A0A', fontSize: '0.875rem' }}>₹{settings.standardShippingFee}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>Cash on Delivery</span>
                <p style={{ margin: '3px 0 0', fontWeight: 600, color: settings.codEnabled ? '#059669' : '#DC2626', fontSize: '0.8125rem' }}>
                  {settings.codEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>Standard GST Rate</span>
                <p style={{ margin: '3px 0 0', fontWeight: 600, color: '#0A0A0A', fontSize: '0.8125rem' }}>{settings.gstPercentage}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
