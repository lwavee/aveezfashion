'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/types';
import styles from './FilterSidebar.module.css';

interface FilterSidebarProps {
  categories: Category[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ categories }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentGender = searchParams.get('gender') || '';
  const currentSize = searchParams.get('size') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1 on filter change
    router.push(`/shop?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/shop');
  };

  const hasActiveFilters = Boolean(
    currentCategory || currentGender || currentSize || currentMinPrice || currentMaxPrice
  );

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <aside className={styles.sidebar} aria-label="Product Filters">
      <div className={styles.filterHeader}>
        <span className={styles.filterTitle}>FILTERS</span>
        {hasActiveFilters ? (
          <button onClick={clearAllFilters} className={styles.clearBtn}>
            RESET ALL
          </button>
        ) : null}
      </div>

      {/* Gender Filter */}
      <div className={styles.filterGroup}>
        <h3 className={styles.groupHeader}>GENDER</h3>
        <div className={styles.optionsList}>
          {['ALL', 'MEN', 'WOMEN'].map((g) => {
            const val = g === 'ALL' ? '' : g;
            const isSelected = currentGender === val;

            return (
              <button
                key={g}
                onClick={() => updateFilter('gender', val)}
                className={`${styles.filterOption} ${isSelected ? styles.selected : ''}`}
              >
                <span className={styles.radioDot} />
                <span>{g}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      <div className={styles.filterGroup}>
        <h3 className={styles.groupHeader}>CATEGORY</h3>
        <div className={styles.optionsList}>
          <button
            onClick={() => updateFilter('category', '')}
            className={`${styles.filterOption} ${!currentCategory ? styles.selected : ''}`}
          >
            <span className={styles.radioDot} />
            <span>ALL CATEGORIES</span>
          </button>
          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            return (
              <button
                key={cat._id}
                onClick={() => updateFilter('category', cat.slug)}
                className={`${styles.filterOption} ${isSelected ? styles.selected : ''}`}
              >
                <span className={styles.radioDot} />
                <span>{cat.name.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Filter */}
      <div className={styles.filterGroup}>
        <h3 className={styles.groupHeader}>SIZE</h3>
        <div className={styles.sizeChips}>
          {sizes.map((s) => {
            const isSelected = currentSize === s;
            return (
              <button
                key={s}
                onClick={() => updateFilter('size', isSelected ? '' : s)}
                className={`${styles.sizeChip} ${isSelected ? styles.selectedSize : ''}`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className={styles.filterGroup}>
        <h3 className={styles.groupHeader}>PRICE RANGE</h3>
        <div className={styles.priceTiers}>
          {[
            { label: 'ALL PRICES', min: '', max: '' },
            { label: 'UNDER ₹2,000', min: '0', max: '2000' },
            { label: '₹2,000 — ₹3,500', min: '2000', max: '3500' },
            { label: 'ABOVE ₹3,500', min: '3500', max: '10000' },
          ].map((tier, idx) => {
            const isSelected =
              currentMinPrice === tier.min && currentMaxPrice === tier.max;

            return (
              <button
                key={idx}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (tier.min) params.set('minPrice', tier.min);
                  else params.delete('minPrice');
                  if (tier.max) params.set('maxPrice', tier.max);
                  else params.delete('maxPrice');
                  params.delete('page');
                  router.push(`/shop?${params.toString()}`);
                }}
                className={`${styles.filterOption} ${isSelected ? styles.selected : ''}`}
              >
                <span className={styles.radioDot} />
                <span>{tier.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
