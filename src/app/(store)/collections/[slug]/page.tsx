import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ProductCard } from '@/components/product/ProductCard';
import { CatalogService } from '@/server/services/catalogService';

interface CollectionPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const collections = await CatalogService.getCollections();
  const collection = collections.find((c) => c.slug === params.slug);

  if (!collection) {
    return { title: 'Collection Not Found | AVEEZ FASHION' };
  }

  return {
    title: `${collection.title} — Curated Lookbook Capsule`,
    description: collection.description || collection.tagline,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const [collections, productsData] = await Promise.all([
    CatalogService.getCollections(),
    CatalogService.getProducts({ isAveezOriginal: true, limit: 12 }),
  ]);

  const collection = collections.find((c) => c.slug === params.slug);
  if (!collection) {
    notFound();
  }

  return (
    <div>
      {/* Editorial Hero Banner */}
      <section
        style={{
          position: 'relative',
          height: '55vh',
          minHeight: '420px',
          backgroundColor: 'var(--color-black-pure)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 var(--container-padding)',
        }}
      >
        <Image
          src={collection.coverImage}
          alt={collection.title}
          fill
          priority
          style={{ objectFit: 'cover', opacity: 0.4 }}
        />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '780px' }}>
          <span
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--font-size-micro)',
              fontWeight: 600,
              letterSpacing: 'var(--letter-spacing-widest)',
              color: 'var(--color-gray-300)',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 8,
            }}
          >
            {collection.tagline || 'CURATED CAPSULE'}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--font-size-hero)',
              color: 'var(--color-white-pure)',
              letterSpacing: 'var(--letter-spacing-tight)',
              marginBottom: 16,
            }}
          >
            {collection.title.toUpperCase()}
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-body-md)',
              color: 'var(--color-gray-200)',
              lineHeight: '1.6',
            }}
          >
            {collection.description}
          </p>
        </div>
      </section>

      {/* Capsule Product Grid */}
      <section className="container" style={{ padding: 'var(--space-3xl) var(--container-padding) var(--space-4xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-gray-200)', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-gray-500)', letterSpacing: 'var(--letter-spacing-widest)', textTransform: 'uppercase' }}>
              COLLECTIONS / {collection.title.toUpperCase()}
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-family-body)',
                fontSize: 'var(--font-size-caption)',
                fontWeight: 'bold',
                letterSpacing: 'var(--letter-spacing-widest)',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              PIECES IN THIS CAPSULE ({productsData.products.length})
            </h2>
          </div>
        </div>

        <div className="aveezProductGrid">
          {productsData.products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
