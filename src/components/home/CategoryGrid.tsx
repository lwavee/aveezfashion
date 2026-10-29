import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';
import styles from './CategoryGrid.module.css';

interface CategoryGridProps {
  categories: Category[];
  isDiwali?: boolean;
}

interface FestiveCategory {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  href: string;
  objectPosition?: string;
}

const FESTIVE_CATEGORIES: FestiveCategory[] = [
  {
    id: 'men-ethnic',
    name: "Men's Ethnic Wear",
    subtitle: 'Kurta sets & royal silhouettes',
    image: '/api/media/campaigns/diwali/men.webp',
    href: '/shop?gender=MEN&tag=festive',
    objectPosition: 'center 20%',
  },
  {
    id: 'women-festive',
    name: "Women's Festive Wear",
    subtitle: 'Festive anarkalis & drapes',
    image: '/api/media/campaigns/diwali/women.webp',
    href: '/shop?gender=WOMEN&tag=festive',
    objectPosition: 'center 20%',
  },
  {
    id: 'couple-matching',
    name: 'Couple Matching Outfits',
    subtitle: 'Coordinated festive harmony',
    image: '/api/media/campaigns/diwali/matching-styles.webp',
    href: '/collections/matching-styles',
    objectPosition: 'center 25%',
  },
  {
    id: 'best-diwali-looks',
    name: 'Best Diwali Looks',
    subtitle: 'Curated statement edits',
    image: '/api/media/campaigns/diwali/hero-desktop.webp',
    href: '/shop?tag=diwali',
    objectPosition: 'center 35%',
  },
];

// Curated high-impact fashion editorial photography mapping for the 6 core categories
const EDITORIAL_CONFIGS: Record<string, { image: string; objectPosition: string }> = {
  men: {
    image: '/api/media/categories/men.webp',
    objectPosition: 'center 20%',
  },
  women: {
    image: '/api/media/categories/women.webp',
    objectPosition: 'center 20%',
  },
  hoodies: {
    image: '/api/media/categories/hoodies.webp',
    objectPosition: 'center center',
  },
  'oversized-tees': {
    image: '/api/media/categories/oversized-tees.webp',
    objectPosition: 'center 20%',
  },
  bottoms: {
    image: '/api/media/categories/bottoms.webp',
    objectPosition: 'center center',
  },
  shirts: {
    image: '/api/media/categories/shirts.webp',
    objectPosition: 'center center',
  },
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, isDiwali }) => {
  if (isDiwali) {
    return (
      <section className={`container ${styles.section}`} aria-label="Festive Shopping Categories">
        <div className={styles.header}>
          <span className={styles.sectionEyebrow}>✨ THE DIWALI EDIT</span>
          <h2 className={styles.sectionTitle}>SHOP BY FESTIVE CATEGORY</h2>
        </div>

        <div className={styles.festiveGrid}>
          {FESTIVE_CATEGORIES.map((cat, idx) => (
            <Link
              key={cat.id}
              href={cat.href}
              className={`${styles.card} ${styles.festiveCard}`}
              aria-label={`Shop ${cat.name} — ${cat.subtitle}`}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  priority={idx < 2}
                  style={{ objectPosition: cat.objectPosition || 'center center' }}
                  className={styles.image}
                />
                <div className={styles.festiveCardOverlay} />
              </div>

              <div className={styles.cardContent}>
                <span className={styles.festiveCardSubtitle}>{cat.subtitle}</span>
                <h3 className={`${styles.catName} ${styles.festiveCatName}`}>{cat.name}</h3>
                <span className={styles.exploreLink}>
                  <span className={styles.desktopExploreText}>EXPLORE COLLECTION</span>
                  <span className={styles.mobileExploreText}>EXPLORE</span>
                  <span className={styles.arrow} aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // Preserve all six categories for standard / normal mode
  const primaryCategories = categories.slice(0, 2);
  const secondaryCategories = categories.slice(2, 6);

  const renderCard = (cat: Category, isHero: boolean) => {
    const editorial = EDITORIAL_CONFIGS[cat.slug];
    const imageSrc = editorial?.image || cat.image;
    const objectPosition = editorial?.objectPosition || 'center center';

    const getCategoryHref = (slug: string) => {
      if (slug === 'men') return '/shop?gender=MEN';
      if (slug === 'women') return '/shop?gender=WOMEN';
      if (slug === 'accessories') return '/accessories';
      return `/shop?category=${slug}`;
    };

    return (
      <Link
        key={cat._id || cat.slug}
        href={getCategoryHref(cat.slug)}
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
