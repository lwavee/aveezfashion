import React from 'react';
import styles from './AccessoriesPlaceholder.module.css';

interface AccessoriesPlaceholderProps {
  title?: string;
  categoryName?: string;
  className?: string;
}

export const AccessoriesPlaceholder: React.FC<AccessoriesPlaceholderProps> = ({
  title = 'Handcrafted Piece',
  categoryName = 'Accessories',
  className = '',
}) => {
  return (
    <div className={`${styles.placeholderWrapper} ${className}`} aria-hidden="true">
      <div className={styles.innerBox}>
        <div className={styles.monogram}>AV</div>
        <span className={styles.brandTitle}>AVEEZ ACCESSORIES</span>
        <span className={styles.categoryBadge}>{categoryName.toUpperCase()}</span>
        <span className={styles.pieceTitle}>{title}</span>
      </div>
    </div>
  );
};
