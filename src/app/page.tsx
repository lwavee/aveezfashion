import React from 'react';
import Link from 'next/link';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { AveezOriginalsSection } from '@/components/home/AveezOriginalsSection';
import { BrandStorySection } from '@/components/home/BrandStorySection';
import { WhyAveezSection } from '@/components/home/WhyAveezSection';
import { InstagramGridSection } from '@/components/home/InstagramGridSection';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { CatalogService } from '@/server/services/catalogService';
import styles from './page.module.css';

export const revalidate = 60; // Incremental Static Regeneration every 60s

export default async function HomePage() {
  // Fetch real catalog data from database/service layer
  const [content, categories, newArrivalsData, bestSellersData] = await Promise.all([
    CatalogService.getHomepageContent(),
    CatalogService.getCategories(),
    CatalogService.getProducts({ isNewArrival: true, limit: 4 }),
    CatalogService.getProducts({ isBestSeller: true, limit: 4 }),
  ]);

  return (
    <div className={styles.homeContainer}>
      {/* 3. Hero Section */}
      <HeroSection
        headline={content.hero.headline}
        subheadline={content.hero.subheadline}
        desktopImage={content.hero.desktopImage}
        mobileImage={content.hero.mobileImage}
        primaryCtaText={content.hero.primaryCtaText}
        primaryCtaLink={content.hero.primaryCtaLink}
        secondaryCtaText={content.hero.secondaryCtaText}
        secondaryCtaLink={content.hero.secondaryCtaLink}
      />

      {/* 4. New Arrivals Showcase */}
      <section className={`container ${styles.productSection}`} aria-label="New Arrivals">
        <div className={styles.sectionHeader}>
          <div className={styles.titleStack}>
            <span className={styles.sectionSub}>FRESH CUTS</span>
            <h2 className={styles.sectionHeading}>NEW ARRIVALS</h2>
          </div>
          <Link href="/shop?filter=new" className={styles.desktopViewAll}>
            <Button variant="ghost" size="sm">
              VIEW ALL (NEW) →
            </Button>
          </Link>
        </div>

        <div className={styles.productGrid}>
          {newArrivalsData.products.map((product, idx) => (
            <ProductCard key={product._id} product={product} priority={idx < 2} />
          ))}
        </div>

        <div className={styles.mobileViewAll}>
          <Link href="/shop?filter=new">
            <Button variant="outline" size="md" fullWidth>
              EXPLORE ALL NEW ARRIVALS
            </Button>
          </Link>
        </div>
      </section>

      {/* 5. Shop By Category */}
      <CategoryGrid categories={categories} />

      {/* 6. Aveez Originals Editorial */}
      <AveezOriginalsSection
        tagline={content.aveezOriginals.tagline}
        headline={content.aveezOriginals.headline}
        description={content.aveezOriginals.description}
        image={content.aveezOriginals.image}
        ctaText={content.aveezOriginals.ctaText}
        ctaLink={content.aveezOriginals.ctaLink}
      />

      {/* 7. Best Sellers */}
      <section className={`container ${styles.productSection}`} aria-label="Best Sellers">
        <div className={styles.sectionHeader}>
          <div className={styles.titleStack}>
            <span className={styles.sectionSub}>MOST WANTED</span>
            <h2 className={styles.sectionHeading}>BEST SELLERS</h2>
          </div>
          <Link href="/shop?filter=bestseller" className={styles.desktopViewAll}>
            <Button variant="ghost" size="sm">
              VIEW ALL (POPULAR) →
            </Button>
          </Link>
        </div>

        <div className={styles.productGrid}>
          {bestSellersData.products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className={styles.mobileViewAll}>
          <Link href="/shop?filter=bestseller">
            <Button variant="outline" size="md" fullWidth>
              EXPLORE ALL BEST SELLERS
            </Button>
          </Link>
        </div>
      </section>

      {/* 8. Brand Story */}
      <BrandStorySection
        title={content.brandStory.title}
        paragraphs={content.brandStory.paragraphs}
        ctaText={content.brandStory.ctaText}
        ctaLink={content.brandStory.ctaLink}
      />

      {/* 9. Why Aveez */}
      <WhyAveezSection />

      {/* 10. Instagram / Community Showcase */}
      <InstagramGridSection />
    </div>
  );
}
