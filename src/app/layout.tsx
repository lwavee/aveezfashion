import type { Metadata } from 'next';
import { Playfair_Display, Outfit, Inter } from 'next/font/google';
import '@/styles/tokens.css';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ToastProvider } from '@/components/ui/Toast';
import { StorefrontShell } from '@/components/layout/StorefrontShell';
import { CatalogService } from '@/server/services/catalogService';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aveezfashion.com'),
  title: {
    default: 'AVEEZ FASHION — Luxury Indian Ethnic & Heavyweight Streetwear',
    template: '%s | AVEEZ FASHION',
  },
  description:
    'Contemporary Indian festive fashion, royal kurta sets, architectural silhouettes, and 450 GSM heavyweight apparel. Handcrafted in India.',
  keywords: [
    'aveez fashion',
    'diwali festive wear',
    'indian ethnic wear',
    'men kurta pajama',
    'women festive wear',
    'couple matching outfits',
    'luxury streetwear india',
    'heavyweight hoodies',
    'oversized t-shirts',
  ],
  authors: [{ name: 'AVEEZ FASHION' }],
  creator: 'AVEEZ FASHION',
  alternates: {
    canonical: 'https://aveezfashion.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://aveezfashion.com',
    siteName: 'AVEEZ FASHION',
    title: 'AVEEZ FASHION — Wear Different | The Festive & Luxury Edit',
    description:
      'Contemporary Indian festive fashion, architectural silhouettes, and heavyweight essentials designed for individuality.',
    images: [
      {
        url: '/uploads/campaigns/diwali/diwali-edit-banner.webp',
        width: 1920,
        height: 1080,
        alt: 'AVEEZ FASHION Diwali Festive Campaign',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@aveezfashion',
    creator: '@aveezfashion',
  },
  icons: {
    icon: '/brand/av-monogram.svg',
    shortcut: '/brand/av-monogram.svg',
    apple: '/brand/av-monogram.svg',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [content, settings] = await Promise.all([
    CatalogService.getHomepageContent(),
    CatalogService.getSettings(),
  ]);

  const isDiwali = CatalogService.isSeasonalThemeActive(settings.seasonalTheme);

  const activeAnnouncement =
    isDiwali && settings.seasonalTheme?.announcementText
      ? {
          isActive: true,
          message: settings.seasonalTheme.announcementText,
          ctaText: settings.seasonalTheme.announcementCtaText || 'EXPLORE THE COLLECTION',
          ctaLink: settings.seasonalTheme.announcementCtaLink || '/shop?gender=MEN',
        }
      : content.announcementBar;

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://aveezfashion.com/#organization',
        name: 'AVEEZ FASHION',
        url: 'https://aveezfashion.com',
        logo: 'https://aveezfashion.com/brand/master-logo-black.png',
        sameAs: ['https://www.instagram.com/aveezfashion'],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'care@aveezfashion.com',
          contactType: 'customer service',
          areaServed: 'IN',
          availableLanguage: ['English', 'Hindi'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://aveezfashion.com/#website',
        url: 'https://aveezfashion.com',
        name: 'AVEEZ FASHION',
        publisher: {
          '@id': 'https://aveezfashion.com/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://aveezfashion.com/shop?search={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      data-theme={isDiwali ? 'diwali' : 'normal'}
      className={`${inter.variable} ${outfit.variable} ${playfair.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>
        <CartProvider isDiwali={isDiwali}>
          <WishlistProvider>
            <ToastProvider>
              <StorefrontShell
                announcementBar={activeAnnouncement}
                seasonalTheme={settings.seasonalTheme}
              >
                {children}
              </StorefrontShell>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
