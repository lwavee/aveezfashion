import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './AveezOriginalsSection.module.css';

export interface AveezOriginalsProps {
  eyebrow?: string;
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
  eyebrow = 'THE AVEEZ SIGNATURE',
  tagline,
  collectionId = '01 / SIGNATURE COLLECTION',
  headline = 'DESIGNED TO STAND APART.',
  description = 'Distinctive silhouettes. Considered details. A personal expression of modern style.',
  image = '/images/originals/aveez-originals-campaign.jpg',
  imageCaption = 'STUDIO ARCHIVE — VOL. 01',
  ctaText = 'DISCOVER AVEEZ ORIGINALS',
  ctaLink = '/collections/aveez-originals',
}) => {
  // Graceful fallback to guarantee editorial excellence even if legacy content strings are provided
  const resolvedEyebrow =
    eyebrow && eyebrow !== 'CHAPTER 01 / SIGNATURE DROP'
      ? eyebrow
      : tagline && tagline !== 'CHAPTER 01 / SIGNATURE DROP'
      ? tagline
      : 'THE AVEEZ SIGNATURE';

  const resolvedHeadline =
    headline && headline !== 'THE ARCHITECTURAL SILHOUETTE'
      ? headline
      : 'DESIGNED TO STAND APART.';

  const resolvedDescription =
    description && !description.includes('450 GSM')
      ? description
      : 'Distinctive silhouettes. Considered details. A personal expression of modern style.';

  const resolvedCtaText =
    ctaText && ctaText !== 'EXPLORE AVEEZ ORIGINALS'
      ? ctaText
      : 'DISCOVER AVEEZ ORIGINALS';

  const resolvedCtaLink = ctaLink || '/collections/aveez-originals';

  const resolvedImage =
    image && !image.includes('photo-1552374196-1ab2a1c593e8')
      ? image
      : '/images/originals/aveez-originals-campaign.jpg';

  return (
    <section className={styles.section} aria-label="Aveez Originals Editorial Campaign">
      <div className={`container ${styles.container}`}>
        <div className={styles.editorialGrid}>
          {/* Left Column — Editorial Brand Story */}
          <div className={styles.storyCol}>
            <div className={styles.storyContent}>
              {/* Subtle Label & Collection Identifier */}
              <div className={styles.metaRow}>
                <span className={styles.brandTag}>AVEEZ ORIGINALS</span>
                <span className={styles.metaDivider} aria-hidden="true">
                  /
                </span>
                <span className={styles.collectionIdentifier}>{collectionId}</span>
              </div>

              {/* Small Eyebrow */}
              <span className={styles.eyebrow}>{resolvedEyebrow}</span>

              {/* Main Headline */}
              <h2 className={styles.headline}>{resolvedHeadline}</h2>

              {/* Supporting Copy */}
              <p className={styles.description}>{resolvedDescription}</p>

              {/* Minimal Divider */}
              <div className={styles.hairlineDivider} aria-hidden="true" />

              {/* Restrained Text Link CTA */}
              <div className={styles.ctaWrapper}>
                <Link
                  href={resolvedCtaLink}
                  className={styles.ctaLink}
                  aria-label={`${resolvedCtaText} — View Aveez Originals collection`}
                >
                  <span className={styles.ctaText}>{resolvedCtaText}</span>
                  <span className={styles.ctaArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column — Dominant Campaign Photography */}
          <div className={styles.campaignCol}>
            <div className={styles.imageCard}>
              <Image
                src={resolvedImage}
                alt="Aveez Originals Editorial Campaign — Designed to Stand Apart"
                fill
                priority={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 650px"
                className={styles.image}
              />

              {/* Discreet Image Caption */}
              {imageCaption && (
                <div className={styles.imageCaption}>
                  <span>{imageCaption}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
