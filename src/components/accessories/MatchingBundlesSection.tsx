'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Plus, Check, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { AccessoriesPlaceholder } from './AccessoriesPlaceholder';
import styles from './MatchingBundlesSection.module.css';

export interface BundleItemDef {
  id: string;
  title: string;
  subtitle: string;
  products: Product[];
  discountPercent?: number; // e.g. 10 for 10% bundle saving
}

export interface MatchingBundlesSectionProps {
  bundles: BundleItemDef[];
}

export const MatchingBundlesSection: React.FC<MatchingBundlesSectionProps> = ({ bundles }) => {
  const { addToCart } = useCart();
  const [addedBundleId, setAddedBundleId] = useState<string | null>(null);

  if (!bundles || bundles.length === 0) return null;

  const handleAddBundle = (bundle: BundleItemDef) => {
    // Check all products have in-stock variants
    const itemsToAdd = bundle.products.map((p) => {
      const v = p.variants?.find((item) => item.stock > 0) || p.variants?.[0];
      const primaryImg = p.images?.find((img) => img.isPrimary) || p.images?.[0];
      return {
        product: p,
        variant: v,
        image: primaryImg?.url || '/brand/clothing-label-mark.svg',
      };
    });

    const allInStock = itemsToAdd.every((item) => item.variant && item.variant.stock > 0);
    if (!allInStock) return;

    // Add each real product to cart safely
    itemsToAdd.forEach((item) => {
      if (item.variant) {
        addToCart(
          {
            productId: item.product._id,
            variantSku: item.variant.sku,
            title: item.product.title,
            slug: item.product.slug,
            size: item.variant.size,
            color: item.variant.color,
            price: item.product.salePrice || item.product.basePrice,
            originalPrice: item.product.basePrice,
            image: item.image,
          },
          1
        );
      }
    });

    setAddedBundleId(bundle.id);
    setTimeout(() => {
      setAddedBundleId(null);
    }, 2000);
  };

  return (
    <section className={styles.section} aria-label="Matching Accessory Bundles">
      <div className={styles.header}>
        <div className={styles.badgeRow}>
          <Sparkles size={14} className={styles.sparkleIcon} />
          <span className={styles.subtitle}>CURATED SETS</span>
        </div>
        <h2 className={styles.title}>MATCHING ACCESSORY BUNDLES</h2>
        <p className={styles.desc}>
          Harmonized combinations designed to be worn together. Real products crafted with matching floral motifs and complementary tones.
        </p>
      </div>

      <div className={styles.bundleList}>
        {bundles.map((bundle) => {
          const allInStock = bundle.products.every((p) =>
            p.variants?.some((v) => v.stock > 0)
          );

          // Calculate actual total from real product prices
          const rawTotal = bundle.products.reduce(
            (sum, p) => sum + (p.salePrice || p.basePrice || 0),
            0
          );

          const hasDiscount = Boolean(bundle.discountPercent && bundle.discountPercent > 0);
          const finalTotal = hasDiscount
            ? Math.round(rawTotal * (1 - bundle.discountPercent! / 100))
            : rawTotal;

          const isAdded = addedBundleId === bundle.id;

          return (
            <div key={bundle.id} className={styles.bundleCard}>
              <div className={styles.bundleMeta}>
                <h3 className={styles.bundleTitle}>{bundle.title}</h3>
                <p className={styles.bundleSubtitle}>{bundle.subtitle}</p>
                <div className={styles.pricingBlock}>
                  <span className={styles.priceFinal}>₹{finalTotal.toLocaleString('en-IN')}</span>
                  {hasDiscount && (
                    <>
                      <span className={styles.priceRaw}>₹{rawTotal.toLocaleString('en-IN')}</span>
                      <span className={styles.discountBadge}>{bundle.discountPercent}% OFF SET</span>
                    </>
                  )}
                </div>
              </div>

              {/* Products in bundle */}
              <div className={styles.piecesRow}>
                {bundle.products.map((p, idx) => {
                  const primaryImg = p.images?.find((img) => img.isPrimary) || p.images?.[0];
                  const inStock = p.variants?.some((v) => v.stock > 0);

                  return (
                    <React.Fragment key={p._id}>
                      {idx > 0 && (
                        <div className={styles.plusSeparator}>
                          <Plus size={16} />
                        </div>
                      )}
                      <Link href={`/product/${p.slug}`} className={styles.pieceItem}>
                        <div className={styles.pieceImgWrapper}>
                          {primaryImg?.url ? (
                            <Image
                              src={primaryImg.url}
                              alt={primaryImg.alt || p.title}
                              fill
                              sizes="120px"
                              className={styles.pieceImg}
                            />
                          ) : (
                            <AccessoriesPlaceholder
                              title={p.title}
                              categoryName="Accessory"
                              className={styles.miniPlaceholder}
                            />
                          )}
                        </div>
                        <div className={styles.pieceInfo}>
                          <span className={styles.pieceTitle}>{p.title}</span>
                          <span className={styles.piecePrice}>
                            ₹{(p.salePrice || p.basePrice).toLocaleString('en-IN')}
                          </span>
                          {!inStock && <span className={styles.pieceOos}>Out of Stock</span>}
                        </div>
                      </Link>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Add Bundle CTA */}
              <div className={styles.ctaRow}>
                <button
                  type="button"
                  disabled={!allInStock}
                  onClick={() => handleAddBundle(bundle)}
                  className={`${styles.addBundleBtn} ${isAdded ? styles.addedBtn : ''}`}
                >
                  {isAdded ? (
                    <>
                      <Check size={16} />
                      <span>COMPLETE SET ADDED TO BAG</span>
                    </>
                  ) : allInStock ? (
                    <>
                      <ShoppingBag size={16} />
                      <span>ADD COMPLETE SET TO BAG</span>
                    </>
                  ) : (
                    <span>SET CURRENTLY UNAVAILABLE</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
