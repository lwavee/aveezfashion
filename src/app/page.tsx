import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { NewArrivalsSection } from '@/components/home/NewArrivalsSection';
import { TogetherInStyleSection } from '@/components/home/TogetherInStyleSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { HomeAccessoriesSection } from '@/components/home/HomeAccessoriesSection';
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
  const [content, settings, categories, newArrivalsData, bestSellersData, accessoriesData] = await Promise.all([
    CatalogService.getHomepageContent(),
    CatalogService.getSettings(),
    CatalogService.getCategories(),
    CatalogService.getProducts({ isNewArrival: true, limit: 8 }),
    CatalogService.getProducts({ isBestSeller: true, limit: 4 }),
    CatalogService.getAccessories({ limit: 12 }),
  ]);

  const isDiwali = CatalogService.isSeasonalThemeActive(settings.seasonalTheme);

  return (
    <div className={styles.homeContainer}>
      {/* 1. Hero Section Slider */}
      <HeroSection seasonalTheme={isDiwali ? settings.seasonalTheme : undefined} />

      {/* 2. Shop By Category (Immediate visual category discovery) */}
      <CategoryGrid categories={categories} />

      {/* 3. New Arrivals Showcase */}
      <NewArrivalsSection products={newArrivalsData.products} />

      {/* 4. Together in Style — Men × Women Matching Styles */}
      <TogetherInStyleSection />

      {/* 5. Aveez Originals Editorial */}
      <AveezOriginalsSection
        eyebrow="AVEEZ ORIGINALS — 01 / SIGNATURE COLLECTION"
        secondaryLabel="THE AVEEZ SIGNATURE"
        headline="NOT MADE TO BLEND IN."
        description="Distinctive style. Individual expression. A different point of view."
        image="/images/signature.png"
        ctaText="EXPLORE THE COLLECTION ↗"
        ctaLink={content.aveezOriginals?.ctaLink || '/collections/aveez-originals'}
      />

      {/* 6. Popular Picks */}
      <BestSellersSection products={bestSellersData.products} />

      {/* 7. Brand Story */}
      <BrandStorySection
        title={content.brandStory.title}
        paragraphs={content.brandStory.paragraphs}
        ctaText={content.brandStory.ctaText}
        ctaLink={content.brandStory.ctaLink}
      />

      {/* 8. Why Aveez */}
      <WhyAveezSection />

      {/* 9. Community & Editorial — As Seen on the Street */}
      <InstagramGridSection />

      {/* 10. Accessories Showcase — The Finishing Touch (In last, before footer) */}
      <HomeAccessoriesSection products={accessoriesData.products} />
    </div>
  );
}
