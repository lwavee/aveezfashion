import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';
import styles from './CategoryGrid.module.css';

interface CategoryGridProps {
  categories: Category[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  return (
    <section className={`container ${styles.section}`} aria-label="Shop By Category">
      <div className={styles.header}>
        <span className={styles.sectionSubtitle}>CURATED TAXONOMY</span>
        <h2 className={styles.sectionTitle}>SHOP BY CATEGORY</h2>
      </div>

      <div className={styles.grid}>
        {categories.map((cat, index) => {
          const isFeatured = index === 0 || index === 1; // First two categories get larger editorial hero cards

          return (
            <Link
              key={cat._id}
              href={`/shop?category=${cat.slug}`}
              className={`${styles.card} ${isFeatured ? styles.featuredCard : ''}`}
            >
              <div className={styles.imageWrapper}>
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.placeholder} />
                )}
                <div className={styles.cardOverlay} />
              </div>

              <div className={styles.cardContent}>
                <span className={styles.catName}>{cat.name}</span>
                <span className={styles.exploreLink}>EXPLORE CAPSULE →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
