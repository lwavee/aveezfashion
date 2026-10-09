'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import styles from './Navbar.module.css';

function NavbarContent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pathname = usePathname();
  const searchParams = useSearchParams();
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

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Active state calculations
  const filterParam = searchParams?.get('filter');
  const genderParam = searchParams?.get('gender');
  const collectionParam = searchParams?.get('collection');

  const isHome = pathname === '/';
  const isShop = pathname === '/shop';

  const isNewArrivalsActive =
    !isHome && (filterParam === 'new' || pathname.startsWith('/collections/new'));
  const isWomenActive =
    !isHome && (genderParam === 'WOMEN' || pathname.startsWith('/collections/women'));
  const isMenActive =
    !isHome && (genderParam === 'MEN' || pathname.startsWith('/collections/men'));
  const isOriginalsActive =
    !isHome &&
    (pathname.startsWith('/collections/aveez-originals') ||
      collectionParam === 'aveez-originals' ||
      collectionParam === 'originals');
  const isShopAllActive =
    !isHome && isShop && !filterParam && !genderParam && !collectionParam;
  const isSaleActive =
    !isHome &&
    (filterParam === 'sale' ||
      pathname.startsWith('/collections/sale') ||
      pathname.startsWith('/sale'));

  return (
    <>
      <header
        className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}
        role="banner"
      >
        <div className={`container ${styles.navContainer}`}>
          {/* Left Column: Mobile Menu & Logo */}
          <div className={styles.logoCol}>
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>

            <Link href="/" className={styles.logoLink} aria-label="Aveez Fashion Home">
              <Logo variant="primary" theme="black" height={46} />
            </Link>
          </div>

          {/* Center Column: Desktop Navigation */}
          <nav className={styles.desktopNav} role="navigation" aria-label="Main Navigation">
            <Link
              href="/shop?filter=new"
              className={`${styles.navLink} ${isNewArrivalsActive ? styles.active : ''}`}
            >
              NEW ARRIVALS
            </Link>
            <Link
              href="/shop?gender=WOMEN"
              className={`${styles.navLink} ${isWomenActive ? styles.active : ''}`}
            >
              WOMEN
            </Link>
            <Link
              href="/shop?gender=MEN"
              className={`${styles.navLink} ${isMenActive ? styles.active : ''}`}
            >
              MEN
            </Link>
            <Link
              href="/collections/aveez-originals"
              className={`${styles.navLink} ${styles.originalsLink} ${
                isOriginalsActive ? styles.active : ''
              }`}
            >
              AVEEZ ORIGINALS
            </Link>
            <Link
              href="/shop"
              className={`${styles.navLink} ${isShopAllActive ? styles.active : ''}`}
            >
              SHOP ALL
            </Link>
            <Link
              href="/shop?filter=sale"
              className={`${styles.navLink} ${styles.saleLink} ${
                isSaleActive ? styles.active : ''
              }`}
            >
              SALE
            </Link>
          </nav>

          {/* Right Column: Action Icons */}
          <div className={styles.actionIcons}>
            <button
              className={styles.iconBtn}
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Search Catalog"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            <Link href="/account" className={styles.iconBtn} aria-label="Customer Account">
              <User size={20} strokeWidth={1.5} />
            </Link>

            <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
              <Heart size={20} strokeWidth={1.5} />
              {totalWishlist > 0 && (
                <span className={styles.badge} aria-label={`${totalWishlist} items in wishlist`}>
                  {totalWishlist}
                </span>
              )}
            </Link>

            <button
              className={styles.iconBtn}
              onClick={openCart}
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
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
              <Logo variant="primary" theme="black" height={40} />
              <button
                className={styles.closeBtn}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Menu"
              >
                <X size={22} />
              </button>
            </div>

            <nav className={styles.mobileNavLinks}>
              <Link
                href="/shop?filter=new"
                className={`${styles.mobileNavLink} ${isNewArrivalsActive ? styles.active : ''}`}
              >
                NEW ARRIVALS
              </Link>
              <Link
                href="/shop?gender=WOMEN"
                className={`${styles.mobileNavLink} ${isWomenActive ? styles.active : ''}`}
              >
                WOMEN
              </Link>
              <Link
                href="/shop?gender=MEN"
                className={`${styles.mobileNavLink} ${isMenActive ? styles.active : ''}`}
              >
                MEN
              </Link>
              <Link
                href="/collections/aveez-originals"
                className={`${styles.mobileNavLink} ${styles.originalsLink} ${
                  isOriginalsActive ? styles.active : ''
                }`}
              >
                AVEEZ ORIGINALS
              </Link>
              <Link
                href="/shop"
                className={`${styles.mobileNavLink} ${isShopAllActive ? styles.active : ''}`}
              >
                SHOP ALL
              </Link>
              <Link
                href="/shop?filter=sale"
                className={`${styles.mobileNavLink} ${styles.saleLink} ${
                  isSaleActive ? styles.active : ''
                }`}
              >
                SALE
              </Link>
            </nav>

            <div className={styles.mobileFooter}>
              <Link href="/account" className={styles.mobileFooterLink}>
                ACCOUNT
              </Link>
              <Link href="/wishlist" className={styles.mobileFooterLink}>
                WISHLIST {totalWishlist > 0 ? `(${totalWishlist})` : ''}
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
}

export const Navbar: React.FC = () => {
  return (
    <Suspense
      fallback={
        <header className={styles.navbar} role="banner">
          <div className={`container ${styles.navContainer}`}>
            <div className={styles.logoCol}>
              <Link href="/" className={styles.logoLink} aria-label="Aveez Fashion Home">
                <Logo variant="primary" theme="black" height={46} />
              </Link>
            </div>
            <nav className={styles.desktopNav} role="navigation" aria-label="Main Navigation">
              <span className={styles.navLink}>NEW ARRIVALS</span>
              <span className={styles.navLink}>WOMEN</span>
              <span className={styles.navLink}>MEN</span>
              <span className={`${styles.navLink} ${styles.originalsLink}`}>AVEEZ ORIGINALS</span>
              <span className={styles.navLink}>SHOP ALL</span>
              <span className={`${styles.navLink} ${styles.saleLink}`}>SALE</span>
            </nav>
            <div className={styles.actionIcons} />
          </div>
        </header>
      }
    >
      <NavbarContent />
    </Suspense>
  );
};
