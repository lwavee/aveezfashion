'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './HeroSection.module.css';

export interface HeroSlide {
  id: number;
  label: string;
  tagline?: string;
  headingLine1?: string;
  headingLine2?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  alt: string;
  menLink?: string;
  womenLink?: string;
  menText?: string;
  womenText?: string;
  isFestive?: boolean;
  hideOverlay?: boolean;
  offerText?: string;
  link?: string;
}

import { SeasonalThemeConfig } from '@/types';

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 1,
    label: '01',
    tagline: 'CHAPTER 01 / NEW DROP',
    headingLine1: 'WEAR',
    headingLine2: 'DIFFERENT.',
    description: 'ARCHITECTURAL SILHOUETTES & HEAVYWEIGHT ESSENTIALS DESIGNED FOR INDIVIDUALITY.',
    image: '/images/heroimage1.png',
    mobileImage: '/images/heroimage1.png',
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
    mobileImage: '/images/heroimage2.png',
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
    mobileImage: '/images/heroimage3.png',
    alt: 'Aveez Fashion Editorial Campaign — Chapter 03 (Wear Different)',
    menLink: '/shop?gender=MEN',
    womenLink: '/shop?gender=WOMEN',
    menText: 'SHOP MEN →',
    womenText: 'SHOP WOMEN →',
  },
];

interface HeroProps {
  slides?: HeroSlide[];
  seasonalTheme?: SeasonalThemeConfig;
  autoPlayInterval?: number;
}

