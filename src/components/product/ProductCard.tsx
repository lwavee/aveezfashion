'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { IconHeart } from '@/components/ui/Icons';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { resolveColorHex } from '@/lib/colors';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'editorial' | 'curated';
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
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Find color-specific images when activeColor is chosen
  const colorMatchedImages = activeColor
    ? (product.images || []).filter(
        (img) => img.color && img.color.trim().toLowerCase() === activeColor.trim().toLowerCase()
      )
    : [];

  const primaryImage =
    (colorMatchedImages.length > 0
      ? colorMatchedImages.find((img) => img.isPrimary) || colorMatchedImages[0]
      : null) ||
    product.images?.find((img) => img.isPrimary) ||
    product.images?.[0];

  const secondaryImage =
    (colorMatchedImages.length > 1
      ? colorMatchedImages.find((img) => img.url !== primaryImage?.url)
      : null) ||
    product.images?.find((img) => img.url !== primaryImage?.url && !img.isPrimary) ||
    primaryImage;

  const hasSale = product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = hasSale
    ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100)
    : 0;

  const isFavorited = isInWishlist(product.slug);

  const handleBagClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const inStockVariant = product.variants?.find((v) => v.stock > 0) || product.variants?.[0];
    if (!inStockVariant) return;

    addToCart(
      {
        productId: product._id,
        variantSku: inStockVariant.sku,
        title: product.title,
        slug: product.slug,
        size: inStockVariant.size,
        color: inStockVariant.color,
        price: product.salePrice || product.basePrice,
        originalPrice: product.basePrice,
        image: primaryImage?.url || '/brand/clothing-label-mark.svg',
      },
      1
    );
  };

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

  const isCurated = variant === 'curated';

  const rootClass = [
    styles.card,
    isCurated ? styles.curatedCard : styles[variant],
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
      <div className={isCurated ? styles.curatedImageContainer : styles.imageContainer}>
        <Link href={`/product/${product.slug}`} className={styles.imageLink}>
          {/* Primary Image */}
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
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
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              className={`${styles.image} ${styles.secondaryImage} ${isHovered ? styles.secondaryVisible : ''}`}
            />
          ) : null}
        </Link>

        {/* Badges */}
        {isCurated ? (
          <div className={styles.curatedBadgeGroup}>
            {hasSale && (
              <span className={styles.curatedSaleTag}>-{discountPercent}%</span>
            )}
            {product.isAveezOriginal && (
              <span className={styles.curatedOriginalTag}>ORIGINAL</span>
            )}
            {!hasSale && product.isNewArrival && (
              <span className={styles.curatedNewTag}>NEW</span>
            )}
          </div>
        ) : (
          <div className={styles.badgeGroup}>
            {hasSale && <Badge variant="sale">-{discountPercent}%</Badge>}
            {product.isNewArrival && !hasSale && <Badge variant="new">NEW</Badge>}
            {product.isBestSeller && !product.isNewArrival && !hasSale && (
              <Badge variant="best-seller">BESTSELLER</Badge>
            )}
            {product.isAveezOriginal && <Badge variant="aveez-original">ORIGINAL</Badge>}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          className={`${isCurated ? styles.curatedWishlistBtn : styles.wishlistBtn} ${
            isFavorited ? styles.wishlistActive : ''
          }`}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.slug);
          }}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isCurated ? (
            <Heart
              size={16}
              strokeWidth={1.8}
              fill={isFavorited ? '#0A0A0A' : 'none'}
              color={isFavorited ? '#0A0A0A' : '#18181B'}
            />
          ) : (
            <IconHeart size={18} strokeWidth={1.5} filled={isFavorited} />
          )}
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
      {isCurated ? (
        <div className={styles.curatedDetails}>
          <div className={styles.curatedMeta}>
            <Link href={`/product/${product.slug}`} className={styles.curatedTitle}>
              {product.title}
            </Link>
            <div className={styles.curatedPriceRow}>
              {hasSale ? (
                <>
                  <span className={styles.curatedSalePrice}>
                    ₹{product.salePrice?.toLocaleString('en-IN')}
                  </span>
                  <span className={styles.curatedOriginalPrice}>
                    ₹{product.basePrice.toLocaleString('en-IN')}
                  </span>
                </>
              ) : (
                <span className={styles.curatedBasePrice}>
                  ₹{product.basePrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className={styles.curatedBagBtn}
            onClick={handleBagClick}
            aria-label={`Add ${product.title} to bag`}
            title="Quick add to bag"
          >
            <ShoppingBag size={17} strokeWidth={1.8} />
          </button>
        </div>
      ) : (
        <div className={styles.details}>
          {variant === 'editorial' && (
            <span className={styles.categoryEyebrow}>AVEEZ ESSENTIAL</span>
          )}
          <Link href={`/product/${product.slug}`} className={styles.title} title={product.title}>
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
                <span className={styles.discountBadge}>-{discountPercent}%</span>
              </>
            ) : (
              <span className={styles.basePrice}>
                ₹{product.basePrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Color Swatches if multiple real variants exist */}
          {product.variants && (
            (() => {
              const uniqueVariants = product.variants.filter(
                (v, i, self) =>
                  Boolean(v.color) &&
                  i === self.findIndex((t) => t.color.trim().toLowerCase() === v.color.trim().toLowerCase())
              );
              if (uniqueVariants.length <= 1) return null;
              return (
                <div className={styles.colorSwatchesRow} aria-label="Available colors">
                  {uniqueVariants.slice(0, 4).map((v) => (
                    <button
                      key={v.sku || v.color}
                      type="button"
                      className={`${styles.colorDot} ${activeColor === v.color ? styles.colorDotActive : ''}`}
                      style={{ backgroundColor: resolveColorHex(v.color, v.colorHex) }}
                      title={v.color}
                      aria-label={`Show ${v.color} variant`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveColor(v.color);
                      }}
                      onMouseEnter={() => {
                        setActiveColor(v.color);
                      }}
                    />
                  ))}
                  {uniqueVariants.length > 4 && (
                    <span className={styles.colorMoreCount}>+{uniqueVariants.length - 4}</span>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
};
