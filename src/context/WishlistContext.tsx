'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistContextType {
  wishlistSlugs: string[];
  toggleWishlist: (productSlug: string) => void;
  isInWishlist: (productSlug: string) => boolean;
  totalWishlist: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aveez_wishlist');
      if (stored) {
        setWishlistSlugs(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('aveez_wishlist', JSON.stringify(wishlistSlugs));
    }
  }, [wishlistSlugs, mounted]);

  const toggleWishlist = (slug: string) => {
    setWishlistSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const isInWishlist = (slug: string) => wishlistSlugs.includes(slug);

  return (
    <WishlistContext.Provider
      value={{
        wishlistSlugs,
        toggleWishlist,
        isInWishlist,
        totalWishlist: wishlistSlugs.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
