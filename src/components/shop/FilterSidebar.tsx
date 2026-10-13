'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/types';
import styles from './FilterSidebar.module.css';

export interface FilterSidebarProps {
  categories: Category[];
  onClose?: () => void;
  isMobileDrawer?: boolean;
  totalResults?: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  onClose,
  isMobileDrawer = false,
  totalResults,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentGender = searchParams.get('gender') || '';
  const currentSize = searchParams.get('size') || '';
  const currentColor = searchParams.get('color') || searchParams.get('colour') || '';
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

  const updateColorFilter = (colorVal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (colorVal) {
      params.set('color', colorVal);
      params.delete('colour');
    } else {
      params.delete('color');
      params.delete('colour');
    }
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const filterType = searchParams.get('filter');
    const searchVal = searchParams.get('search');
    const sortVal = searchParams.get('sort');
    if (filterType) params.set('filter', filterType);
    if (searchVal) params.set('search', searchVal);
    if (sortVal) params.set('sort', sortVal);
    const queryString = params.toString();
    router.push(queryString ? `/shop?${queryString}` : '/shop');
  };

  const activeCount = [
    currentGender,
    currentCategory,
    currentSize,
    currentColor,
    currentMinPrice || currentMaxPrice,
  ].filter(Boolean).length;

  const hasActiveFilters = activeCount > 0;

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const colorOptions = [
    { label: 'ALL COLOURS', value: '', hex: 'transparent' },
    { label: 'ONYX BLACK', value: 'Onyx Black', hex: '#0A0A0A' },
    { label: 'CHALK WHITE', value: 'Chalk White', hex: '#FBFBFB', border: true },
    { label: 'SLATE GRAY', value: 'Slate Gray', hex: '#4B5563' },
    { label: 'RAW ECRU', value: 'Raw Ecru', hex: '#E5E7EB', border: true },
    { label: 'CHARCOAL', value: 'Charcoal', hex: '#1F2937' },
    { label: 'VINTAGE BONE', value: 'Vintage Bone', hex: '#F4F4F5', border: true },
  ];

  return (
    <aside
      className={`${styles.sidebar} ${isMobileDrawer ? styles.drawerSidebar : ''}`}
      aria-label="Product Filters"
    >
      <div className={styles.filterHeader}>
        <div className={styles.titleWithCount}>
          <span className={styles.filterTitle}>FILTERS</span>
          {hasActiveFilters && (
            <span className={styles.headerCountBadge} aria-label={`${activeCount} active filters`}>
              {activeCount}
            </span>
          )}
        </div>

        <div className={styles.headerActions}>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className={styles.clearBtn}
              aria-label="Reset all filters"
            >
              RESET ALL
            </button>
          )}

          {onClose && !isMobileDrawer && (
            <button
              type="button"
              onClick={onClose}
              className={styles.closeBtn}
              aria-label="Close filters panel"
              title="Close filters"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className={styles.filterGroupsContainer}>
        {/* Gender Filter */}
        <div className={styles.filterGroup}>
          <h3 className={styles.groupHeader}>GENDER</h3>
          <div className={styles.optionsList}>
            {['ALL', 'MEN', 'WOMEN'].map((g) => {
              const val = g === 'ALL' ? '' : g;
              const isSelected = currentGender === val;

              return (
                <button
                  type="button"
                  key={g}
                  onClick={() => updateFilter('gender', val)}
                  className={`${styles.filterOption} ${isSelected ? styles.selected : ''}`}
                  aria-pressed={isSelected}
                >
                  <span className={styles.radioDot} aria-hidden="true" />
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
              type="button"
              onClick={() => updateFilter('category', '')}
              className={`${styles.filterOption} ${!currentCategory ? styles.selected : ''}`}
              aria-pressed={!currentCategory}
            >
              <span className={styles.radioDot} aria-hidden="true" />
              <span>ALL CATEGORIES</span>
            </button>
            {categories.map((cat) => {
              const isSelected = currentCategory === cat.slug;
              return (
                <button
                  type="button"
                  key={cat._id}
                  onClick={() => updateFilter('category', cat.slug)}
                  className={`${styles.filterOption} ${isSelected ? styles.selected : ''}`}
                  aria-pressed={isSelected}
                >
                  <span className={styles.radioDot} aria-hidden="true" />
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
                  type="button"
                  key={s}
                  onClick={() => updateFilter('size', isSelected ? '' : s)}
                  className={`${styles.sizeChip} ${isSelected ? styles.selectedSize : ''}`}
                  aria-pressed={isSelected}
                  aria-label={`Size ${s}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Colour Filter */}
        <div className={styles.filterGroup}>
          <h3 className={styles.groupHeader}>COLOUR</h3>
          <div className={styles.colorOptionsList}>
            {colorOptions.map((opt) => {
              const isSelected =
                (!opt.value && !currentColor) ||
                (Boolean(opt.value) && currentColor.toLowerCase() === opt.value.toLowerCase());

              return (
                <button
                  type="button"
                  key={opt.label}
                  onClick={() => updateColorFilter(isSelected && opt.value ? '' : opt.value)}
                  className={`${styles.colorOption} ${isSelected ? styles.selected : ''}`}
                  aria-pressed={Boolean(isSelected)}
                  aria-label={`Filter by color: ${opt.label}`}
                >
                  {opt.hex !== 'transparent' ? (
                    <span
                      className={`${styles.colorSwatch} ${opt.border ? styles.colorSwatchBorder : ''}`}
                      style={{ backgroundColor: opt.hex }}
                      aria-hidden="true"
                    />
                  ) : (
                    <span className={styles.radioDot} aria-hidden="true" />
                  )}
                  <span>{opt.label}</span>
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
                  type="button"
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
                  aria-pressed={isSelected}
                >
                  <span className={styles.radioDot} aria-hidden="true" />
                  <span>{tier.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drawer bottom actions */}
      {isMobileDrawer && (
        <div className={styles.drawerBottomActions}>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className={styles.drawerClearBtn}
            >
              CLEAR ALL
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={styles.drawerApplyBtn}
          >
            APPLY FILTERS {totalResults !== undefined ? `(${totalResults})` : ''}
          </button>
        </div>
      )}
    </aside>
  );
};
