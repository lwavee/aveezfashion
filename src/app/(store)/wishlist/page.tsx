'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/Button';

export default function WishlistPage() {
  const { wishlistSlugs, totalWishlist } = useWishlist();

  if (totalWishlist === 0) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 'var(--space-4xl) var(--container-padding)',
          gap: 'var(--space-sm)',
        }}
      >
        <Heart size={44} strokeWidth={1} color="var(--color-gray-400)" />
        <h1
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'var(--font-size-h2)',
            letterSpacing: 'var(--letter-spacing-tight)',
            marginTop: 'var(--space-xs)',
          }}
        >
          YOUR WISHLIST IS EMPTY
        </h1>
        <p
          style={{
            color: 'var(--color-gray-500)',
            maxWidth: '440px',
            fontSize: 'var(--font-size-body-sm)',
            marginBottom: 'var(--space-xl)',
          }}
        >
          Save pieces you love while browsing to keep track of seasonal drops and capsule releases.
        </p>
        <Link href="/shop">
          <Button variant="primary" size="lg">
            EXPLORE THE SHOP
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-3xl) var(--container-padding)' }}>
      <div style={{ borderBottom: '1px solid var(--color-gray-200)', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
        <h1 style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--font-size-h2)', letterSpacing: 'var(--letter-spacing-tight)' }}>
          SAVED PIECES ({totalWishlist})
        </h1>
      </div>

      <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-body-sm)', marginBottom: 'var(--space-xl)' }}>
        You have {totalWishlist} saved item(s) in your personal wishlist. Click below to view and add to bag.
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
        <Link href="/shop">
          <Button variant="primary" size="md">
            <span>CONTINUE SHOPPING</span>
            <ArrowRight size={16} style={{ marginLeft: 6 }} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
