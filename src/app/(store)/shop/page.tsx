import React from 'react';
import { Metadata } from 'next';
import { CatalogService } from '@/server/services/catalogService';
import { ShopContent } from '@/components/shop/ShopContent';

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
    color?: string;
    colour?: string;
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
      color: searchParams.color || searchParams.colour,
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
    <ShopContent
      categories={categories}
      products={result.products}
      total={result.total}
      totalPages={result.totalPages}
      currentPage={page}
      pageTitle={pageTitle}
      isNewArrival={isNewArrival}
    />
  );
}
