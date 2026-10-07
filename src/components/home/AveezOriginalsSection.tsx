import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import styles from './AveezOriginalsSection.module.css';

interface AveezOriginalsProps {
  tagline?: string;
  headline?: string;
  description?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
}

export const AveezOriginalsSection: React.FC<AveezOriginalsProps> = ({
  tagline = 'CHAPTER 01 / SIGNATURE DROP',
  headline = 'THE ARCHITECTURAL SILHOUETTE',
  description = 'Crafted from custom 450 GSM luxury brushed French terry cotton with relaxed drop shoulders and structured drapes. Designed and constructed in India for those who value fabric substance over logos.',
  image = 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1400&auto=format&fit=crop',
  ctaText = 'EXPLORE AVEEZ ORIGINALS',
  ctaLink = '/collections/aveez-originals',
}) => {
  return (
    <section className={styles.section} aria-label="Aveez Originals Collection">
      <div className={`container ${styles.container}`}>
        <div className={styles.grid}>
          {/* Editorial Content Column */}
          <div className={styles.contentCol}>
            <div className={styles.brandTagWrapper}>
              <Logo variant="clothing-label" width={100} height={135} />
            </div>

            <div className={styles.textWrapper}>
              <span className={styles.tagline}>{tagline}</span>
              <h2 className={styles.headline}>{headline}</h2>
              <p className={styles.description}>{description}</p>

              <div className={styles.specsGrid}>
                <div className={styles.specItem}>
                  <span className={styles.specValue}>450 GSM</span>
                  <span className={styles.specLabel}>HEAVYWEIGHT FLEECE</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specValue}>100%</span>
                  <span className={styles.specLabel}>COMBED COTTON</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specValue}>LIMITED</span>
                  <span className={styles.specLabel}>BATCH RUN</span>
                </div>
              </div>

              <div className={styles.ctaWrapper}>
                <Link href={ctaLink}>
                  <Button variant="primary" size="lg">
                    {ctaText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Visual Showcase Column */}
          <div className={styles.visualCol}>
            <div className={styles.imageCard}>
              <Image
                src={image}
                alt="Aveez Originals Lookbook Editorial"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={styles.image}
              />
              <div className={styles.badgeOverlay}>
                <span>AVEEZ ORIGINALS EXCLUSIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
