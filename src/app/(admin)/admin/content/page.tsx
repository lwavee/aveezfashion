import React from 'react';
import { CatalogService } from '@/server/services/catalogService';
import { SlidersHorizontal, CheckCircle2, Megaphone, Image as ImageIcon, BookOpen } from 'lucide-react';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  const content = await CatalogService.getHomepageContent();

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.titleStack}>
          <h1 className={styles.pageTitle}>Homepage Content</h1>
          <p className={styles.pageSubtitle}>
            Configure public announcements, hero banner slides, and brand editorial messaging.
          </p>
        </div>
      </div>

      <div className={styles.twoColumnGrid}>
        {/* Announcement Bar Settings Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <Megaphone size={16} className={styles.sectionHeaderIcon} />
              <h2 className={styles.cardTitle}>Announcement Bar</h2>
            </div>
            <span className={`${styles.statusBadge} ${content.announcementBar?.isActive ? styles.statusPaid : styles.statusPending}`}>
              {content.announcementBar?.isActive ? 'Active' : 'Disabled'}
            </span>
          </div>

          <div className={styles.cardBody} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>
                Broadcast Message
              </span>
              <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0A0A0A', fontSize: '0.875rem' }}>
                {content.announcementBar?.message || 'FREE SHIPPING ON ALL ORDERS ABOVE ₹1,999'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>CTA Label</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: '#0A0A0A' }}>
                  {content.announcementBar?.ctaText || 'SHOP NEW DROP'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>Target URL</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: '#0A0A0A' }}>
                  {content.announcementBar?.ctaLink || '/shop'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Editorial Philosophy */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <BookOpen size={16} className={styles.sectionHeaderIcon} />
              <h2 className={styles.cardTitle}>Brand Story Block</h2>
            </div>
          </div>

          <div className={styles.cardBody} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>Headline</span>
              <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#0A0A0A', fontSize: '0.875rem' }}>
                {content.brandStory?.title || 'INDIVIDUALITY BY DESIGN.'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase' }}>Paragraph Summary</span>
              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#52525B', lineHeight: 1.5 }}>
                {content.brandStory?.paragraphs?.[0] || 'Aveez Fashion was founded on a simple conviction: clothing should reflect confident self-expression.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
