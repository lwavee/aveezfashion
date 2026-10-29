'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import styles from './AccessoriesFilterBar.module.css';

export interface CategoryFilterItem {
  id: string;
  label: string;
  slug: string;
}

export const ACCESSORY_CATEGORIES: CategoryFilterItem[] = [
  { id: 'all', label: 'All Accessories', slug: 'all' },
  { id: 'hairbands', label: 'Hairbands', slug: 'hairbands' },
  { id: 'hair-clips', label: 'Hair Clips', slug: 'hair-clips' },
  { id: 'claw-clips', label: 'Claw Clips', slug: 'claw-clips' },
  { id: 'keychains', label: 'Keychains', slug: 'keychains' },
  { id: 'bag-charms', label: 'Bag Charms', slug: 'bag-charms' },
  { id: 'matching-sets', label: 'Matching Sets', slug: 'matching-sets' },
];

export interface AccessoriesFilterBarProps {
  activeCategory: string;
  activeSort: string;
  totalProducts: number;
}

export const AccessoriesFilterBar: React.FC<AccessoriesFilterBarProps> = ({
  activeCategory,
  activeSort,
  totalProducts,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategorySelect = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (categorySlug === 'all') {
      params.delete('category');
    } else {
      params.set('category', categorySlug);
    }
    params.delete('page');
    router.push(`/accessories?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortVal = e.target.value;
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (sortVal) {
      params.set('sort', sortVal);
    } else {
      params.delete('sort');
    }
    params.delete('page');
    router.push(`/accessories?${params.toString()}`, { scroll: false });
  };

  const normalizedActive = activeCategory || 'all';

  return (
    <div className={styles.barContainer}>
      {/* Horizontal Scrollable Category Filter Pills */}
      <div className={styles.pillScrollWrapper} role="tablist" aria-label="Accessories categories">
        {ACCESSORY_CATEGORIES.map((cat) => {
          const isSelected = normalizedActive === cat.slug;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isSelected}
              className={`${styles.pillBtn} ${isSelected ? styles.pillActive : ''}`}
              onClick={() => handleCategorySelect(cat.slug)}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Controls Bar: Count & Sorting */}
      <div className={styles.metaControls}>
        <span className={styles.productCount}>
          {totalProducts} {totalProducts === 1 ? 'piece' : 'pieces'}
        </span>

        <div className={styles.sortWrapper}>
          <ArrowUpDown size={14} className={styles.sortIcon} />
          <select
            value={activeSort || ''}
            onChange={handleSortChange}
            className={styles.sortSelect}
            aria-label="Sort accessories"
          >
            <option value="">Featured / Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="best_selling">Best Sellers</option>
          </select>
        </div>
      </div>
    </div>
  );
};
