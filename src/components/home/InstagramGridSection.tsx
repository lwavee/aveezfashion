import React from 'react';
import Image from 'next/image';
import { Instagram } from 'lucide-react';
import styles from './InstagramGridSection.module.css';

interface EditorialPost {
  id: string;
  image: string;
  alt: string;
  label: string;
  reelUrl: string;
  objectPosition?: string;
}

export const InstagramGridSection: React.FC = () => {
  // Real Aveez Fashion Instagram Reel covers and links
  const posts: EditorialPost[] = [
    {
      id: 'reel-1',
      image: '/images/reels/reel-1.jpg',
      alt: 'Aveez Fashion Reel Look 01 — Together In Style Couple Ensemble',
      label: 'EDITORIAL 01',
      reelUrl: 'https://www.instagram.com/reel/DQWqjskjfnQ/',
      objectPosition: 'center 35%',
    },
    {
      id: 'reel-4',
      image: '/images/reels/reel-4.jpg',
      alt: 'Aveez Fashion Reel Look 02 — Handcrafted Pastel Floral Suit',
      label: 'EDITORIAL 02',
      reelUrl: 'https://www.instagram.com/reel/DQMXQ4NCSLE/',
      objectPosition: 'center 30%',
    },
    {
      id: 'reel-2',
      image: '/images/reels/reel-2.jpg',
      alt: 'Aveez Fashion Reel Look 03 — Embroidered Anarkali Ensemble',
      label: 'EDITORIAL 03',
      reelUrl: 'https://www.instagram.com/reel/DQUDXawif0G/',
      objectPosition: 'center 20%',
    },
    {
      id: 'reel-3',
      image: '/images/reels/reel-3.jpg',
      alt: 'Aveez Fashion Reel Look 04 — Daylight Printed Casual Kurti',
      label: 'EDITORIAL 04',
      reelUrl: 'https://www.instagram.com/reel/DQO-GifiWQd/',
      objectPosition: 'center 18%',
    },
  ];

  const dominantPost = posts[0];
  const supportingPosts = posts.slice(1);

  return (
    <section
      className={styles.section}
      aria-label="Community & Editorial — As Seen on the Street"
    >
      <div className={`container ${styles.container}`}>
        {/* Editorial Section Header */}
        <div className={styles.header}>
          <div className={styles.titleStack}>
            <span className={styles.eyebrow}>COMMUNITY & EDITORIAL</span>
            <h2 className={styles.heading}>AS SEEN ON THE STREET</h2>
            <p className={styles.supportingText}>
              Real style. Individual expression. The Aveez perspective.
            </p>
          </div>

          <a
            href="https://www.instagram.com/aveez_fashion/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.desktopCta}
            aria-label="Follow @aveezfashion on Instagram"
          >
            <Instagram size={15} strokeWidth={1.8} aria-hidden="true" />
            <span>FOLLOW @AVEEZFASHION</span>
            <span className={styles.ctaArrow} aria-hidden="true">↗</span>
          </a>
        </div>

        {/* Asymmetric Editorial Gallery Grid */}
        <div className={styles.editorialGrid}>
          {/* 1. Visually Dominant Feature Reel (Left Column) */}
          <article className={styles.dominantCard}>
            <a
              href={dominantPost.reelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cardLink}
              aria-label={`Watch ${dominantPost.label} on Instagram`}
            >
              <Image
                src={dominantPost.image}
                alt={dominantPost.alt}
                fill
                priority={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 680px"
                className={styles.image}
                style={{ objectPosition: dominantPost.objectPosition || 'center center' }}
              />

              {/* Discreet Editorial Badge */}
              <span className={styles.lookBadge}>{dominantPost.label}</span>

              {/* Instagram Glyph */}
              <span className={styles.socialIcon} aria-hidden="true">
                <Instagram size={15} strokeWidth={1.8} />
              </span>

              {/* Restrained Hover Reveal Prompt */}
              <div className={styles.hoverPrompt} aria-hidden="true">
                <span>WATCH REEL ↗</span>
              </div>
            </a>
          </article>

          {/* 2. Supporting Editorial Stack (Right Column) */}
          <div className={styles.supportingStack}>
            {/* Top Supporting Card (Look 02) */}
            <article className={styles.supportingTopCard}>
              <a
                href={supportingPosts[0].reelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cardLink}
                aria-label={`Watch ${supportingPosts[0].label} on Instagram`}
              >
                <Image
                  src={supportingPosts[0].image}
                  alt={supportingPosts[0].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 560px"
                  className={styles.image}
                  style={{
                    objectPosition: supportingPosts[0].objectPosition || 'center center',
                  }}
                />
                <span className={styles.lookBadge}>{supportingPosts[0].label}</span>
                <span className={styles.socialIcon} aria-hidden="true">
                  <Instagram size={14} strokeWidth={1.8} />
                </span>
                <div className={styles.hoverPrompt} aria-hidden="true">
                  <span>WATCH REEL ↗</span>
                </div>
              </a>
            </article>

            {/* Bottom Row Supporting Pair (Look 03 & Look 04) */}
            <div className={styles.supportingBottomRow}>
              {supportingPosts.slice(1).map((post) => (
                <article key={post.id} className={styles.supportingBottomCard}>
                  <a
                    href={post.reelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.cardLink}
                    aria-label={`Watch ${post.label} on Instagram`}
                  >
                    <Image
                      src={post.image}
                      alt={post.alt}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 280px"
                      className={styles.image}
                      style={{ objectPosition: post.objectPosition || 'center center' }}
                    />
                    <span className={styles.lookBadge}>{post.label}</span>
                    <span className={styles.socialIcon} aria-hidden="true">
                      <Instagram size={14} strokeWidth={1.8} />
                    </span>
                    <div className={styles.hoverPrompt} aria-hidden="true">
                      <span>WATCH REEL ↗</span>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View / Follow Link */}
        <div className={styles.mobileCtaWrapper}>
          <a
            href="https://www.instagram.com/aveez_fashion/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobileCtaLink}
            aria-label="Follow @aveezfashion on Instagram"
          >
            <Instagram size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>FOLLOW @AVEEZFASHION</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
};
