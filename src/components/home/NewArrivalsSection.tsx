'use client';

import React, { useRef } from 'react';
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

  const handleScroll = (direction: 'prev' | 'next') => {
    if (!trackRef.current) return;
    const cardWidth = trackRef.current.firstElementChild?.clientWidth || 300;
    const scrollAmount = (cardWidth + 20) * 2;
    trackRef.current.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className={`container ${styles.section}`} aria-label="New Arrivals Showcase">
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
                className={`${styles.arrowBtn} ${styles.arrowBtnPrev}`}
                aria-label="Previous products"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={() => handleScroll('next')}
                className={`${styles.arrowBtn} ${styles.arrowBtnNext}`}
                aria-label="Next products"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Cards Track */}
      <div ref={trackRef} className={styles.cardsTrack}>
        {products.map((product, idx) => (
          <ProductCard
            key={product._id}
            product={product}
            variant="curated"
            priority={idx < 2}
          />
        ))}
      </div>
    </section>
  );
};
