import React from 'react';
import { Metadata } from 'next';
import { CatalogService } from '@/server/services/catalogService';
import { AccessoriesContent } from '@/components/accessories/AccessoriesContent';

export const dynamic = 'force-dynamic';

interface AccessoriesPageProps {
  searchParams: {
    category?: string;
    sort?: string;
    page?: string;
  };
}

export async function generateMetadata({ searchParams }: AccessoriesPageProps): Promise<Metadata> {
  const activeCategory = searchParams.category;
  const categoryTitle =
    activeCategory && activeCategory !== 'all'
      ? `${activeCategory.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} — `
      : '';

  return {
    title: `${categoryTitle}The Finishing Touch — Accessories Collection | AVEEZ FASHION`,
    description:
      'Explore handcrafted floral headbands, minimalist hair clips, sculpted claw clips, and matching styling sets. Accessories engineered to bring your look together.',
    alternates: {
      canonical: `https://aveezfashion.com/accessories${
        activeCategory && activeCategory !== 'all' ? `?category=${activeCategory}` : ''
      }`,
    },
    openGraph: {
      title: 'The Finishing Touch — Accessories Collection | AVEEZ FASHION',
      description:
        'Accessories that bring your look together. Handcrafted floral hairbands, clips, and styling charms.',
      url: 'https://aveezfashion.com/accessories',
      type: 'website',
    },
  };
}

export default async function AccessoriesPage({ searchParams }: AccessoriesPageProps) {
  const page = parseInt(searchParams.page || '1', 10);
  const activeCategory = searchParams.category || '';
  const activeSort = searchParams.sort || '';

  const result = await CatalogService.getAccessories({
    categorySlug: activeCategory,
    sort: activeSort,
    page,
    limit: 16,
  });

  return (
    <AccessoriesContent
      products={result.products}
      total={result.total}
      totalPages={result.totalPages}
      currentPage={page}
      activeCategory={activeCategory}
      activeSort={activeSort}
    />
  );
}
