import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { NewArrivalsSection } from '@/components/home/NewArrivalsSection';
import { TogetherInStyleSection } from '@/components/home/TogetherInStyleSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { AveezOriginalsSection } from '@/components/home/AveezOriginalsSection';
import { BestSellersSection } from '@/components/home/BestSellersSection';
import { BrandStorySection } from '@/components/home/BrandStorySection';
import { WhyAveezSection } from '@/components/home/WhyAveezSection';
import { InstagramGridSection } from '@/components/home/InstagramGridSection';
import { CatalogService } from '@/server/services/catalogService';
import styles from './page.module.css';

export const revalidate = 60; // Incremental Static Regeneration every 60s

export default async function HomePage() {
  // Fetch real catalog data from database/service layer
  const [content, categories, newArrivalsData, bestSellersData] = await Promise.all([
    CatalogService.getHomepageContent(),
    CatalogService.getCategories(),
    CatalogService.getProducts({ isNewArrival: true, limit: 8 }),
    CatalogService.getProducts({ isBestSeller: true, limit: 4 }),
  ]);

  return (
    <div className={styles.homeContainer}>
      {/* 3. Hero Section Slider */}
      <HeroSection />

      {/* 4. New Arrivals Showcase */}
      <NewArrivalsSection products={newArrivalsData.products} />

      {/* 4.5 Together in Style — Men × Women Matching Styles */}
      <TogetherInStyleSection />

      {/* 5. Shop By Category */}
      <CategoryGrid categories={categories} />

      {/* 6. Aveez Originals Editorial */}
      <AveezOriginalsSection
        eyebrow="AVEEZ ORIGINALS — 01 / SIGNATURE COLLECTION"
        secondaryLabel="THE AVEEZ SIGNATURE"
        headline="NOT MADE TO BLEND IN."
        description="Distinctive style. Individual expression. A different point of view."
        image="/images/signature.png"
        ctaText="EXPLORE THE COLLECTION ↗"
        ctaLink={content.aveezOriginals?.ctaLink || '/collections/aveez-originals'}
      />

      {/* 7. Best Sellers */}
      <BestSellersSection products={bestSellersData.products} />

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
