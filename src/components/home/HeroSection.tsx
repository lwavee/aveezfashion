import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import styles from './HeroSection.module.css';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  desktopImage?: string;
  mobileImage?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export const HeroSection: React.FC<HeroProps> = ({
  headline = 'WEAR DIFFERENT.',
  subheadline = 'Discover fashion designed for individuality. Heavyweight textiles & architectural silhouettes.',
  desktopImage = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1920&auto=format&fit=crop',
  mobileImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1080&auto=format&fit=crop',
  primaryCtaText = 'SHOP MEN',
  primaryCtaLink = '/shop?gender=MEN',
  secondaryCtaText = 'SHOP WOMEN',
  secondaryCtaLink = '/shop?gender=WOMEN',
}) => {
  return (
    <section className={styles.hero} aria-label="Hero Showcase">
      <div className={styles.mediaContainer}>
        {/* Desktop Image */}
        <Image
          src={desktopImage}
          alt="Aveez Fashion Editorial Campaign"
          fill
          priority
          sizes="100vw"
          className={`${styles.image} ${styles.desktopOnly}`}
        />
        {/* Mobile Image */}
        <Image
          src={mobileImage}
          alt="Aveez Fashion Editorial Campaign"
          fill
          priority
          sizes="100vw"
          className={`${styles.image} ${styles.mobileOnly}`}
        />
        {/* Subtle Dark Vignette Overlay for Readability */}
        <div className={styles.overlay} />
      </div>

      <div className={`container ${styles.contentContainer}`}>
        <div className={styles.heroContent}>
          <span className={styles.capsuleBadge}>CHAPTER 01 / NEW DROP</span>
          <h1 className={styles.headline}>{headline}</h1>
          <p className={styles.subheadline}>{subheadline}</p>
          <div className={styles.ctaGroup}>
            <Link href={primaryCtaLink}>
              <Button variant="inverted" size="lg">
                {primaryCtaText}
              </Button>
            </Link>
            <Link href={secondaryCtaLink}>
              <Button variant="outline" size="lg" className={styles.whiteOutlineBtn}>
                {secondaryCtaText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
