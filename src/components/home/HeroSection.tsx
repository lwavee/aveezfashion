'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './HeroSection.module.css';

export interface HeroSlide {
  id: number;
  label: string;
  tagline: string;
  headingLine1: string;
  headingLine2: string;
  description: string;
  image: string;
  alt: string;
  menLink: string;
  womenLink: string;
  menText?: string;
  womenText?: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 1,
    label: '01',
    tagline: 'CHAPTER 01 / NEW DROP',
    headingLine1: 'WEAR',
    headingLine2: 'DIFFERENT.',
    description: 'ARCHITECTURAL SILHOUETTES & HEAVYWEIGHT ESSENTIALS DESIGNED FOR INDIVIDUALITY.',
    image: '/images/heroimage1.png',
    alt: 'Aveez Fashion Editorial Campaign — Chapter 01 (Wear Different)',
    menLink: '/shop?gender=MEN',
    womenLink: '/shop?gender=WOMEN',
    menText: 'SHOP MEN →',
    womenText: 'SHOP WOMEN →',
  },
  {
    id: 2,
    label: '02',
    tagline: 'CHAPTER 02 / MONOCHROME EDIT',
    headingLine1: 'WEAR',
    headingLine2: 'DIFFERENT.',
    description: 'ARCHITECTURAL SILHOUETTES & HEAVYWEIGHT ESSENTIALS DESIGNED FOR INDIVIDUALITY.',
    image: '/images/heroimage2.png',
    alt: 'Aveez Fashion Editorial Campaign — Chapter 02 (Wear Different)',
    menLink: '/shop?gender=MEN',
    womenLink: '/shop?gender=WOMEN',
    menText: 'SHOP MEN →',
    womenText: 'SHOP WOMEN →',
  },
  {
    id: 3,
    label: '03',
    tagline: 'CHAPTER 03 / SIGNATURE CORE',
    headingLine1: 'WEAR',
    headingLine2: 'DIFFERENT.',
    description: 'ARCHITECTURAL SILHOUETTES & HEAVYWEIGHT ESSENTIALS DESIGNED FOR INDIVIDUALITY.',
    image: '/images/heroimage3.png',
    alt: 'Aveez Fashion Editorial Campaign — Chapter 03 (Wear Different)',
    menLink: '/shop?gender=MEN',
    womenLink: '/shop?gender=WOMEN',
    menText: 'SHOP MEN →',
    womenText: 'SHOP WOMEN →',
  },
];

interface HeroProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
}

export const HeroSection: React.FC<HeroProps> = ({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 6000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play timer
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, autoPlayInterval, totalSlides]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <section
      className={styles.heroSlider}
      aria-label="Editorial Campaign Hero Slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={styles.slidesWrapper}>
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className={`${styles.slide} ${isActive ? styles.activeSlide : ''}`}
              aria-hidden={!isActive}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className={styles.slideImage}
              />

              {/* Contrast enhancement vignette overlay on shadow side */}
              <div className={styles.vignetteOverlay} aria-hidden="true" />

              {/* Editorial Text Overlay matching reference design */}
              <div className={styles.slideContent}>
                <span className={styles.chapterTag}>{slide.tagline}</span>

                <h1 className={styles.heroHeading}>
                  <span className={styles.headingLine1}>{slide.headingLine1}</span>
                  <span className={styles.headingLine2}>{slide.headingLine2}</span>
                </h1>

                <div className={styles.dividerLine} aria-hidden="true" />

                <p className={styles.heroSubheadline}>{slide.description}</p>

                <div className={styles.ctaButtonGroup}>
                  <Link
                    href={slide.menLink}
                    className={styles.ctaBtnPrimary}
                    aria-label="Shop Men Collection"
                  >
                    {slide.menText || 'SHOP MEN →'}
                  </Link>

                  <Link
                    href={slide.womenLink}
                    className={styles.ctaBtnSecondary}
                    aria-label="Shop Women Collection"
                  >
                    {slide.womenText || 'SHOP WOMEN →'}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sleek Floating Navigation Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        className={`${styles.navArrow} ${styles.prevArrow}`}
        aria-label="Previous Slide"
      >
        <ChevronLeft size={22} strokeWidth={1.5} />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        className={`${styles.navArrow} ${styles.nextArrow}`}
        aria-label="Next Slide"
      >
        <ChevronRight size={22} strokeWidth={1.5} />
      </button>

      {/* Bottom Slide Progress Tracker (01 ── 03) */}
      <div className={styles.chapterNavigation} aria-label="Slide Selector">
        <span className={styles.chapterCurrentNum}>
          {String(currentIndex + 1).padStart(2, '0')}
        </span>

        <div className={styles.chapterTrack}>
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`${styles.chapterSegmentBtn} ${
                  isActive ? styles.chapterSegmentActive : ''
                }`}
                aria-label={`Jump to slide ${slide.label}`}
                aria-current={isActive ? 'true' : 'false'}
              >
                <span className={styles.segmentLine}>
                  <span
                    className={styles.segmentFill}
                    style={{
                      width: isActive ? '100%' : '0%',
                      transition:
                        isActive && !isPaused
                          ? `width ${autoPlayInterval}ms linear`
                          : 'width 250ms ease',
                    }}
                  />
                </span>
              </button>
            );
          })}
        </div>

        <span className={styles.chapterTotalNum}>
          {String(totalSlides).padStart(2, '0')}
        </span>
      </div>
    </section>
  );
};
