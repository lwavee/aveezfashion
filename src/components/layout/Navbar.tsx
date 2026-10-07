'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { totalWishlist } = useWishlist();

  // Scroll listener for sticky compact header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header
        className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}
        role="banner"
      >
        <div className={`container ${styles.navContainer}`}>
          {/* Mobile Hamburger Button */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>

          {/* Brand Logo */}
          <Link href="/" className={styles.logoLink} aria-label="Aveez Fashion Home">
            <Logo variant="horizontal" theme="black" height={32} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className={styles.desktopNav} role="navigation" aria-label="Main Navigation">
            <Link
              href="/shop?filter=new"
              className={`${styles.navLink} ${pathname.includes('filter=new') ? styles.active : ''}`}
            >
              NEW ARRIVALS
            </Link>
            <Link
              href="/shop?gender=MEN"
              className={`${styles.navLink} ${pathname.includes('gender=MEN') ? styles.active : ''}`}
            >
              MEN
            </Link>
            <Link
              href="/shop?gender=WOMEN"
              className={`${styles.navLink} ${pathname.includes('gender=WOMEN') ? styles.active : ''}`}
            >
              WOMEN
            </Link>
            <Link
              href="/collections/aveez-originals"
              className={`${styles.navLink} ${pathname.includes('aveez-originals') ? styles.active : ''}`}
            >
              AVEEZ ORIGINALS
            </Link>
            <Link
              href="/shop"
              className={`${styles.navLink} ${pathname === '/shop' ? styles.active : ''}`}
            >
              SHOP ALL
            </Link>
            <Link
              href="/shop?filter=sale"
              className={`${styles.navLink} ${styles.saleLink}`}
            >
              SALE
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className={styles.actionIcons}>
            {/* Search Trigger */}
            <button
              className={styles.iconBtn}
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Search Catalog"
            >
              <Search size={21} strokeWidth={1.5} />
            </button>

            {/* Customer Account */}
            <Link href="/account" className={styles.iconBtn} aria-label="Customer Account">
              <User size={21} strokeWidth={1.5} />
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
              <Heart size={21} strokeWidth={1.5} />
              {totalWishlist > 0 && (
                <span className={styles.badge} aria-label={`${totalWishlist} items in wishlist`}>
                  {totalWishlist}
                </span>
              )}
            </Link>

            {/* Shopping Bag / Cart Drawer */}
            <button
              className={styles.iconBtn}
              onClick={openCart}
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={21} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className={styles.badge} aria-label={`${totalItems} items in bag`}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar Flyout */}
        {searchOpen && (
          <div className={styles.searchFlyout}>
            <div className={`container ${styles.searchContainer}`}>
              <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                <Search size={20} className={styles.searchFormIcon} />
                <input
                  type="text"
                  placeholder="SEARCH HOODIES, TEES, OVERSIZED, TROUSERS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className={styles.searchInput}
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className={styles.searchCloseBtn}
                  aria-label="Close Search"
                >
                  <X size={20} />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)}>
          <aside
            className={styles.mobileDrawer}
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile Navigation"
          >
            <div className={styles.mobileDrawerHeader}>
              <Logo variant="monogram" height={32} />
              <button
                className={styles.closeBtn}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Menu"
              >
                <X size={24} />
              </button>
            </div>

            <nav className={styles.mobileNavLinks}>
              <Link href="/shop?filter=new" className={styles.mobileNavLink}>
                NEW ARRIVALS
              </Link>
              <Link href="/shop?gender=MEN" className={styles.mobileNavLink}>
                MEN
              </Link>
              <Link href="/shop?gender=WOMEN" className={styles.mobileNavLink}>
                WOMEN
              </Link>
              <Link href="/collections/aveez-originals" className={styles.mobileNavLink}>
                AVEEZ ORIGINALS
              </Link>
              <Link href="/shop" className={styles.mobileNavLink}>
                SHOP ALL
              </Link>
              <Link href="/shop?filter=sale" className={`${styles.mobileNavLink} ${styles.saleLink}`}>
                SALE
              </Link>
            </nav>

            <div className={styles.mobileFooter}>
              <Link href="/account" className={styles.mobileFooterLink}>
                ACCOUNT
              </Link>
              <Link href="/wishlist" className={styles.mobileFooterLink}>
                WISHLIST ({totalWishlist})
              </Link>
              <Link href="/about" className={styles.mobileFooterLink}>
                OUR STORY
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
