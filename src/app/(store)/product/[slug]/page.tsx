import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { ProductCard } from '@/components/product/ProductCard';
import { CompleteTheLookSection } from '@/components/accessories/CompleteTheLookSection';
import { CatalogService } from '@/server/services/catalogService';
import styles from './product.module.css';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await CatalogService.getProductBySlug(params.slug);
  if (!product) {
    return { title: 'Piece Not Found | AVEEZ FASHION' };
  }

  const primaryImage = product.images[0]?.url;

  return {
    title: `${product.title} — Premium ${product.attributes?.fabric || 'Apparel'}`,
    description: product.description.slice(0, 160),
    alternates: {
      canonical: `https://aveezfashion.com/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.title} | AVEEZ FASHION`,
      description: product.description.slice(0, 160),
      url: `https://aveezfashion.com/product/${product.slug}`,
      images: primaryImage
        ? [
            {
              url: primaryImage,
              width: 1200,
              height: 1600,
              alt: product.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await CatalogService.getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  // Fetch related products for "You May Also Like"
  const [relatedResult, completeTheLookItems] = await Promise.all([
    CatalogService.getProducts({
      gender: product.gender,
      limit: 4,
    }),
    CatalogService.getCompleteTheLook(product, 4),
  ]);
  const relatedProducts = relatedResult.products.filter((p) => p._id !== product._id);

  const isAccessory = Boolean(
    product.tags?.some((t) =>
      [
        'accessories',
        'hairband',
        'hairbands',
        'hair-clip',
        'hair-clips',
        'claw-clip',
        'claw-clips',
        'keychain',
        'keychains',
        'bag-charm',
        'bag-charms',
        'matching-sets',
      ].includes(t.toLowerCase())
    )
  );

  // Structured Data (JSON-LD) for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: product.images.map((img) => img.url),
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'AVEEZ FASHION',
    },
    offers: {
      '@type': 'Offer',
      url: `https://aveezfashion.com/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.salePrice || product.basePrice,
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'AVEEZ FASHION',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.totalReviews || 1,
    },
  };

  return (
    <div className={`container ${styles.pageWrapper}`}>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">HOME</Link>
        <span className={styles.slash}>/</span>
        {isAccessory ? (
          <>
            <Link href="/accessories">ACCESSORIES</Link>
            <span className={styles.slash}>/</span>
          </>
        ) : (
          <>
            <Link href="/shop">SHOP</Link>
            <span className={styles.slash}>/</span>
            <Link href={`/shop?gender=${product.gender}`}>{product.gender}</Link>
            <span className={styles.slash}>/</span>
          </>
        )}
        <span className={styles.current}>{product.title.toUpperCase()}</span>
      </nav>

      {/* Main Interactive Product View */}
      <ProductDetailView product={product} relatedProducts={relatedProducts} />

      {/* Complete The Look Section */}
      <CompleteTheLookSection
        parentProduct={product}
        recommendedItems={completeTheLookItems}
        isAccessoryView={isAccessory}
      />

      {/* "You May Also Like" / Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection} aria-label="Related Products">
          <div className={styles.relatedHeader}>
            <span className={styles.relatedSub}>CURATED PAIRINGS</span>
            <h2 className={styles.relatedTitle}>YOU MAY ALSO LIKE</h2>
          </div>
          <div className={styles.relatedGrid}>
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
