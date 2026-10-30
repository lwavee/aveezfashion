'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import styles from './AccessoriesHero.module.css';

export interface AccessoriesHeroProps {
  totalCount?: number;
  primaryImageUrl?: string;
  secondaryImageUrl?: string;
  collectionAnchorId?: string;
}

const DEFAULT_PRIMARY_IMAGE = '/api/media/together/made-for-two.webp';
const DEFAULT_SECONDARY_IMAGE = '/api/media/campaigns/diwali/accessories.webp';

export const AccessoriesHero: React.FC<AccessoriesHeroProps> = ({
  totalCount,
  primaryImageUrl = DEFAULT_PRIMARY_IMAGE,
  secondaryImageUrl = DEFAULT_SECONDARY_IMAGE,
  collectionAnchorId = 'accessories-collection',
}) => {
  const handleScrollToCollection = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(collectionAnchorId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className={styles.heroSection}
      aria-label="Accessories Editorial Campaign"
    >
      <div className={styles.heroGrid}>
        {/* Left Column: Editorial Copy */}
        <div className={styles.editorialCol}>
          <div className={styles.eyebrowWrapper}>
            <span className={styles.eyebrowDot} />
            <span className={styles.eyebrow}>THE AVEEZ ACCESSORIES EDIT</span>
            <span className={styles.eyebrowDivider}>—</span>
            <span className={styles.eyebrowSeries}>SERIES 01</span>
          </div>

          <h1 className={styles.headline}>
            <span className={styles.headlineSans}>THE ART OF THE</span>{' '}
            <span className={styles.headlineSerif}>Finishing Touch</span>
          </h1>

          {/* Mobile-only Campaign Preview (placed directly under headline for intentional mobile hierarchy) */}
          <div className={styles.mobileMediaPreview} aria-hidden="true">
            <div className={styles.mobileImageContainer}>
              <Image
                src={primaryImageUrl}
                alt="AVEEZ FASHION accessories editorial campaign"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 400px"
                className={styles.editorialImg}
              />
              <div className={styles.mobileImageOverlay} />
              <div className={styles.mobileImageTag}>
                <span>AVEEZ ATELIER</span>
                <span className={styles.tagDivider}>•</span>
                <span>HANDCRAFTED ACCENTS</span>
              </div>
            </div>
          </div>

          <p className={styles.supportingText}>
            Deliberately designed to complete and personalise everyday silhouettes.
            From artisan floral embroidery to sculpted hair architecture and tactile
            metal hardware, each piece brings deliberate individuality to contemporary
            tailoring.
          </p>

          <div className={styles.actionRow}>
            <a
              href={`#${collectionAnchorId}`}
              onClick={handleScrollToCollection}
              className={styles.ctaLink}
              aria-label="Explore the full accessories collection"
            >
              <span className={styles.ctaText}>EXPLORE THE COLLECTION</span>
              <ArrowRight size={14} className={styles.ctaArrow} />
            </a>

            {typeof totalCount === 'number' && totalCount > 0 && (
              <div className={styles.counterBadge}>
                <span className={styles.counterDot} />
                <span className={styles.counterText}>
                  {totalCount} {totalCount === 1 ? 'PIECE' : 'CURATED PIECES'} AVAILABLE
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fashion Campaign Photography (Desktop & Tablet) */}
        <div className={styles.mediaCol} aria-label="Accessories Campaign Showcase">
          <div className={styles.compositionWrapper}>
            {/* Main Primary Campaign Image */}
            <div className={styles.primaryImageCard}>
              <Image
                src={primaryImageUrl}
                alt="Handcrafted artisan floral headband styled with contemporary tailoring"
                fill
                priority
                sizes="(max-width: 1024px) 50vw, 640px"
                className={styles.editorialImg}
              />
              <div className={styles.imageOverlay} />
              <div className={styles.campaignStamp}>
                <span className={styles.stampEditorial}>EDITORIAL CAMPAIGN</span>
                <span className={styles.stampTitle}>THE FINISHING TOUCH</span>
              </div>
            </div>

            {/* Secondary Layered Inset Card */}
            <div className={styles.secondaryImageCard}>
              <div className={styles.secondaryImageContainer}>
                <Image
                  src={secondaryImageUrl}
                  alt="Sculpted claw clip and minimalist hair clip detail"
                  fill
                  sizes="(max-width: 1024px) 25vw, 240px"
                  className={styles.secondaryImg}
                />
              </div>
              <div className={styles.secondaryCaption}>
                <span className={styles.secondarySub}>ACCENT DETAIL</span>
                <span className={styles.secondaryTitle}>SCULPTED HARDWARE</span>
              </div>
            </div>

            {/* Editorial Spec Mark */}
            <div className={styles.specMark} aria-hidden="true">
              <span>01 / ATELIER EDITION</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
