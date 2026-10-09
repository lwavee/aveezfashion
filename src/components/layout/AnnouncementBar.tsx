'use client';

import React from 'react';
import Link from 'next/link';
import styles from './AnnouncementBar.module.css';

interface AnnouncementBarProps {
  message?: string;
  ctaText?: string;
  ctaLink?: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  message = 'FREE SHIPPING ON ALL ORDERS ABOVE ₹1,999',
  ctaText = 'SHOP NEW DROP',
  ctaLink = '/shop?filter=new',
}) => {
  return (
    <div className={styles.bar} role="region" aria-label="Announcement">
      <div className={styles.content}>
        <span className={styles.message}>{message}</span>
        {ctaText && ctaLink ? (
          <>
            <span className={styles.separator} aria-hidden="true">•</span>
            <Link href={ctaLink} className={styles.cta}>
              {ctaText} →
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
};
