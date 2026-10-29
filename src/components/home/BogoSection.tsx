import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import styles from './BogoSection.module.css';

interface BogoSectionProps {
  code?: string;
  ctaLink?: string;
}

export const BogoSection: React.FC<BogoSectionProps> = ({
  code = 'DIWALIBOGO',
  ctaLink = '/shop?filter=bogo',
}) => {
  return (
    <section className={`container ${styles.section}`} aria-label="Festive Buy 1 Get 1 Free Offer">
      <div className={styles.bannerContainer}>
        {/* Background Visual Accent */}
        <div className={styles.visualColumn}>
          <Image
            src="/uploads/campaigns/diwali/diwali-bogo-banner.webp"
            alt="Diwali Buy 1 Get 1 Free Festive Campaign"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={styles.bannerImage}
            style={{ objectPosition: 'center 25%' }}
          />
          <div className={styles.imageOverlay} />
        </div>

        {/* Offer Details Column */}
        <div className={styles.detailsColumn}>
          <div className={styles.badgeRow}>
            <span className={styles.pillBadge}>
              <Sparkles size={13} className={styles.badgeIcon} aria-hidden="true" />
              EXCLUSIVE FESTIVE PRIVILEGE
            </span>
          </div>

          <h2 className={styles.title}>
            BUY 1, GET 1 FREE
          </h2>
          <p className={styles.subtitle}>
            Double your celebrations. Pair any two handcrafted festive essentials or architectural silhouettes — the second item is on us.
          </p>

          <div className={styles.codeCard}>
            <div className={styles.codeInfo}>
              <span className={styles.codeLabel}>APPLY PROMO CODE AT CHECKOUT</span>
              <span className={styles.codeText}>{code}</span>
            </div>
            <div className={styles.codeAction}>
              <span className={styles.autoAppliedText}>Instant Cart Discount</span>
            </div>
          </div>

          {/* Explicit Terms */}
          <ul className={styles.termsList}>
            <li className={styles.termItem}>
              <CheckCircle2 size={16} className={styles.checkIcon} aria-hidden="true" />
              <span>Add any 2 eligible items to cart; equal or lower value item is 100% free.</span>
            </li>
            <li className={styles.termItem}>
              <CheckCircle2 size={16} className={styles.checkIcon} aria-hidden="true" />
              <span>Valid across Men’s & Women’s festive drops, kurtas, and heavyweight tees.</span>
            </li>
            <li className={styles.termItem}>
              <CheckCircle2 size={16} className={styles.checkIcon} aria-hidden="true" />
              <span>Free doorstep delivery & 7-day hassle-free size exchange included.</span>
            </li>
          </ul>

          <div className={styles.ctaRow}>
            <Link href={ctaLink} className={styles.ctaButton} aria-label="Shop Buy 1 Get 1 Free Collection">
              <span>EXPLORE BOGO COLLECTION</span>
              <ArrowRight size={16} className={styles.ctaArrow} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
