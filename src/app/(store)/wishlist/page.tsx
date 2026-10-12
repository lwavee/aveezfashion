'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';

export default function WishlistPage() {
  const { wishlistSlugs, totalWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch('/api/products?limit=50');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data?.products)) {
            setProducts(json.data.products);
          }
        }
      } catch {
        // error handling
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const savedProducts = products.filter((p) => wishlistSlugs.includes(p.slug));

  if (!loading && totalWishlist === 0) {
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
          Save pieces you love while browsing to keep track of seasonal drops, capsule releases, and tailored silhouettes.
        </p>
        <Link href="/shop">
          <Button variant="primary" size="lg">
            EXPLORE THE CATALOG
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-3xl) var(--container-padding) 5rem' }}>
      <div
        style={{
          borderBottom: '1px solid var(--color-gray-200)',
          paddingBottom: 'var(--space-md)',
          marginBottom: 'var(--space-2xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--font-size-h2)',
              letterSpacing: 'var(--letter-spacing-tight)',
              margin: 0,
            }}
          >
            SAVED PIECES ({totalWishlist})
          </h1>
          <p
            style={{
              color: 'var(--color-gray-500)',
              fontSize: 'var(--font-size-body-sm)',
              marginTop: '4px',
              margin: 0,
            }}
          >
            Curated personal selection. Add directly to bag with instant size selection.
          </p>
        </div>

        <Link href="/shop">
          <Button variant="outline" size="sm">
            <span>CONTINUE SHOPPING</span>
            <ArrowRight size={14} style={{ marginLeft: 6 }} />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
          Loading saved products...
        </div>
      ) : savedProducts.length === 0 && totalWishlist > 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>
          Syncing saved pieces with current atelier catalog...
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          {savedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
