'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Instagram, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import styles from './InstagramGridSection.module.css';

interface EditorialPost {
  id: string;
  image: string;
  alt: string;
  label: string;
  title: string;
  subtitle: string;
  reelUrl: string;
  objectPosition?: string;
}

export const InstagramGridSection: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Mouse drag-to-scroll interaction
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftPosRef = useRef(0);
  const hasMovedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  // Real Aveez Fashion Instagram Reel covers and links
  const posts: EditorialPost[] = [
    {
      id: 'reel-1',
      image: '/images/reels/reel-1.jpg',
      alt: 'Aveez Fashion Reel Look 01 — Together In Style Couple Ensemble',
      label: 'EDITORIAL 01',
      title: 'Together In Style',
      subtitle: 'Coordinated Couple Fits',
      reelUrl: 'https://www.instagram.com/reel/DQWqjskjfnQ/',
      objectPosition: 'center 35%',
    },
    {
      id: 'reel-4',
      image: '/images/reels/reel-4.jpg',
      alt: 'Aveez Fashion Reel Look 02 — Handcrafted Pastel Floral Suit',
      label: 'EDITORIAL 02',
      title: 'Atelier Pastel Suit',
      subtitle: 'Handcrafted Floral Work',
      reelUrl: 'https://www.instagram.com/reel/DQMXQ4NCSLE/',
      objectPosition: 'center 30%',
    },
    {
      id: 'reel-2',
      image: '/images/reels/reel-2.jpg',
      alt: 'Aveez Fashion Reel Look 03 — Embroidered Anarkali Ensemble',
      label: 'EDITORIAL 03',
      title: 'Noir Embroidered Edit',
      subtitle: 'Signature Festive Silhouette',
      reelUrl: 'https://www.instagram.com/reel/DQUDXawif0G/',
      objectPosition: 'center 20%',
    },
    {
      id: 'reel-3',
      image: '/images/reels/reel-3.jpg',
      alt: 'Aveez Fashion Reel Look 04 — Daylight Printed Casual Kurti',
      label: 'EDITORIAL 04',
      title: 'Daylight Indigo Print',
      subtitle: 'Relaxed Daily Tailoring',
      reelUrl: 'https://www.instagram.com/reel/DQO-GifiWQd/',
      objectPosition: 'center 18%',
    },
    {
      id: 'reel-5',
      image: '/images/reels/reel-5.jpg',
      alt: 'Aveez Fashion Reel Look 05 — Contemporary Youth Silhouette',
      label: 'EDITORIAL 05',
      title: 'The Modern Narrative',
      subtitle: 'Youth & Street Expression',
      reelUrl: 'https://www.instagram.com/aveez_fashion/',
      objectPosition: 'center 25%',
    },
  ];

  const checkScrollState = useCallback(() => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    checkScrollState();
    track.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);

    return () => {
      track.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [checkScrollState]);

  const handleScroll = (direction: 'prev' | 'next') => {
    if (!trackRef.current) return;
    const firstCard = trackRef.current.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.offsetWidth || 280;
    const gap = window.innerWidth <= 768 ? 14 : 20;
    const stepCards = window.innerWidth <= 768 ? 1 : 2;
    const scrollAmount = (cardWidth + gap) * stepCards;

    trackRef.current.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    isDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeftPosRef.current = trackRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current || !trackRef.current) return;
    const currentX = e.pageX - trackRef.current.offsetLeft;
    const distance = currentX - startXRef.current;

    if (Math.abs(distance) > 6) {
      hasMovedRef.current = true;
      if (!isDragging) setIsDragging(true);
      trackRef.current.scrollLeft = scrollLeftPosRef.current - distance;
    }
  };

  const handleMouseUpOrLeave = () => {
    if (!isDownRef.current) return;
    isDownRef.current = false;
    setTimeout(() => {
      setIsDragging(false);
      hasMovedRef.current = false;
    }, 50);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section
      className={styles.section}
      aria-label="Community & Editorial — As Seen on the Street"
    >
      <div className={`container ${styles.container}`}>
        {/* Editorial Section Header with Integrated Slider Controls */}
        <div className={styles.header}>
          <div className={styles.titleStack}>
            <div className={styles.eyebrowRow}>
              <span className={styles.eyebrowLine} aria-hidden="true" />
              <span className={styles.eyebrow}>COMMUNITY & EDITORIAL</span>
              <span className={styles.eyebrowLine} aria-hidden="true" />
            </div>
            <h2 className={styles.heading}>AS SEEN ON THE STREET</h2>
            <p className={styles.supportingText}>
              Real style. Individual expression. The Aveez perspective.
            </p>
          </div>

          <div className={styles.headerActions}>
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

            <div className={styles.navControls} aria-label="Reels Slider Controls">
              <button
                type="button"
                onClick={() => handleScroll('prev')}
                className={`${styles.arrowBtn} ${styles.arrowBtnPrev} ${!canScrollLeft ? styles.arrowBtnDisabled : ''}`}
                aria-label="Previous reels"
                disabled={!canScrollLeft}
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={() => handleScroll('next')}
                className={`${styles.arrowBtn} ${styles.arrowBtnNext} ${!canScrollRight ? styles.arrowBtnDisabled : ''}`}
                aria-label="Next reels"
                disabled={!canScrollRight}
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Single-Line Reels Slider Track */}
        <div
          ref={trackRef}
          className={`${styles.reelsTrack} ${isDragging ? styles.isDragging : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onClickCapture={handleClickCapture}
        >
          {posts.map((post, idx) => (
            <article key={post.id} className={styles.reelCard}>
              <a
                href={post.reelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cardLink}
                aria-label={`Watch ${post.label} on Instagram`}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={post.image}
                    alt={post.alt}
                    fill
                    priority={idx < 3}
                    sizes="(max-width: 640px) 70vw, (max-width: 1024px) 35vw, 25vw"
                    className={styles.image}
                    style={{ objectPosition: post.objectPosition || 'center center' }}
                  />

                  {/* Gradient Overlays */}
                  <div className={styles.topVignette} aria-hidden="true" />
                  <div className={styles.bottomVignette} aria-hidden="true" />

                  {/* Top Header inside Card */}
                  <div className={styles.cardTopRow}>
                    <span className={styles.lookBadge}>{post.label}</span>
                    <span className={styles.instagramBadge} aria-hidden="true">
                      <Instagram size={14} strokeWidth={2} />
                    </span>
                  </div>

                  {/* Centered Glassmorphic Play Icon */}
                  <div className={styles.playButton} aria-hidden="true">
                    <Play size={18} fill="currentColor" strokeWidth={0} />
                  </div>

                  {/* Bottom Metadata & Hover Prompt */}
                  <div className={styles.cardFooter}>
                    <span className={styles.postSubtitle}>{post.subtitle}</span>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <div className={styles.hoverPrompt} aria-hidden="true">
                      <span>WATCH ON INSTAGRAM ↗</span>
                    </div>
                  </div>
                </div>
              </a>
            </article>
          ))}
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
            <span>FOLLOW @AVEEZFASHION ON INSTAGRAM</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
};
