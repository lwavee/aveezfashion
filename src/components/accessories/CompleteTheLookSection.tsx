'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { AccessoriesPlaceholder } from './AccessoriesPlaceholder';
import styles from './CompleteTheLookSection.module.css';

export interface CompleteTheLookSectionProps {
  parentProduct: Product;
  recommendedItems: Product[];
  isAccessoryView?: boolean;
}

export const CompleteTheLookSection: React.FC<CompleteTheLookSectionProps> = ({
  parentProduct,
  recommendedItems,
  isAccessoryView = false,
}) => {
  const { addToCart } = useCart();
  const [addedSku, setAddedSku] = useState<string | null>(null);

  const handleAddPiece = (item: Product) => {
    // Pick the first in-stock variant
    const variant = item.variants?.find((v) => v.stock > 0) || item.variants?.[0];
    if (!variant || variant.stock <= 0) return;

    const primaryImg = item.images?.find((img) => img.isPrimary) || item.images?.[0];

    addToCart(
      {
        productId: item._id,
        variantSku: variant.sku,
        title: item.title,
        slug: item.slug,
        size: variant.size,
        color: variant.color,
        price: item.salePrice || item.basePrice,
        originalPrice: item.basePrice,
        image: primaryImg?.url || '/brand/clothing-label-mark.svg',
      },
      1
    );

    setAddedSku(variant.sku);
    setTimeout(() => {
      setAddedSku(null);
    }, 1800);
  };

  // If no recommendations exist in database yet, render an editorial banner leading to the collection
  if (!recommendedItems || recommendedItems.length === 0) {
    if (isAccessoryView) return null;

    return (
      <section className={styles.container} aria-label="Complete The Look">
        <div className={styles.teaserBanner}>
          <div className={styles.teaserTextCol}>
            <span className={styles.sectionSubtitle}>CURATED PAIRINGS</span>
            <h2 className={styles.teaserHeading}>COMPLETE THE LOOK</h2>
            <p className={styles.teaserDesc}>
              Pair this piece with handcrafted floral headbands, sculpted claw clips, and tactile charms
              from our newly released Accessories collection.
            </p>
          </div>
          <Link href="/accessories" className={styles.teaserCta}>
            <span>DISCOVER ACCESSORIES</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container} aria-label="Complete The Look">
      <div className={styles.header}>
        <span className={styles.sectionSubtitle}>
          {isAccessoryView ? 'STYLE WITH APPAREL' : 'CURATED PAIRINGS'}
        </span>
        <h2 className={styles.sectionTitle}>
          {isAccessoryView ? 'PAIR WITH THE EDIT' : 'COMPLETE THE LOOK'}
        </h2>
        <p className={styles.sectionNote}>
          {isAccessoryView
            ? `Architectural garments that complement this accessory's silhouette.`
            : `Handcrafted accessories selected to harmonize with ${parentProduct.title}.`}
        </p>
      </div>

      <div className={styles.grid}>
        {recommendedItems.slice(0, 4).map((item) => {
          const primaryImg = item.images?.find((img) => img.isPrimary) || item.images?.[0];
          const inStockVariant = item.variants?.find((v) => v.stock > 0);
          const isAvailable = Boolean(inStockVariant);
          const price = item.salePrice || item.basePrice;
          const hasDiscount = item.salePrice && item.salePrice < item.basePrice;
          const isAdded = inStockVariant && addedSku === inStockVariant.sku;

          return (
            <div key={item._id} className={styles.card}>
              <Link href={`/product/${item.slug}`} className={styles.imageLink}>
                {primaryImg?.url ? (
                  <div className={styles.imageWrapper}>
                    <Image
                      src={primaryImg.url}
                      alt={primaryImg.alt || item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className={styles.image}
                    />
                  </div>
                ) : (
                  <AccessoriesPlaceholder
                    title={item.title}
                    categoryName={typeof item.category === 'string' ? item.category : 'Accessory'}
                  />
                )}
              </Link>

              <div className={styles.cardDetails}>
                <div className={styles.tagRow}>
                  <span className={styles.pairingTag}>COLOR COMPATIBLE</span>
                  {!isAvailable && <span className={styles.outOfStockTag}>SOLD OUT</span>}
                </div>

                <Link href={`/product/${item.slug}`} className={styles.titleLink}>
                  <h3 className={styles.productTitle}>{item.title}</h3>
                </Link>

                <div className={styles.priceRow}>
                  <span className={styles.price}>₹{price.toLocaleString('en-IN')}</span>
                  {hasDiscount && (
                    <span className={styles.originalPrice}>
                      ₹{item.basePrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {inStockVariant?.color && (
                  <div className={styles.colorPill}>
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: inStockVariant.colorHex || '#0A0A0A' }}
                    />
                    <span>{inStockVariant.color}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => handleAddPiece(item)}
                  className={`${styles.addBtn} ${isAdded ? styles.addedBtn : ''}`}
                  aria-label={`Add ${item.title} to bag`}
                >
                  {isAdded ? (
                    <>
                      <Check size={14} />
                      <span>ADDED TO BAG</span>
                    </>
                  ) : isAvailable ? (
                    <>
                      <ShoppingBag size={14} />
                      <span>ADD TO BAG</span>
                    </>
                  ) : (
                    <span>OUT OF STOCK</span>
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
