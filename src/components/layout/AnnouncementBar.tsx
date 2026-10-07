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
  message = 'FREE EXPRESS SHIPPING ON ALL ORDERS ABOVE ₹1,999',
  ctaText = 'SHOP NEW DROP',
  ctaLink = '/shop',
}) => {
  return (
    <div className={styles.bar}>
      <div className={styles.content}>
        <span className={styles.message}>{message}</span>
        {ctaText && ctaLink ? (
          <Link href={ctaLink} className={styles.cta}>
            {ctaText} →
          </Link>
        ) : null}
      </div>
    </div>
  );
};
