'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import styles from './NewArrivalsSection.module.css';

interface NewArrivalsSectionProps {
  products: Product[];
  viewAllLink?: string;
}

export const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({
  products,
  viewAllLink = '/shop?filter=new',
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Mouse drag-to-scroll interaction
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftPosRef = useRef(0);
  const hasMovedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

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
  }, [checkScrollState, products]);

  const handleScroll = (direction: 'prev' | 'next') => {
    if (!trackRef.current) return;
    const firstCard = trackRef.current.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.offsetWidth || 300;
    const gap = window.innerWidth <= 768 ? 14 : 24;
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
    <section className={styles.section} aria-label="New Arrivals Showcase">
      <div className={styles.container}>
        <div className={styles.headerWrapper}>
          {/* Giant subtle watermark text */}
          <span className={styles.watermark} aria-hidden="true">
            NEW
          </span>

          {/* Left column: Eyebrow + Brand Heading + Tagline */}
          <div className={styles.leftCol}>
            <div className={styles.eyebrowRow}>
              <span className={styles.eyebrowText}>FRESH CUTS</span>
              <div className={styles.eyebrowLine} aria-hidden="true" />
            </div>

            <h2 className={styles.mainTitle}>
              <span className={styles.titleWordNew}>NEW</span>
              <span className={styles.titleWordArrivals}>ARRIVALS</span>
            </h2>

            <p className={styles.tagline}>
              DISCOVER OUR LATEST STYLES FOR A BOLDER YOU.
            </p>
          </div>

          {/* Right column: Blurb + Action Link + Arrow Controls */}
          <div className={styles.rightCol}>
            <p className={styles.blurbText}>
              Latest fits. Modern silhouettes.
              <br />
              Everyday essentials.
            </p>

            <div className={styles.actionsRow}>
              <Link href={viewAllLink} className={styles.viewAllLink}>
                VIEW ALL (NEW) →
              </Link>

              <div className={styles.navControls} aria-label="Product Slider Controls">
                <button
                  type="button"
                  onClick={() => handleScroll('prev')}
                  className={`${styles.arrowBtn} ${styles.arrowBtnPrev} ${!canScrollLeft ? styles.arrowBtnDisabled : ''}`}
                  aria-label="Previous products"
                  disabled={!canScrollLeft}
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </button>

                <button
                  type="button"
                  onClick={() => handleScroll('next')}
                  className={`${styles.arrowBtn} ${styles.arrowBtnNext} ${!canScrollRight ? styles.arrowBtnDisabled : ''}`}
                  aria-label="Next products"
                  disabled={!canScrollRight}
                >
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Single-Line Slider Track */}
        <div
          ref={trackRef}
          className={`${styles.cardsTrack} ${isDragging ? styles.isDragging : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onClickCapture={handleClickCapture}
        >
          {products.map((product, idx) => (
            <div key={product._id} className={styles.cardItem}>
              <ProductCard
                product={product}
                variant="curated"
                priority={idx < 4}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
