'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Layers } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import styles from './HomeAccessoriesSection.module.css';

export interface HomeAccessoriesSectionProps {
  products?: Product[];
}

interface CategoryPill {
  id: string;
  name: string;
  slug: string;
}

const ACCESSORY_CATEGORIES: CategoryPill[] = [
  { id: 'hairbands', name: 'Hairbands', slug: 'hairbands' },
  { id: 'hair-clips', name: 'Hair Clips', slug: 'hair-clips' },
  { id: 'claw-clips', name: 'Claw Clips', slug: 'claw-clips' },
  { id: 'keychains', name: 'Keychains', slug: 'keychains' },
  { id: 'bag-charms', name: 'Bag Charms', slug: 'bag-charms' },
  { id: 'matching-sets', name: 'Matching Sets', slug: 'matching-sets' },
];

export const HomeAccessoriesSection: React.FC<HomeAccessoriesSectionProps> = ({
  products = [],
}) => {
  const hasProducts = products && products.length > 0;
  const displayProducts = products.slice(0, 4);

  return (
    <section className={`container ${styles.section}`} aria-label="Accessories — The Finishing Touch">
      {/* 1. Section Header */}
      <div className={styles.header}>
        <div className={styles.eyebrowRow}>
          <span className={styles.eyebrowLine} aria-hidden="true" />
          <span className={styles.eyebrow}>AVEEZ ACCESSORIES</span>
          <span className={styles.eyebrowLine} aria-hidden="true" />
        </div>
        <h2 className={styles.title}>THE FINISHING TOUCH</h2>
        <p className={styles.subtitle}>
          &ldquo;Complete your look with accessories made to match your style.&rdquo;
        </p>
      </div>

      {/* 2. Category Quick Navigation Showcase */}
      <div className={styles.categoryNavWrapper} role="navigation" aria-label="Accessories Categories">
        <div className={styles.categoryPills}>
          {ACCESSORY_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/accessories?category=${cat.slug}`}
              className={styles.categoryPill}
            >
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Product Display (Real DB Products or Curated Category Spotlight) */}
      {hasProducts ? (
        <div className={styles.productGrid}>
          {displayProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              variant="default"
            />
          ))}
        </div>
      ) : (
        /* Curated Category Spotlight Cards when DB products are being uploaded */
        <div className={styles.editorialGrid}>
          <Link href="/accessories?category=hairbands" className={styles.spotlightCard}>
            <div className={styles.spotlightContent}>
              <span className={styles.spotlightKicker}>HANDMADE ACCENTS</span>
              <h3 className={styles.spotlightTitle}>FLORAL HAIRBANDS</h3>
              <p className={styles.spotlightDesc}>
                Handcrafted floral motifs and sculpted hair bands designed to gracefully frame the face.
              </p>
              <span className={styles.spotlightCta}>DISCOVER HAIRBANDS →</span>
            </div>
          </Link>

          <Link href="/accessories?category=claw-clips" className={styles.spotlightCard}>
            <div className={styles.spotlightContent}>
              <span className={styles.spotlightKicker}>SCULPTED HARDWARE</span>
              <h3 className={styles.spotlightTitle}>CLIPS & CLAW CLIPS</h3>
              <p className={styles.spotlightDesc}>
                Architectural matte and minimal resin clips engineered for effortless everyday hair styling.
              </p>
              <span className={styles.spotlightCta}>DISCOVER CLIPS →</span>
            </div>
          </Link>

          <Link href="/accessories?category=bag-charms" className={styles.spotlightCard}>
            <div className={styles.spotlightContent}>
              <span className={styles.spotlightKicker}>EVERYDAY PAIRINGS</span>
              <h3 className={styles.spotlightTitle}>CHARMS & KEYCHAINS</h3>
              <p className={styles.spotlightDesc}>
                Tactile floral accents and signature charms crafted to bring character to your daily carry.
              </p>
              <span className={styles.spotlightCta}>DISCOVER CHARMS →</span>
            </div>
          </Link>
        </div>
      )}

      {/* 4. Complete the Look Editorial Banner */}
      <div className={styles.completeTheLookBanner}>
        <div className={styles.ctlContent}>
          <div className={styles.ctlBadge}>
            <Sparkles size={14} className={styles.ctlIcon} />
            <span className={styles.ctlKicker}>STYLING PHILOSOPHY</span>
          </div>
          <h3 className={styles.ctlHeading}>YOUR OUTFIT. YOUR DETAILS. YOUR STYLE.</h3>
          <p className={styles.ctlText}>
            Discover accessories that complement your favourite AVEEZ outfits. From monochrome
            streetwear to relaxed tailoring, every piece is curated to harmonise effortlessly.
          </p>
        </div>

        <div className={styles.ctlActions}>
          <Link href="/accessories" className={styles.primaryCta}>
            <span>EXPLORE ALL ACCESSORIES</span>
            <ArrowRight size={16} />
          </Link>
          <Link href="/accessories?category=matching-sets" className={styles.secondaryCta}>
            <span>Shop Matching Sets</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
