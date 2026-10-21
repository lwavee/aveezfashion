import type { Metadata } from 'next';
import '@/styles/tokens.css';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ToastProvider } from '@/components/ui/Toast';
import { StorefrontShell } from '@/components/layout/StorefrontShell';
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <StorefrontShell announcementBar={content.announcementBar}>
                {children}
              </StorefrontShell>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
