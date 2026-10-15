'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

interface StorefrontShellProps {
  children: React.ReactNode;
  announcementBar?: {
    isActive: boolean;
    message: string;
    ctaText?: string;
    ctaLink?: string;
  };
}

/**
 * StorefrontShell manages public customer-facing chrome.
 * On every administrative route (/admin and /admin/*), it completely omits
 * public announcement bars, navigation bars, customer search/bag icons,
 * storefront footers, and shopping drawers.
 */
export const StorefrontShell: React.FC<StorefrontShellProps> = ({
  children,
  announcementBar,
}) => {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // Completely isolate admin routes from public storefront chrome
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {announcementBar?.isActive && (
        <AnnouncementBar
          message={announcementBar.message}
          ctaText={announcementBar.ctaLink ? announcementBar.ctaText : undefined}
          ctaLink={announcementBar.ctaLink}
        />
      )}
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
};
