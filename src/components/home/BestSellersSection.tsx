'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import styles from './BestSellersSection.module.css';

export interface BestSellersSectionProps {
  products: Product[];
  viewAllLink?: string;
}

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({
  products,
  viewAllLink = '/shop?filter=bestseller',
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Display top 4 products
  const displayProducts = products.slice(0, 4);

  return (
    <section className={styles.section} aria-label="Best Sellers">
      <div className={`container ${styles.container}`}>
        {/* Section Editorial Header */}
        <div className={styles.header}>
          <div className={styles.titleStack}>
            <span className={styles.eyebrow}>MOST WANTED</span>
            <h2 className={styles.heading}>BEST SELLERS</h2>
            <p className={styles.supportingText}>The pieces making their mark.</p>
          </div>

          <Link href={viewAllLink} className={styles.desktopViewAll}>
            <span>VIEW ALL PRODUCTS</span>
            <span className={styles.viewAllArrow} aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Product Grid: 4 columns desktop, 2 columns tablet/mobile */}
        <div className={styles.grid}>
          {displayProducts.map((product, idx) => {
            const primaryImage =
              product.images?.find((img) => img.isPrimary) || product.images?.[0];
            const secondaryImage =
              product.images?.find((img) => !img.isPrimary);

            const hasSale =
              Boolean(product.salePrice && product.salePrice < product.basePrice);
            const discountPercent = hasSale
              ? Math.round(
                  ((product.basePrice - product.salePrice!) / product.basePrice) * 100
                )
              : 0;

            const isFavorited = isInWishlist(product.slug);

            return (
              <article key={product._id || product.slug} className={styles.card}>
                {/* Visual Image Presentation (3:4 aspect ratio) */}
                <div className={styles.imageContainer}>
                  <Link
                    href={`/product/${product.slug}`}
                    className={styles.imageLink}
                    tabIndex={0}
                    aria-label={`View ${product.title}`}
                  >
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.alt || product.title}
                        width={600}
                        height={800}
                        priority={idx < 2}
                        className={`${styles.image} ${
                          secondaryImage ? styles.hasSecondary : ''
                        }`}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className={styles.imageFallback}>
                        <span>AVEEZ</span>
                      </div>
                    )}

                    {/* Secondary alternate view on hover if available */}
                    {secondaryImage && (
                      <Image
                        src={secondaryImage.url}
                        alt={secondaryImage.alt || `${product.title} Alternate View`}
                        width={600}
                        height={800}
                        className={`${styles.image} ${styles.secondaryImage}`}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    )}
                  </Link>

                  {/* Badges Stack (Top Left) */}
                  <div className={styles.badgeGroup}>
                    {hasSale && (
                      <span className={styles.discountBadge}>
                        -{discountPercent}%
                      </span>
                    )}
                    {product.isAveezOriginal && (
                      <span className={styles.originalBadge}>
                        ORIGINAL
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button (Top Right) */}
                  <button
                    type="button"
                    className={`${styles.wishlistBtn} ${
                      isFavorited ? styles.wishlistActive : ''
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.slug);
                    }}
                    aria-label={
                      isFavorited
                        ? `Remove ${product.title} from wishlist`
                        : `Add ${product.title} to wishlist`
                    }
                  >
                    <Heart
                      size={16}
                      strokeWidth={1.8}
                      fill={isFavorited ? '#0A0A0A' : 'none'}
                      color={isFavorited ? '#0A0A0A' : '#18181B'}
                    />
                  </button>

                  {/* Restrained Hover Indicator (Desktop Only) */}
                  <div className={styles.hoverViewPrompt} aria-hidden="true">
                    <span>VIEW PRODUCT →</span>
                  </div>
                </div>

                {/* Product Metadata Below Image */}
                <div className={styles.productDetails}>
                  <Link
                    href={`/product/${product.slug}`}
                    className={styles.productTitle}
                    title={product.title}
                  >
                    {product.title}
                  </Link>

                  <div className={styles.priceRow}>
                    {hasSale ? (
                      <>
                        <span className={styles.salePrice}>
                          ₹{product.salePrice?.toLocaleString('en-IN')}
                        </span>
                        <span className={styles.originalPrice}>
                          ₹{product.basePrice.toLocaleString('en-IN')}
                        </span>
                      </>
                    ) : (
                      <span className={styles.basePrice}>
                        ₹{product.basePrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Mobile View All Link */}
        <div className={styles.mobileViewAll}>
          <Link href={viewAllLink} className={styles.mobileViewAllLink}>
            <span>VIEW ALL PRODUCTS</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
