'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { IconHeart } from '@/components/ui/Icons';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'editorial';
  priority?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'default',
  priority = false,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImage = product.images.find((img) => !img.isPrimary) || primaryImage;

  const hasSale = product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = hasSale
    ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100)
    : 0;

  const isFavorited = isInWishlist(product.slug);

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();

    const variantItem = product.variants.find((v) => v.size === size);
    if (!variantItem || variantItem.stock <= 0) return;

    setSelectedSize(size);
    addToCart(
      {
        productId: product._id,
        variantSku: variantItem.sku,
        title: product.title,
        slug: product.slug,
        size: variantItem.size,
        color: variantItem.color,
        price: product.salePrice || product.basePrice,
        originalPrice: product.basePrice,
        image: primaryImage?.url || '/brand/clothing-label-mark.svg',
      },
      1
    );

    setTimeout(() => setSelectedSize(null), 1000);
  };

  const rootClass = [
    styles.card,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClass}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        <Link href={`/product/${product.slug}`} className={styles.imageLink}>
          {/* Primary Image */}
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.title}
              width={600}
              height={800}
              priority={priority}
              className={`${styles.image} ${isHovered && secondaryImage ? styles.imageHovered : ''}`}
            />
          ) : (
            <div className={styles.fallbackImagePlaceholder}>
              <span>AVEEZ</span>
            </div>
          )}

          {/* Secondary Hover Image */}
          {secondaryImage && secondaryImage !== primaryImage ? (
            <Image
              src={secondaryImage.url}
              alt={secondaryImage.alt || `${product.title} Alternate View`}
              width={600}
              height={800}
              className={`${styles.image} ${styles.secondaryImage} ${isHovered ? styles.secondaryVisible : ''}`}
            />
          ) : null}
        </Link>

        {/* Badges */}
        <div className={styles.badgeGroup}>
          {hasSale && <Badge variant="sale">-{discountPercent}%</Badge>}
          {product.isNewArrival && !hasSale && <Badge variant="new">NEW</Badge>}
          {product.isBestSeller && !product.isNewArrival && !hasSale && (
            <Badge variant="best-seller">BESTSELLER</Badge>
          )}
          {product.isAveezOriginal && <Badge variant="aveez-original">ORIGINAL</Badge>}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          className={`${styles.wishlistBtn} ${isFavorited ? styles.wishlistActive : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.slug);
          }}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <IconHeart size={18} strokeWidth={1.5} filled={isFavorited} />
        </button>

        {/* Quick Add Size Bar (Revealed on hover) */}
        {variant !== 'compact' && product.variants && product.variants.length > 0 && (
          <div className={styles.quickAddBar}>
            <span className={styles.quickAddLabel}>QUICK ADD:</span>
            <div className={styles.sizeChips}>
              {product.variants.map((v) => {
                const isOutOfStock = v.stock <= 0;
                const isAdded = selectedSize === v.size;

                return (
                  <button
                    key={v.sku}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={(e) => handleQuickAdd(e, v.size)}
                    className={`${styles.sizeChip} ${isOutOfStock ? styles.outOfStock : ''} ${isAdded ? styles.addedChip : ''}`}
                    title={isOutOfStock ? `${v.size} Out of Stock` : `Add size ${v.size}`}
                  >
                    {isAdded ? '✓' : v.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Product Metadata */}
      <div className={styles.details}>
        {variant === 'editorial' && (
          <span className={styles.categoryEyebrow}>AVEEZ ESSENTIAL</span>
        )}
        <Link href={`/product/${product.slug}`} className={styles.title}>
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
    </div>
  );
};
