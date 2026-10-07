import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { FilterSidebar } from '@/components/shop/FilterSidebar';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { CatalogService } from '@/server/services/catalogService';
import styles from './shop.module.css';

export const metadata: Metadata = {
  title: 'Shop All Collections & Drops',
  description:
    'Explore the full Aveez Fashion catalog. Luxury heavyweight hoodies, oversized tees, structured shirts, and tailored wide-leg trousers.',
};

interface ShopPageProps {
  searchParams: {
    category?: string;
    gender?: string;
    size?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    search?: string;
    page?: string;
    filter?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const page = parseInt(searchParams.page || '1', 10);
  const isNewArrival = searchParams.filter === 'new';
  const isBestSeller = searchParams.filter === 'bestseller';

  const [categories, result] = await Promise.all([
    CatalogService.getCategories(),
    CatalogService.getProducts({
      categorySlug: searchParams.category,
      gender: searchParams.gender,
      size: searchParams.size,
      minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
      sort: searchParams.sort,
      search: searchParams.search,
      page,
      limit: 12,
      isNewArrival,
      isBestSeller,
    }),
  ]);

  // Determine Heading Title
  let pageTitle = 'ALL COLLECTIONS';
  if (searchParams.gender) {
    pageTitle = `${searchParams.gender.toUpperCase()} COLLECTION`;
  } else if (searchParams.category) {
    const matched = categories.find((c) => c.slug === searchParams.category);
    pageTitle = matched ? matched.name.toUpperCase() : searchParams.category.toUpperCase();
  } else if (isNewArrival) {
    pageTitle = 'NEW ARRIVALS';
  } else if (isBestSeller) {
    pageTitle = 'BEST SELLERS';
  } else if (searchParams.search) {
    pageTitle = `SEARCH RESULTS FOR "${searchParams.search.toUpperCase()}"`;
  }

  return (
    <div className={`container ${styles.shopPage}`}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.breadcrumb}>
            <Link href="/">HOME</Link> / <span>SHOP</span>
          </span>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
        </div>
        <div className={styles.countInfo}>
          <span>SHOWING {result.products.length} OF {result.total} PIECES</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={styles.layout}>
        {/* Filter Sidebar */}
        <FilterSidebar categories={categories} />

        {/* Product Grid Area */}
        <div className={styles.gridArea}>
          {result.products.length === 0 ? (
            <div className={styles.emptyResults}>
              <h2 className={styles.emptyTitle}>NO PIECES MATCH YOUR CRITERIA</h2>
              <p className={styles.emptyDesc}>
                Try loosening your filter parameters or exploring all collections.
              </p>
              <Link href="/shop">
                <Button variant="primary" size="md">
                  RESET ALL FILTERS
                </Button>
              </Link>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {result.products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {result.totalPages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === page;
                const params = new URLSearchParams(searchParams as Record<string, string>);
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
    </div>
  );
}
