import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './AveezOriginalsSection.module.css';

export interface AveezOriginalsProps {
  eyebrow?: string;
  secondaryLabel?: string;
  tagline?: string;
  collectionId?: string;
  headline?: string;
  description?: string;
  image?: string;
  imageCaption?: string;
  ctaText?: string;
  ctaLink?: string;
}

export const AveezOriginalsSection: React.FC<AveezOriginalsProps> = ({
  eyebrow = 'AVEEZ ORIGINALS — 01 / SIGNATURE COLLECTION',
  secondaryLabel = 'THE AVEEZ SIGNATURE',
  tagline,
  collectionId,
  headline = 'NOT MADE TO BLEND IN.',
  description = 'Distinctive style. Individual expression. A different point of view.',
  image = '/api/media/campaigns/signature.webp',
  ctaText = 'EXPLORE THE COLLECTION ↗',
  ctaLink = '/collections/aveez-originals',
}) => {
  // Editorial content resolution — guarantees design fidelity while respecting intentional overrides
  const resolvedEyebrow =
    eyebrow && !eyebrow.includes('CHAPTER 01') && eyebrow !== 'THE AVEEZ SIGNATURE'
      ? eyebrow
      : tagline && !tagline.includes('CHAPTER 01')
      ? tagline
      : 'AVEEZ ORIGINALS — 01 / SIGNATURE COLLECTION';

  const resolvedSecondaryLabel =
    secondaryLabel || (collectionId ? collectionId : 'THE AVEEZ SIGNATURE');

  const resolvedHeadline =
    headline &&
    headline !== 'THE ARCHITECTURAL SILHOUETTE' &&
    headline !== 'DESIGNED TO STAND APART.'
      ? headline
      : 'NOT MADE TO BLEND IN.';

  const resolvedDescription =
    description &&
    !description.includes('450 GSM') &&
    !description.includes('silhouettes. Considered details')
      ? description
      : 'Distinctive style. Individual expression. A different point of view.';

  // Standardize CTA text label and arrow handling
  const cleanCtaLabel =
    ctaText &&
    ctaText !== 'DISCOVER AVEEZ ORIGINALS' &&
    ctaText !== 'EXPLORE AVEEZ ORIGINALS'
      ? ctaText.replace('↗', '').trim()
      : 'EXPLORE THE COLLECTION';

  const resolvedCtaLink = ctaLink || '/collections/aveez-originals';

  const resolvedImage =
    image &&
    !image.includes('aveez-originals-campaign') &&
    !image.includes('photo-1552374196')
      ? image
      : '/api/media/campaigns/signature.webp';

  return (
    <section
      className={styles.section}
      aria-label="Aveez Originals — Signature Collection"
    >
      {/* 1. Full-Bleed Campaign Image Background */}
      <div className={styles.imageBackground} aria-hidden="true">
        <Image
          src={resolvedImage}
          alt=""
          fill
          priority={false}
          sizes="100vw"
          quality={90}
          className={styles.bgImage}
        />
        {/* Subtle Directional Scrim (preserves model and architecture) */}
        <div className={styles.scrimOverlay} />
      </div>

      {/* 2. Editorial Typography & Content Block */}
      <div className={`container ${styles.container}`}>
        <div className={styles.contentBlock}>
          {/* Metadata Stack: Secondary Label & Small Eyebrow */}
          <div className={styles.metaStack}>
            {resolvedSecondaryLabel && (
              <span className={styles.secondaryLabel}>
                <span className={styles.labelIndicator} aria-hidden="true" />
                {resolvedSecondaryLabel}
              </span>
            )}
            <span className={styles.eyebrow}>{resolvedEyebrow}</span>
          </div>

          {/* Main Editorial Headline */}
          <h2 className={styles.headline}>{resolvedHeadline}</h2>

          {/* Minimal Editorial Divider */}
          <div className={styles.divider} aria-hidden="true" />

          {/* Supporting Copy */}
          <p className={styles.description}>{resolvedDescription}</p>

          {/* Primary CTA Link */}
          <div className={styles.ctaWrapper}>
            <Link
              href={resolvedCtaLink}
              className={styles.ctaLink}
              aria-label={`${cleanCtaLabel} — Explore Aveez Originals signature collection`}
            >
              <span className={styles.ctaText}>{cleanCtaLabel}</span>
              <span className={styles.ctaArrow} aria-hidden="true">
                ↗
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
