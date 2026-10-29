import React from 'react';
import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { BestSellersSection } from '@/components/home/BestSellersSection';
import { BogoSection } from '@/components/home/BogoSection';
import { DeliveryPolicyBanner } from '@/components/home/DeliveryPolicyBanner';
import { TrustSection } from '@/components/home/TrustSection';
import { BrandStorySection } from '@/components/home/BrandStorySection';
import { FaqSection } from '@/components/home/FaqSection';
import { InstagramGridSection } from '@/components/home/InstagramGridSection';
import { HomeAccessoriesSection } from '@/components/home/HomeAccessoriesSection';
import { TogetherInStyleSection } from '@/components/home/TogetherInStyleSection';
import { AveezOriginalsSection } from '@/components/home/AveezOriginalsSection';
import { CatalogService } from '@/server/services/catalogService';
import styles from './page.module.css';

export const revalidate = 60; // Incremental Static Regeneration every 60s

export async function generateMetadata(): Promise<Metadata> {
  const settings = await CatalogService.getSettings();
  const isDiwali = CatalogService.isSeasonalThemeActive(settings.seasonalTheme);

  return {
    title: isDiwali
      ? 'AVEEZ FASHION — इस दिवाली, अपना अंदाज़ बदलो | Luxury Festive Edit'
      : 'AVEEZ FASHION — Luxury Streetwear & Heavyweight Apparel',
    description: isDiwali
      ? 'Celebrate Diwali with AVEEZ FASHION. Discover handcrafted royal kurta sets, festive women’s ethnic wear, couple matching outfits, and 450 GSM architectural streetwear with Buy 1 Get 1 Free.'
      : 'Contemporary luxury streetwear, architectural boxy silhouettes, and 450 GSM heavyweight French terry essentials. Handcrafted in India.',
    alternates: {
      canonical: 'https://aveezfashion.com',
    },
    openGraph: {
      title: isDiwali
        ? 'AVEEZ FASHION — इस दिवाली, अपना अंदाज़ बदलो'
        : 'AVEEZ FASHION — Wear Different',
      description:
        'Celebrate the festive season in timeless style. Architectural silhouettes meet Indian festive craftsmanship.',
      url: 'https://aveezfashion.com',
      images: [
        {
          url: '/uploads/campaigns/diwali/diwali-edit-banner.webp',
          width: 1920,
          height: 1080,
          alt: 'AVEEZ FASHION Diwali Campaign',
        },
      ],
    },
  };
}

export default async function HomePage() {
  // Fetch real catalog data from database/service layer
  const [content, settings, categories, bestSellersData, accessoriesData, heroSlides] = await Promise.all([
    CatalogService.getHomepageContent(),
    CatalogService.getSettings(),
    CatalogService.getCategories(),
    CatalogService.getProducts({ isBestSeller: true, limit: 4 }),
    CatalogService.getAccessories({ limit: 8 }),
    CatalogService.getHeroSlides(),
  ]);

  const isDiwali = CatalogService.isSeasonalThemeActive(settings.seasonalTheme);

  // Structured Data (JSON-LD ItemList for Featured / Festive Products)
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: isDiwali ? 'AVEEZ FASHION — The Festive Collection' : 'AVEEZ FASHION — Popular Picks',
    itemListElement: bestSellersData.products.slice(0, 4).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        url: `https://aveezfashion.com/product/${product.slug}`,
        image: product.images?.[0]?.url || 'https://aveezfashion.com/brand/master-logo-black.png',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: product.salePrice || product.basePrice,
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return (
    <div className={styles.homeContainer}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* C. Compelling Diwali Campaign Hero */}
      <HeroSection
        slides={heroSlides.length > 0 ? heroSlides : undefined}
        seasonalTheme={isDiwali ? settings.seasonalTheme : undefined}
      />

      {/* D. Four Visual Shopping Categories (or 6 in Normal Mode) */}
      <CategoryGrid categories={categories} isDiwali={isDiwali} />

      {/* E. Best-Selling / Featured Festive Products */}
      <BestSellersSection products={bestSellersData.products} isFestive={isDiwali} />

      {/* F. Clear BUY 1, GET 1 FREE Offer Section with Explicit Terms */}
      <BogoSection code="DIWALIBOGO" ctaLink="/shop?filter=bogo" />

      {/* G. Free-Delivery Policy Banner */}
      <DeliveryPolicyBanner />

      {/* If Normal Mode, render Together In Style & Originals */}
      {!isDiwali && (
        <>
          <TogetherInStyleSection />
          <AveezOriginalsSection
            eyebrow="AVEEZ ORIGINALS — 01 / SIGNATURE COLLECTION"
            secondaryLabel="THE AVEEZ SIGNATURE"
            headline="NOT MADE TO BLEND IN."
            description="Distinctive style. Individual expression. A different point of view."
            image="/api/media/campaigns/signature.webp"
            ctaText="EXPLORE THE COLLECTION ↗"
            ctaLink={content.aveezOriginals?.ctaLink || '/collections/aveez-originals'}
          />
        </>
      )}

      {/* H. Verifiable Trust Section (Payments, 7-day returns, heavyweight quality, concierge support) */}
      <TrustSection />

      {/* I. Compact Brand Story */}
      <BrandStorySection
        title={content.brandStory.title}
        paragraphs={content.brandStory.paragraphs}
        ctaText={content.brandStory.ctaText}
        ctaLink={content.brandStory.ctaLink}
      />

      {/* I. Frequently Asked Questions */}
      <FaqSection />

      {/* I. Community & Styling Showcase */}
      <InstagramGridSection />

      {/* Curated Accessories Showcase — The Finishing Touch */}
      <HomeAccessoriesSection products={accessoriesData.products} />
    </div>
  );
}
