'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, X } from 'lucide-react';
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
  { id: 'hairbands', name: 'HAIRBANDS', slug: 'hairbands' },
  { id: 'hair-clips', name: 'HAIR CLIPS', slug: 'hair-clips' },
  { id: 'claw-clips', name: 'CLAW CLIPS', slug: 'claw-clips' },
  { id: 'keychains', name: 'KEYCHAINS', slug: 'keychains' },
  { id: 'bag-charms', name: 'BAG CHARMS', slug: 'bag-charms' },
  { id: 'matching-sets', name: 'MATCHING SETS', slug: 'matching-sets' },
];

export const HomeAccessoriesSection: React.FC<HomeAccessoriesSectionProps> = ({
  products = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => {
      const tags = (p.tags || []).map((t) => t.toLowerCase());
      const slug = (p.slug || '').toLowerCase();
      const title = (p.title || '').toLowerCase();

      switch (selectedCategory) {
        case 'hairbands':
          return (
            tags.includes('hairbands') ||
            tags.includes('hairband') ||
            slug.includes('hairband') ||
            title.includes('hairband')
          );
        case 'hair-clips':
          return (
            tags.includes('hair-clips') ||
            tags.includes('hair-clip') ||
            slug.includes('hair-clip') ||
            title.includes('hair clip')
          );
        case 'claw-clips':
          return (
            tags.includes('claw-clips') ||
            tags.includes('claw-clip') ||
            slug.includes('claw-clip') ||
            title.includes('claw clip')
          );
        case 'keychains':
          return (
            tags.includes('keychains') ||
            tags.includes('keychain') ||
            slug.includes('keychain') ||
            title.includes('keychain')
          );
        case 'bag-charms':
          return (
            tags.includes('bag-charms') ||
            tags.includes('bag-charm') ||
            slug.includes('bag-charm') ||
            title.includes('bag charm')
          );
        case 'matching-sets':
          return (
            tags.includes('matching-sets') ||
            tags.includes('bundle') ||
            slug.includes('set') ||
            slug.includes('duo') ||
            title.includes('set')
          );
        default:
          return true;
      }
    });
  }, [products, selectedCategory]);

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory((prev) => (prev === slug ? null : slug));
  };

  const activeCategoryObject = ACCESSORY_CATEGORIES.find(
    (c) => c.slug === selectedCategory
  );

  return (
    <section
      className={`container ${styles.section}`}
      aria-label="Accessories — The Finishing Touch"
    >
      {/* 1. Section Header — Matches visual design */}
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

      {/* 2. Interactive Category Filter Pills */}
      <div
        className={styles.categoryNavWrapper}
        role="region"
        aria-label="Accessories Category Filters"
      >
        <div className={styles.categoryPills}>
          {ACCESSORY_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`${styles.categoryPill} ${
                  isActive ? styles.categoryPillActive : ''
                }`}
                aria-pressed={isActive}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Indicator / Reset */}
        {selectedCategory && (
          <div className={styles.filterStatus}>
            <span className={styles.filterStatusText}>
              Showing items in <strong>{activeCategoryObject?.name}</strong> ({filteredProducts.length})
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={styles.clearFilterBtn}
              aria-label="Clear active filter"
            >
              <X size={13} />
              <span>Show All</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Product Display (Real MongoDB Accessories) */}
      {filteredProducts.length > 0 ? (
        <div className={styles.productGrid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              variant="default"
            />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className={styles.emptyFilteredState}>
          <p className={styles.emptyFilteredText}>
            No products currently in this specific category.
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={styles.resetButton}
          >
            VIEW ALL ACCESSORIES
          </button>
        </div>
      ) : (
        /* Curated Spotlight Cards fallback if catalog is loading */
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