export const HeroSection: React.FC<HeroProps> = ({
  slides,
  seasonalTheme,
  autoPlayInterval = 6000,
}) => {
  const isDiwali = seasonalTheme?.enabled && seasonalTheme?.theme === 'diwali';

  const resolvedSlides: HeroSlide[] = React.useMemo(() => {
    if (slides && slides.length > 0) return slides;

    if (isDiwali) {
      const heroOverlayMode = seasonalTheme?.heroOverlayMode || 'without_text';
      const shouldHideOverlay = heroOverlayMode === 'without_text';

      const defaultBanners = [
        {
          id: 901,
          label: '01',
          image: seasonalTheme?.heroDesktopImage || '/uploads/campaigns/diwali/diwali-edit-banner.webp',
          mobileImage:
            seasonalTheme?.heroMobileImage &&
            !seasonalTheme.heroMobileImage.includes('diwali-hero-mobile')
              ? seasonalTheme.heroMobileImage
              : (seasonalTheme?.heroDesktopImage || '/uploads/campaigns/diwali/diwali-edit-banner.webp'),
          alt: seasonalTheme?.heroHeadline
            ? `AVEEZ FASHION — ${seasonalTheme.heroHeadline}`
            : 'AVEEZ FASHION — The Diwali Edit Fashion Banner',
          link: seasonalTheme?.heroPrimaryCtaLink || '/shop',
          hideOverlay: shouldHideOverlay,
          isFestive: true,
          tagline: '✨ DIWALI FESTIVE EDIT',
          headingLine1: seasonalTheme?.heroHeadline || 'THE DIWALI',
          headingLine2: 'EDIT',
          description: seasonalTheme?.heroSubheadline || 'Celebrate the season in timeless style. Architectural silhouettes meet festive warmth.',
          offerText: seasonalTheme?.heroOfferText || 'FLAT 40% OFF',
          menLink: seasonalTheme?.heroPrimaryCtaLink || '/shop?gender=MEN',
          menText: seasonalTheme?.heroPrimaryCtaText || 'SHOP FESTIVE MEN →',
          womenLink: seasonalTheme?.heroSecondaryCtaLink || '/shop?gender=WOMEN',
          womenText: seasonalTheme?.heroSecondaryCtaText || 'SHOP FESTIVE WOMEN →',
        },
        {
          id: 902,
          label: '02',
          image: '/uploads/campaigns/diwali/diwali-winter-collection.webp',
          mobileImage: '/uploads/campaigns/diwali/diwali-winter-collection.webp',
          alt: 'AVEEZ FASHION — Diwali Winter Collection',
          link: '/shop',
          hideOverlay: shouldHideOverlay,
          isFestive: true,
          tagline: 'CHAPTER 02 / FESTIVE WINTER',
          headingLine1: 'WINTER',
          headingLine2: 'COLLECTION',
          description: 'Heavyweight fleece & tailored seasonal outerwear designed for festive evenings.',
          offerText: seasonalTheme?.heroOfferText || 'FLAT 40% OFF',
          menLink: '/shop?gender=MEN',
          menText: 'EXPLORE MEN →',
          womenLink: '/shop?gender=WOMEN',
          womenText: 'EXPLORE WOMEN →',
        },
        {
          id: 903,
          label: '03',
          image: '/uploads/campaigns/diwali/diwali-bogo-banner.webp',
          mobileImage: '/uploads/campaigns/diwali/diwali-bogo-banner.webp',
          alt: 'AVEEZ FASHION — Diwali Buy One Get One',
          link: '/shop',
          hideOverlay: shouldHideOverlay,
          isFestive: true,
          tagline: 'CHAPTER 03 / FESTIVE BOGO',
          headingLine1: 'BUY 1',
          headingLine2: 'GET 1',
          description: 'Special Diwali gifting privileges on select architectural streetwear essentials.',
          offerText: 'BUY 1 GET 1 FREE',
          menLink: '/shop',
          menText: 'CLAIM OFFER →',
        },
      ];

      // If admin selected or uploaded a custom hero image that is not the default edit banner, place it first
      const customHero = seasonalTheme?.heroDesktopImage;
      if (
        customHero &&
        !customHero.includes('hero-desktop.webp') &&
        !customHero.includes('diwali-edit-banner.webp')
      ) {
        const existingIdx = defaultBanners.findIndex((b) => b.image === customHero);
        if (existingIdx > -1) {
          // Move selected banner to first position
          const [selected] = defaultBanners.splice(existingIdx, 1);
          defaultBanners.unshift(selected);
        } else {
          // Custom uploaded banner
          defaultBanners.unshift({
            id: 900,
            label: '01',
            image: customHero,
            mobileImage:
              seasonalTheme?.heroMobileImage &&
              !seasonalTheme.heroMobileImage.includes('diwali-hero-mobile')
                ? seasonalTheme.heroMobileImage
                : customHero,
            alt: seasonalTheme?.heroHeadline || 'AVEEZ FASHION — Diwali Campaign Banner',
            link: seasonalTheme?.heroPrimaryCtaLink || '/shop',
            hideOverlay: shouldHideOverlay,
            isFestive: true,
            tagline: '✨ DIWALI SPECIAL',
            headingLine1: seasonalTheme?.heroHeadline || 'THE DIWALI',
            headingLine2: 'EDIT',
            description: seasonalTheme?.heroSubheadline,
            offerText: seasonalTheme?.heroOfferText || 'FLAT 40% OFF',
            menLink: seasonalTheme?.heroPrimaryCtaLink || '/shop?gender=MEN',
            menText: seasonalTheme?.heroPrimaryCtaText || 'SHOP FESTIVE MEN →',
            womenLink: seasonalTheme?.heroSecondaryCtaLink || '/shop?gender=WOMEN',
            womenText: seasonalTheme?.heroSecondaryCtaText || 'SHOP FESTIVE WOMEN →',
          });
        }
      }

      return defaultBanners;
    }

    return DEFAULT_SLIDES;
  }, [slides, isDiwali, seasonalTheme]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = resolvedSlides.length;

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

  const currentSlide = resolvedSlides[currentIndex];

  return (
    <section
      className={`${styles.heroSlider} ${isDiwali ? styles.festiveHeroSlider : ''}`}
      style={{
        '--hero-aspect-ratio': isDiwali ? '1983 / 793' : '2022 / 778',
      } as React.CSSProperties}
      aria-label="Editorial Campaign Hero Slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={styles.slidesWrapper}>
        {resolvedSlides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className={`${styles.slide} ${isActive ? styles.activeSlide : ''}`}
              aria-hidden={!isActive}
            >
              {/* Desktop Wide Editorial Image (Visible on Viewports > 768px) */}
              <div className={styles.desktopImageContainer}>
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 769px) 100vw, 1px"
                  className={styles.slideImage}
                />
              </div>

              {/* Mobile Dedicated Banner Image (Visible on Viewports <= 768px) */}
              <div className={styles.mobileImageContainer}>
                <Image
                  src={slide.mobileImage || slide.image}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 1px"
                  className={styles.mobileSlideImage}
                />
              </div>

              {/* If hideOverlay is true, render a clean clickable banner without overlay text or vignette */}
              {slide.hideOverlay ? (
                <Link
                  href={slide.link || '/shop'}
                  className={styles.bannerFullLink}
                  aria-label={slide.alt}
                />
              ) : (
                <>
                  {/* Contrast enhancement vignette overlay on shadow side */}
                  <div className={styles.vignetteOverlay} aria-hidden="true" />

                  {/* Editorial Text Overlay matching reference design */}
                  <div className={styles.slideContent}>
                    {slide.tagline && <span className={styles.chapterTag}>{slide.tagline}</span>}

                    {index === 0 ? (
                      <h1 className={styles.heroHeading}>
                        <span className={styles.headingLine1}>{slide.headingLine1}</span>
                        <span className={styles.headingLine2}>{slide.headingLine2}</span>
                      </h1>
                    ) : (
                      <div className={styles.heroHeading} role="heading" aria-level={2}>
                        <span className={styles.headingLine1}>{slide.headingLine1}</span>
                        <span className={styles.headingLine2}>{slide.headingLine2}</span>
                      </div>
                    )}

                    <div className={styles.dividerLine} aria-hidden="true" />

                    {slide.isFestive && (seasonalTheme?.heroOfferText || slide.offerText) && (
                      <div className={styles.offerBadgeOverlay}>
                        <span className={styles.offerBadgeText}>
                          {seasonalTheme?.heroOfferText || slide.offerText}
                        </span>
                      </div>
                    )}

                    {slide.description && (
                      <p className={styles.heroSubheadline}>{slide.description}</p>
                    )}

                    {(slide.menLink || slide.womenLink) && (
                      <div className={styles.ctaButtonGroup}>
                        {slide.menLink && (
                          <Link
                            href={slide.menLink}
                            className={styles.ctaBtnPrimary}
                            aria-label="Shop Men Collection"
                          >
                            {slide.menText || 'SHOP MEN →'}
                          </Link>
                        )}

                        {slide.womenLink && (
                          <Link
                            href={slide.womenLink}
                            className={styles.ctaBtnSecondary}
                            aria-label="Shop Women Collection"
                          >
                            {slide.womenText || 'SHOP WOMEN →'}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
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
          {resolvedSlides.map((slide, idx) => {
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
