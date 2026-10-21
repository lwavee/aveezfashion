import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import styles from './BrandStorySection.module.css';

export interface BrandStoryProps {
  title?: string;
  paragraphs?: string[];
  ctaText?: string;
  ctaLink?: string;
  eyebrow?: string;
  image?: string;
}

export const BrandStorySection: React.FC<BrandStoryProps> = ({
  title = 'INDIVIDUALITY BY DESIGN.',
  paragraphs = [
    'Aveez Fashion was founded on a simple conviction: clothing should reflect confident self-expression, not mass conformity.',
    'Every garment begins with deliberate textile engineering. We source heavyweight, combed natural fibers, test drape mechanics, and refine boxy proportions to create pieces that feel substantial the moment you put them on.',
    'No fleeting micro-trends. Just timeless, modern fashion built to endure.',
  ],
  ctaText = 'OUR STORY',
  ctaLink = '/about',
  eyebrow = 'PHILOSOPHY & PURPOSE',
  image = '/images/atelier-manifesto.jpg',
}) => {
  // Extract key manifesto thesis from paragraphs
  const quoteText =
    paragraphs[0] ||
    'Clothing should reflect confident self-expression, not mass conformity.';

  const remainingParagraphs =
    paragraphs.length > 1
      ? paragraphs.slice(1)
      : [
          'Every garment begins with deliberate textile engineering. We source heavyweight, combed natural fibers, test drape mechanics, and refine boxy proportions to create pieces that feel substantial the moment you put them on.',
        ];

  const pillars = [
    {
      number: '01',
      title: 'TEXTILE ARCHITECTURE',
      desc: 'Custom 280–450 GSM combed cottons engineered for structured drape and all-day comfort.',
    },
    {
      number: '02',
      title: 'ENGINEERED PROPORTIONS',
      desc: 'Relaxed drop-shoulder silhouettes designed to drape naturally with modern, commanding presence.',
    },
    {
      number: '03',
      title: 'TIMELESS LONGEVITY',
      desc: 'Rejecting disposable micro-trends for versatile, logo-minimal pieces that endure season after season.',
    },
  ];

  const metrics = [
    { value: '450 GSM', label: 'Heavyweight Standard' },
    { value: 'BOXY FIT', label: 'Drop-Shoulder Cut' },
    { value: 'ZERO TRENDS', label: 'Timeless Longevity' },
    { value: 'PAN-INDIA', label: 'Express Delivery' },
  ];

  return (
    <section className={styles.section} aria-label="Brand Philosophy and Purpose">
      {/* Subtle Atmospheric Watermark */}
      <div className={styles.watermarkLogo} aria-hidden="true">
        <Logo variant="monogram" height={360} />
      </div>

      <div className={`container ${styles.container}`}>
        {/* Top Editorial Rulers & Atelier Metadata */}
        <div className={styles.atelierMetaBar}>
          <div className={styles.atelierTag}>
            <span className={styles.pulseDot} aria-hidden="true" />
            <span>ATELIER SPECIFICATION // CHAPTER 01</span>
          </div>
          <div className={styles.metaMonogram} aria-hidden="true">
            <Logo variant="monogram" height={24} />
          </div>
          <div className={styles.atelierCoordinate}>
            <span>EST. 2024 / ARCHITECTURAL STREETWEAR</span>
          </div>
        </div>

        {/* Main Editorial Split Grid */}
        <div className={styles.editorialGrid}>
          {/* Column 1: Literary Manifesto & Philosophy */}
          <div className={styles.textColumn}>
            <div className={styles.eyebrowWrapper}>
              <span className={styles.sectionSubtitle}>{eyebrow}</span>
            </div>

            <h2 className={styles.title}>{title}</h2>

            {/* Featured Pull Quote Callout */}
            <blockquote className={styles.pullQuote}>
              <span className={styles.quoteMark} aria-hidden="true">
                “
              </span>
              <p className={styles.quoteContent}>{quoteText}</p>
            </blockquote>

            {/* Supporting Copy */}
            <div className={styles.narrativeBlock}>
              {remainingParagraphs.map((p, idx) => (
                <p key={idx} className={styles.paragraph}>
                  {p}
                </p>
              ))}
            </div>

            {/* 3 Brand Craft Pillars */}
            <div className={styles.pillarsList}>
              {pillars.map((pillar) => (
                <div key={pillar.number} className={styles.pillarItem}>
                  <div className={styles.pillarHeader}>
                    <span className={styles.pillarNumber}>{pillar.number}</span>
                    <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                  </div>
                  <p className={styles.pillarDesc}>{pillar.desc}</p>
                </div>
              ))}
            </div>

            {/* Actions & Atelier Signature */}
            <div className={styles.actionsRow}>
              <Link href={ctaLink} className={styles.primaryCta}>
                <span>{ctaText}</span>
                <ArrowUpRight size={18} className={styles.ctaArrow} />
              </Link>

              <Link href="/collections/aveez-originals" className={styles.secondaryLink}>
                <span>EXPLORE ORIGINALS</span>
                <span className={styles.arrowSmall} aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Column 2: Visual Atelier Photography & Tactile Label */}
          <div className={styles.visualColumn}>
            <div className={styles.visualCard}>
              {/* Main Atelier Photography */}
              <div className={styles.imageWrapper}>
                <Image
                  src={image}
                  alt="Aveez Fashion textile engineering and luxury garment drape in atelier"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 580px"
                  quality={90}
                  className={styles.mainImage}
                />
                <div className={styles.imageOverlay} />
              </div>

              {/* Top Floating Badge */}
              <div className={styles.topSpecBadge}>
                <span className={styles.specDot} />
                <span>COMBED 450 GSM HEAVYWEIGHT</span>
              </div>

              {/* Floating Tactile Garment Label Card */}
              <div className={styles.tactileLabelCard}>
                <div className={styles.labelHeader}>
                  <Logo variant="monogram" height={18} />
                  <span className={styles.labelBrand}>AVEEZ FASHION</span>
                  <span className={styles.labelCode}>NO. 001</span>
                </div>

                <div className={styles.labelDivider} />

                <div className={styles.labelSpecs}>
                  <div className={styles.labelRow}>
                    <span className={styles.specKey}>FABRIC</span>
                    <span className={styles.specVal}>100% COMBED NATURAL COTTON</span>
                  </div>
                  <div className={styles.labelRow}>
                    <span className={styles.specKey}>WEIGHT</span>
                    <span className={styles.specVal}>HEAVYWEIGHT 280–450 GSM</span>
                  </div>
                  <div className={styles.labelRow}>
                    <span className={styles.specKey}>ORIGIN</span>
                    <span className={styles.specVal}>DESIGNED IN INDIA</span>
                  </div>
                </div>

                <div className={styles.labelFooter}>
                  <div className={styles.barcode} aria-hidden="true" />
                  <span className={styles.labelInstruction}>
                    WEAR WITH CONFIDENT INDIVIDUALITY
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metrics Ribbon */}
        <div className={styles.metricsBar}>
          {metrics.map((m, idx) => (
            <div key={idx} className={styles.metricItem}>
              <span className={styles.metricValue}>{m.value}</span>
              <span className={styles.metricLabel}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
