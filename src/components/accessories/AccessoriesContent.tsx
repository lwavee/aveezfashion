'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, PackageOpen, Plus } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { AccessoriesHero } from './AccessoriesHero';
import { AccessoriesFilterBar } from './AccessoriesFilterBar';
import { MatchingBundlesSection, BundleItemDef } from './MatchingBundlesSection';
import styles from './AccessoriesContent.module.css';

export interface AccessoriesContentProps {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
  activeCategory: string;
  activeSort: string;
}

export const AccessoriesContent: React.FC<AccessoriesContentProps> = ({
  products,
  total,
  totalPages,
  currentPage,
  activeCategory,
  activeSort,
}) => {
  // Construct bundles from genuine products if available
  const bundles: BundleItemDef[] = React.useMemo(() => {
    if (products.length < 2) return [];

    const hairbands = products.filter((p) =>
      p.tags?.some((t) => t.toLowerCase().includes('hairband')) ||
      p.title.toLowerCase().includes('hairband') ||
      p.title.toLowerCase().includes('headband')
    );
    const clips = products.filter((p) =>
      p.tags?.some((t) => t.toLowerCase().includes('clip')) ||
      p.title.toLowerCase().includes('clip')
    );
    const charms = products.filter((p) =>
      p.tags?.some((t) => t.toLowerCase().includes('charm') || t.toLowerCase().includes('keychain')) ||
      p.title.toLowerCase().includes('charm') ||
      p.title.toLowerCase().includes('keychain')
    );

    const generatedBundles: BundleItemDef[] = [];

    if (hairbands.length > 0 && clips.length > 0) {
      generatedBundles.push({
        id: 'bundle_hairband_clips',
        title: 'Floral Hairband + Clip Duo',
        subtitle: 'Artisan floral headpiece paired with matching sculpted hair clips.',
        products: [hairbands[0], clips[0]],
        discountPercent: 10,
      });
    }

    if (clips.length > 0 && charms.length > 0) {
      generatedBundles.push({
        id: 'bundle_clip_charm',
        title: 'Sculpted Clip + Bag Charm Set',
        subtitle: 'Coordinated hair accent paired with a tactile everyday charm.',
        products: [clips[0], charms[0]],
        discountPercent: 10,
      });
    }

    return generatedBundles;
  }, [products]);

  return (
    <div className={`container ${styles.pageContainer}`}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">HOME</Link>
        <span className={styles.slash}>/</span>
        <span className={styles.current}>ACCESSORIES</span>
        {activeCategory && activeCategory !== 'all' && (
          <>
            <span className={styles.slash}>/</span>
            <span className={styles.currentSub}>
              {activeCategory.replace('-', ' ').toUpperCase()}
            </span>
          </>
        )}
      </nav>

      {/* Hero */}
      <AccessoriesHero totalCount={total} />

      {/* Category Filter Pills & Sort Controls */}
      <AccessoriesFilterBar
        activeCategory={activeCategory}
        activeSort={activeSort}
        totalProducts={total}
      />

      {/* Main Grid or Empty State */}
      {products.length > 0 ? (
        <>
          <div className={styles.productGrid}>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                variant="default"
              />
            ))}
          </div>

          {/* Matching Bundles Section */}
          {bundles.length > 0 && <MatchingBundlesSection bundles={bundles} />}
        </>
      ) : (
        /* Premium Empty State */
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyIconCircle}>
            <PackageOpen size={36} strokeWidth={1.25} />
          </div>

          <span className={styles.emptyKicker}>THE FINISHING TOUCH</span>
          <h2 className={styles.emptyHeading}>
            {activeCategory && activeCategory !== 'all'
              ? `No ${activeCategory.replace('-', ' ')} in stock right now`
              : 'Handcrafted Accessories in Production'}
          </h2>

          <p className={styles.emptyText}>
            Our upcoming accessories edit includes handmade floral headbands, sculpted claw clips,
            minimalist hair pins, and tactile charms. Pieces are crafted in limited runs and updated
            regularly in the catalog.
          </p>

          <div className={styles.emptyActions}>
            {activeCategory && activeCategory !== 'all' && (
              <Link href="/accessories" className={styles.primaryBtn}>
                <span>VIEW ALL ACCESSORIES</span>
              </Link>
            )}

            <Link href="/shop" className={styles.secondaryBtn}>
              <span>EXPLORE APPAREL</span>
              <ArrowRight size={14} />
            </Link>

            <Link href="/admin/products" className={styles.adminHintBtn} title="Add genuine products via Admin">
              <Plus size={14} />
              <span>ADMIN: ADD NEW ACCESSORY</span>
            </Link>
          </div>

          <div className={styles.upcomingPills}>
            <span className={styles.upcomingLabel}>CURATED CATEGORIES:</span>
            <div className={styles.pillsList}>
              <span>Handmade Hairbands</span>
              <span>•</span>
              <span>Floral Hair Clips</span>
              <span>•</span>
              <span>Sculpted Claw Clips</span>
              <span>•</span>
              <span>Flower Keychains</span>
              <span>•</span>
              <span>Bag Charms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
