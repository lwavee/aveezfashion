import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ToastProvider } from '@/components/ui/Toast';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CatalogService } from '@/server/services/catalogService';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aveezfashion.com'),
  title: {
    default: 'AVEEZ FASHION — Luxury Streetwear & Heavyweight Apparel',
    template: '%s | AVEEZ FASHION',
  },
  description:
    'Contemporary luxury streetwear, architectural boxy silhouettes, and 450 GSM heavyweight French terry essentials. Handcrafted in India.',
  keywords: [
    'aveez fashion',
    'luxury streetwear',
    'heavyweight hoodies',
    'oversized t-shirts',
    'indian streetwear brand',
    'minimalist fashion',
  ],
  authors: [{ name: 'AVEEZ FASHION' }],
  creator: 'AVEEZ FASHION',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://aveezfashion.com',
    siteName: 'AVEEZ FASHION',
    title: 'AVEEZ FASHION — Wear Different',
    description:
      'Contemporary luxury streetwear, architectural silhouettes, and heavyweight essentials designed for individuality.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'AVEEZ FASHION Editorial Campaign',
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
  const content = await CatalogService.getHomepageContent();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              {content.announcementBar?.isActive && (
                <AnnouncementBar
                  message={content.announcementBar.message}
                  ctaText={content.announcementBar.ctaLink ? content.announcementBar.ctaText : undefined}
                  ctaLink={content.announcementBar.ctaLink}
                />
              )}
              <Navbar />
              <main id="main-content">{children}</main>
              <Footer />
              <CartDrawer />
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
