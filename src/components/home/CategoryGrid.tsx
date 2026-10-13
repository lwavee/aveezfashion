import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';
import styles from './CategoryGrid.module.css';

interface CategoryGridProps {
  categories: Category[];
}

interface EditorialConfig {
  image: string;
  objectPosition: string;
}

// Curated high-impact fashion editorial photography mapping for the 6 core categories
const EDITORIAL_CONFIGS: Record<string, EditorialConfig> = {
  men: {
    image: '/images/CATEGORY/men.png',
    objectPosition: 'center 20%',
  },
  women: {
    image: '/images/CATEGORY/women.png',
    objectPosition: 'center 20%',
  },
  hoodies: {
    image: '/images/CATEGORY/hoodies.png',
    objectPosition: 'center center',
  },
  'oversized-tees': {
    image: '/images/CATEGORY/oversizetshirt.png',
    objectPosition: 'center 20%',
  },
  bottoms: {
    image: '/images/CATEGORY/bootom.png',
    objectPosition: 'center center',
  },
  shirts: {
    image: '/images/CATEGORY/shirt.png',
    objectPosition: 'center center',
  },
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  // Preserve all six categories:
  // Row 1: Men and Women (large editorial hero cards)
  // Row 2: Hoodies, Oversized Tees, Bottoms, Shirts (equal dimension cards)
  const primaryCategories = categories.slice(0, 2);
  const secondaryCategories = categories.slice(2, 6);

  const renderCard = (cat: Category, isHero: boolean) => {
    const editorial = EDITORIAL_CONFIGS[cat.slug];
    const imageSrc = editorial?.image || cat.image;
    const objectPosition = editorial?.objectPosition || 'center center';

    return (
      <Link
        key={cat._id || cat.slug}
        href={`/shop?category=${cat.slug}`}
        className={`${styles.card} ${isHero ? styles.heroCard : styles.standardCard}`}
        aria-label={`Shop ${cat.name}`}
      >
        <div className={styles.imageWrapper}>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={cat.name}
              fill
              sizes={
                isHero
                  ? '(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 50vw'
                  : '(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw'
              }
              priority={isHero}
              style={{ objectPosition }}
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder} />
          )}
          <div className={styles.cardOverlay} />
        </div>

        <div className={styles.cardContent}>
          <h3 className={`${styles.catName} ${isHero ? styles.heroCatName : styles.standardCatName}`}>
            {cat.name}
          </h3>
          <span className={styles.exploreLink}>
            <span className={styles.desktopExploreText}>EXPLORE {cat.name.toUpperCase()}</span>
            <span className={styles.mobileExploreText}>EXPLORE</span>
            <span className={styles.arrow} aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    );
  };

  return (
    <section className={`container ${styles.section}`} aria-label="Shop By Category">
      <div className={styles.header}>
        <span className={styles.sectionEyebrow}>CURATED ESSENTIALS</span>
        <h2 className={styles.sectionTitle}>SHOP BY CATEGORY</h2>
      </div>

      <div className={styles.gridContainer}>
        {/* Row 1: Men and Women (two large editorial hero cards) */}
        <div className={styles.heroRow}>
          {primaryCategories.map((cat) => renderCard(cat, true))}
        </div>

        {/* Row 2: Hoodies, Oversized Tees, Bottoms, Shirts (four equal cards) */}
        <div className={styles.secondaryGrid}>
          {secondaryCategories.map((cat) => renderCard(cat, false))}
        </div>
      </div>
    </section>
  );
};
