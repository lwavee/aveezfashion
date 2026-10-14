import React from 'react';
import styles from './AccessoriesHero.module.css';

export interface AccessoriesHeroProps {
  totalCount?: number;
}

export const AccessoriesHero: React.FC<AccessoriesHeroProps> = ({ totalCount }) => {
  return (
    <section className={styles.heroSection} aria-label="Accessories Collection Header">
      <div className={styles.heroContent}>
        <div className={styles.kickerWrapper}>
          <span className={styles.kicker}>THE ACCESSORIES EDIT</span>
          <span className={styles.kickerDot}>•</span>
          <span className={styles.kickerNote}>HANDCRAFTED & SCULPTED ACCENTS</span>
        </div>

        <h1 className={styles.headline}>THE FINISHING TOUCH</h1>

        <p className={styles.supportingText}>
          Accessories that bring your look together. Deliberately designed floral headbands,
          minimalist hair clips, and tactile charms engineered to elevate your daily silhouette.
        </p>

        {typeof totalCount === 'number' && totalCount > 0 && (
          <div className={styles.metaRow}>
            <span className={styles.counterBadge}>
              {totalCount} {totalCount === 1 ? 'PIECE' : 'CURATED PIECES'} AVAILABLE
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
