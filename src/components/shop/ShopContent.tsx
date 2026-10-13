'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category, Product } from '@/types';
import { FilterSidebar } from '@/components/shop/FilterSidebar';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import styles from './ShopContent.module.css';

export interface ShopContentProps {
  categories: Category[];
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageTitle: string;
  isNewArrival?: boolean;
}

export const ShopContent: React.FC<ShopContentProps> = ({
  categories,
  products,
  total,
  totalPages,
  currentPage,
  pageTitle,
  isNewArrival = false,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hidden by default on desktop, tablet, and mobile
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  // Detect screen size for responsive drawer vs desktop sidebar
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1024px)');
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobileOrTablet(e.matches);
    };

    setIsMobileOrTablet(mql.matches);
    mql.addEventListener('change', handleMediaChange);

    return () => {
      mql.removeEventListener('change', handleMediaChange);
    };
  }, []);

  // Close on Escape key on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFilterOpen && !isMobileOrTablet) {
        setIsFilterOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFilterOpen, isMobileOrTablet]);

  const toggleFilter = useCallback(() => {
    setIsFilterOpen((prev) => !prev);
  }, []);

  const closeFilter = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  // Query parameters state
  const currentCategory = searchParams.get('category') || '';
  const currentGender = searchParams.get('gender') || '';
  const currentSize = searchParams.get('size') || '';
  const currentColor = searchParams.get('color') || searchParams.get('colour') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSort = searchParams.get('sort') || '';

  // Calculate active filter count
  const activeCount = [
    currentGender,
    currentCategory,
    currentSize,
    currentColor,
    currentMinPrice || currentMaxPrice,
  ].filter(Boolean).length;

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort) {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    if (key === 'color') params.delete('colour');
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  };

  const removePriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('minPrice');
    params.delete('maxPrice');
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

  // Helper label for price
  let priceLabel = '';
  if (currentMinPrice === '0' && currentMaxPrice === '2000') priceLabel = 'UNDER ₹2,000';
  else if (currentMinPrice === '2000' && currentMaxPrice === '3500') priceLabel = '₹2,000 — ₹3,500';
  else if (currentMinPrice === '3500') priceLabel = 'ABOVE ₹3,500';
  else if (currentMinPrice || currentMaxPrice) priceLabel = `₹${currentMinPrice || '0'} - ₹${currentMaxPrice || 'MAX'}`;

  // Helper label for category
  const categoryObj = categories.find((c) => c.slug === currentCategory);
  const categoryLabel = categoryObj ? categoryObj.name.toUpperCase() : currentCategory.toUpperCase();

  return (
    <div className={`container ${styles.shopPage}`}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.breadcrumb}>
            <Link href="/">HOME</Link> / <span>{isNewArrival ? 'NEW ARRIVALS' : 'SHOP'}</span>
          </span>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
        </div>
      </div>

      {/* Controls Bar: Product Count, Sorting Dropdown & Three-Dot Filter Toggle */}
      <div className={styles.controlsBar}>
        <div className={styles.countInfo}>
          <span>SHOWING {products.length} OF {total} PIECES</span>
        </div>

        <div className={styles.controlsActions}>
          {/* Sorting Dropdown */}
          <div className={styles.sortWrapper}>
            <label htmlFor="shop-sort-select" className={styles.sortLabel}>
              SORT:
            </label>
            <div className={styles.selectContainer}>
              <select
                id="shop-sort-select"
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className={styles.sortSelect}
                aria-label="Sort products by"
              >
                <option value="">FEATURED</option>
                <option value="price_asc">PRICE: LOW TO HIGH</option>
                <option value="price_desc">PRICE: HIGH TO LOW</option>
                <option value="best_selling">BEST SELLING</option>
              </select>
              <span className={styles.sortChevron} aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          </div>

          {/* Three-Dot Filter Toggle Button */}
          <button
            type="button"
            id="filter-toggle-button"
            onClick={toggleFilter}
            className={`${styles.filterToggleBtn} ${isFilterOpen ? styles.filterToggleActive : ''}`}
            aria-expanded={isFilterOpen}
            aria-controls="shop-filter-panel"
            aria-label={isFilterOpen ? 'Close filter sidebar' : 'Open filter sidebar'}
            title={isFilterOpen ? 'Close filters' : 'Open filters'}
          >
            <span className={styles.dotsIcon} aria-hidden="true">
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </span>
            <span className={styles.filterToggleText}>FILTERS</span>
            {activeCount > 0 && (
              <span className={styles.activeFilterBadge} aria-label={`${activeCount} active filters`}>
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filters Bar (Chips) */}
      {activeCount > 0 && (
        <div className={styles.activeFiltersBar} aria-label="Active filters">
          <span className={styles.activeFiltersLabel}>ACTIVE:</span>
          <div className={styles.filterPillsList}>
            {currentGender && (
              <button
                type="button"
                onClick={() => removeFilter('gender')}
                className={styles.filterPill}
                aria-label={`Remove gender filter: ${currentGender}`}
              >
                <span>GENDER: {currentGender}</span>
                <span className={styles.pillRemove} aria-hidden="true">×</span>
              </button>
            )}
            {currentCategory && (
              <button
                type="button"
                onClick={() => removeFilter('category')}
                className={styles.filterPill}
                aria-label={`Remove category filter: ${categoryLabel}`}
              >
                <span>CATEGORY: {categoryLabel}</span>
                <span className={styles.pillRemove} aria-hidden="true">×</span>
              </button>
            )}
            {currentSize && (
              <button
                type="button"
                onClick={() => removeFilter('size')}
                className={styles.filterPill}
                aria-label={`Remove size filter: ${currentSize}`}
              >
                <span>SIZE: {currentSize}</span>
                <span className={styles.pillRemove} aria-hidden="true">×</span>
              </button>
            )}
            {currentColor && (
              <button
                type="button"
                onClick={() => removeFilter('color')}
                className={styles.filterPill}
                aria-label={`Remove colour filter: ${currentColor}`}
              >
                <span>COLOUR: {currentColor.toUpperCase()}</span>
                <span className={styles.pillRemove} aria-hidden="true">×</span>
              </button>
            )}
            {(currentMinPrice || currentMaxPrice) && (
              <button
                type="button"
                onClick={removePriceFilter}
                className={styles.filterPill}
                aria-label="Remove price filter"
              >
                <span>PRICE: {priceLabel}</span>
                <span className={styles.pillRemove} aria-hidden="true">×</span>
              </button>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className={styles.clearAllPillBtn}
              aria-label="Clear all applied filters"
            >
              CLEAR ALL
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className={styles.layout}>
        {/* Desktop Smooth Collapsible Filter Sidebar */}
        <div
          id="shop-filter-panel"
          className={`${styles.sidebarWrapper} ${
            isFilterOpen ? styles.sidebarOpen : styles.sidebarClosed
          }`}
          aria-hidden={!isFilterOpen}
        >
          <div className={styles.sidebarInner}>
            <FilterSidebar
              categories={categories}
              onClose={closeFilter}
              totalResults={total}
            />
          </div>
        </div>

        {/* Product Grid Area */}
        <div className={`${styles.gridArea} ${!isFilterOpen ? styles.gridExpanded : ''}`}>
          {products.length === 0 ? (
            <div className={styles.emptyResults}>
              <h2 className={styles.emptyTitle}>NO PIECES MATCH YOUR CRITERIA</h2>
              <p className={styles.emptyDesc}>
                Try loosening your filter parameters or exploring all collections.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={clearAllFilters}
              >
                RESET ALL FILTERS
              </Button>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === currentPage;
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', pageNum.toString());

                return (
                  <Link
                    key={pageNum}
                    href={`/shop?${params.toString()}`}
                    className={`${styles.pageBtn} ${isActive ? styles.activePage : ''}`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile & Tablet Slide-in Drawer with visible Close button */}
      {isMobileOrTablet && (
        <Drawer
          isOpen={isFilterOpen}
          onClose={closeFilter}
          title="FILTERS"
          placement="right"
          size="md"
        >
          <FilterSidebar
            categories={categories}
            onClose={closeFilter}
            isMobileDrawer
            totalResults={total}
          />
        </Drawer>
      )}
    </div>
  );
};
