'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronRight, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { SearchModal } from './SearchModal';
import styles from './Navbar.module.css';

interface NavbarProps {
  isDiwali?: boolean;
}

function NavbarContent({ isDiwali }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'women' | 'men' | 'accessories' | null>(null);
  const [mobileWomenOpen, setMobileWomenOpen] = useState(false);
  const [mobileMenOpen, setMobileMenOpen] = useState(false);
  const [mobileAccessoriesOpen, setMobileAccessoriesOpen] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { totalItems, openCart } = useCart();
  const { totalWishlist } = useWishlist();

  // Scroll listener for compact sticky header
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
    setActiveDropdown(null);
  }, [pathname, searchParams]);

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
  const isAccessoriesActive =
    !isHome && (pathname === '/accessories' || pathname.startsWith('/accessories'));
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
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <div className={`container ${styles.navContainer}`}>
          {/* Left Column: Mobile Menu Trigger & Logo */}
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

          {/* Center Column: Desktop Navigation with Mega-Menu Dropdowns */}
          <nav className={styles.desktopNav} role="navigation" aria-label="Main Navigation">
            {isDiwali && (
              <Link
                href="/shop?tag=festive"
                className={`${styles.navLink} ${styles.festiveLink} ${
                  pathname.includes('festive') || searchParams?.get('tag') === 'festive'
                    ? styles.active
                    : ''
                }`}
              >
                FESTIVE COLLECTION
              </Link>
            )}
            <Link
              href="/shop"
              className={`${styles.navLink} ${isShopAllActive ? styles.active : ''}`}
            >
              SHOP
            </Link>

            {/* Women with Dropdown */}
            <div
              className={styles.navItemWithDropdown}
              onMouseEnter={() => setActiveDropdown('women')}
            >
              <Link
                href="/shop?gender=WOMEN"
                className={`${styles.navLink} ${isWomenActive ? styles.active : ''}`}
              >
                WOMEN
              </Link>

              {activeDropdown === 'women' && (
                <div className={styles.megaDropdown} role="menu">
                  <div className={styles.megaDropdownContent}>
                    <div className={styles.dropdownCol}>
                      <span className={styles.dropdownColTitle}>CATEGORIES</span>
                      <Link href="/shop?gender=WOMEN&category=oversized-tees" className={styles.dropdownLink}>
                        Oversized Tees
                      </Link>
                      <Link href="/shop?gender=WOMEN&category=hoodies" className={styles.dropdownLink}>
                        Luxury Heavyweight Hoodies
                      </Link>
                      <Link href="/shop?gender=WOMEN&category=bottoms" className={styles.dropdownLink}>
                        Tailored Trousers & Bottoms
                      </Link>
                      <Link href="/shop?gender=WOMEN" className={styles.dropdownLinkViewAll}>
                        View All Women&apos;s Collection →
                      </Link>
                    </div>
                    <div className={styles.dropdownFeaturedCol}>
                      <span className={styles.dropdownColTitle}>CURATED EDIT</span>
                      <p className={styles.dropdownFeaturedDesc}>
                        Relaxed architectural cuts engineered in premium natural cottons.
                      </p>
                      <Link href="/shop?gender=WOMEN" className={styles.dropdownFeaturedCta}>
                        EXPLORE WOMEN&apos;S DROP ↗
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Men with Dropdown */}
            <div
              className={styles.navItemWithDropdown}
              onMouseEnter={() => setActiveDropdown('men')}
            >
              <Link
                href="/shop?gender=MEN"
                className={`${styles.navLink} ${isMenActive ? styles.active : ''}`}
              >
                MEN
              </Link>

              {activeDropdown === 'men' && (
                <div className={styles.megaDropdown} role="menu">
                  <div className={styles.megaDropdownContent}>
                    <div className={styles.dropdownCol}>
                      <span className={styles.dropdownColTitle}>CATEGORIES</span>
                      <Link href="/shop?gender=MEN&category=hoodies" className={styles.dropdownLink}>
                        450 GSM Heavyweight Hoodies
                      </Link>
                      <Link href="/shop?gender=MEN&category=oversized-tees" className={styles.dropdownLink}>
                        280 GSM Boxy Tees
                      </Link>
                      <Link href="/shop?gender=MEN&category=bottoms" className={styles.dropdownLink}>
                        Wide-Leg Pleated Trousers
                      </Link>
                      <Link href="/shop?gender=MEN&category=shirts" className={styles.dropdownLink}>
                        Resort Cuban Collar Shirts
                      </Link>
                      <Link href="/shop?gender=MEN" className={styles.dropdownLinkViewAll}>
                        View All Men&apos;s Collection →
                      </Link>
                    </div>
                    <div className={styles.dropdownFeaturedCol}>
                      <span className={styles.dropdownColTitle}>CURATED EDIT</span>
                      <p className={styles.dropdownFeaturedDesc}>
                        Heavyweight streetwear designed with boxy proportions and seamless drapes.
                      </p>
                      <Link href="/shop?gender=MEN" className={styles.dropdownFeaturedCta}>
                        EXPLORE MEN&apos;S DROP ↗
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accessories with Dropdown */}
            <div
              className={styles.navItemWithDropdown}
              onMouseEnter={() => setActiveDropdown('accessories')}
            >
              <Link
                href="/accessories"
                className={`${styles.navLink} ${isAccessoriesActive ? styles.active : ''}`}
              >
                ACCESSORIES
              </Link>

              {activeDropdown === 'accessories' && (
                <div className={styles.megaDropdown} role="menu">
                  <div className={styles.megaDropdownContent}>
                    <div className={styles.dropdownCol}>
                      <span className={styles.dropdownColTitle}>COLLECTIONS</span>
                      <Link href="/accessories?category=hairbands" className={styles.dropdownLink}>
                        Handmade Hairbands
                      </Link>
                      <Link href="/accessories?category=hair-clips" className={styles.dropdownLink}>
                        Floral & Minimal Hair Clips
                      </Link>
                      <Link href="/accessories?category=claw-clips" className={styles.dropdownLink}>
                        Sculpted Claw Clips
                      </Link>
                      <Link href="/accessories?category=keychains" className={styles.dropdownLink}>
                        Handmade Keychains
                      </Link>
                      <Link href="/accessories?category=bag-charms" className={styles.dropdownLink}>
                        Everyday Bag Charms
                      </Link>
                      <Link href="/accessories?category=matching-sets" className={styles.dropdownLink}>
                        Matching Sets
                      </Link>
                      <Link href="/accessories" className={styles.dropdownLinkViewAll}>
                        View All Accessories →
                      </Link>
                    </div>
                    <div className={styles.dropdownFeaturedCol}>
                      <span className={styles.dropdownColTitle}>THE FINISHING TOUCH</span>
                      <p className={styles.dropdownFeaturedDesc}>
                        Artisan floral headbands, sculpted clips, and styling charms handcrafted to complete the look.
                      </p>
                      <Link href="/accessories" className={styles.dropdownFeaturedCta}>
                        EXPLORE ACCESSORIES ↗
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

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

          {/* Right Column: Search, Account, Wishlist, Cart */}
          <div className={styles.actionIcons}>
            <button
              className={styles.iconBtn}
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Search Catalog"
              title="Search"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            <Link href="/account" className={styles.iconBtn} aria-label="Customer Account" title="My Account">
              <User size={20} strokeWidth={1.5} />
            </Link>

            <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist" title="Wishlist">
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
              title="Shopping Bag"
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

        {/* Luxury Search Modal */}
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
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

            {/* Mobile Search Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              className={styles.mobileSearchTrigger}
              aria-label="Open search"
            >
              <Search size={18} className={styles.mobileSearchIcon} />
              <span className={styles.mobileSearchPlaceholder}>Search catalog...</span>
            </button>

            <nav className={styles.mobileNavLinks}>
              {isDiwali && (
                <Link
                  href="/shop?tag=festive"
                  className={`${styles.mobileNavLink} ${styles.festiveMobileLink}`}
                >
                  <span>✨ FESTIVE COLLECTION</span>
                  <ChevronRight size={16} />
                </Link>
              )}
              <Link
                href="/shop"
                className={`${styles.mobileNavLink} ${isShopAllActive ? styles.active : ''}`}
              >
                <span>SHOP ALL</span>
                <ChevronRight size={16} />
              </Link>

              {/* Collapsible Women Section */}
              <div className={styles.mobileCollapsible}>
                <button
                  type="button"
                  className={styles.mobileCollapsibleTrigger}
                  onClick={() => setMobileWomenOpen((p) => !p)}
                  aria-expanded={mobileWomenOpen}
                >
                  <span className={isWomenActive ? styles.active : ''}>WOMEN</span>
                  <ChevronDown
                    size={16}
                    style={{ transform: mobileWomenOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
                  />
                </button>
                {mobileWomenOpen && (
                  <div className={styles.mobileSubLinks}>
                    <Link href="/shop?gender=WOMEN&category=oversized-tees" className={styles.mobileSubLink}>
                      Oversized Tees
                    </Link>
                    <Link href="/shop?gender=WOMEN&category=hoodies" className={styles.mobileSubLink}>
                      Heavyweight Hoodies
                    </Link>
                    <Link href="/shop?gender=WOMEN&category=bottoms" className={styles.mobileSubLink}>
                      Trousers & Bottoms
                    </Link>
                    <Link href="/shop?gender=WOMEN" className={styles.mobileSubLinkBold}>
                      All Women&apos;s Pieces →
                    </Link>
                  </div>
                )}
              </div>

              {/* Collapsible Men Section */}
              <div className={styles.mobileCollapsible}>
                <button
                  type="button"
                  className={styles.mobileCollapsibleTrigger}
                  onClick={() => setMobileMenOpen((p) => !p)}
                  aria-expanded={mobileMenOpen}
                >
                  <span className={isMenActive ? styles.active : ''}>MEN</span>
                  <ChevronDown
                    size={16}
                    style={{ transform: mobileMenOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
                  />
                </button>
                {mobileMenOpen && (
                  <div className={styles.mobileSubLinks}>
                    <Link href="/shop?gender=MEN&category=hoodies" className={styles.mobileSubLink}>
                      Boxy Hoodies
                    </Link>
                    <Link href="/shop?gender=MEN&category=oversized-tees" className={styles.mobileSubLink}>
                      Heavyweight Tees
                    </Link>
                    <Link href="/shop?gender=MEN&category=bottoms" className={styles.mobileSubLink}>
                      Wide-Leg Trousers
                    </Link>
                    <Link href="/shop?gender=MEN&category=shirts" className={styles.mobileSubLink}>
                      Resort Shirts
                    </Link>
                    <Link href="/shop?gender=MEN" className={styles.mobileSubLinkBold}>
                      All Men&apos;s Pieces →
                    </Link>
                  </div>
                )}
              </div>

              {/* Collapsible Accessories Section */}
              <div className={styles.mobileCollapsible}>
                <button
                  type="button"
                  className={styles.mobileCollapsibleTrigger}
                  onClick={() => setMobileAccessoriesOpen((p) => !p)}
                  aria-expanded={mobileAccessoriesOpen}
                >
                  <span className={isAccessoriesActive ? styles.active : ''}>ACCESSORIES</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: mobileAccessoriesOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 200ms',
                    }}
                  />
                </button>
                {mobileAccessoriesOpen && (
                  <div className={styles.mobileSubLinks}>
                    <Link href="/accessories" className={styles.mobileSubLinkBold}>
                      All Accessories →
                    </Link>
                    <Link href="/accessories?category=hairbands" className={styles.mobileSubLink}>
                      Handmade Hairbands
                    </Link>
                    <Link href="/accessories?category=hair-clips" className={styles.mobileSubLink}>
                      Floral & Minimal Hair Clips
                    </Link>
                    <Link href="/accessories?category=claw-clips" className={styles.mobileSubLink}>
                      Sculpted Claw Clips
                    </Link>
                    <Link href="/accessories?category=keychains" className={styles.mobileSubLink}>
                      Handmade Keychains
                    </Link>
                    <Link href="/accessories?category=bag-charms" className={styles.mobileSubLink}>
                      Everyday Bag Charms
                    </Link>
                    <Link href="/accessories?category=matching-sets" className={styles.mobileSubLink}>
                      Matching Sets
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/collections/aveez-originals"
                className={`${styles.mobileNavLink} ${styles.originalsLink} ${
                  isOriginalsActive ? styles.active : ''
                }`}
              >
                <span>AVEEZ ORIGINALS</span>
                <ChevronRight size={16} />
              </Link>

              <Link
                href="/shop"
                className={`${styles.mobileNavLink} ${isShopAllActive ? styles.active : ''}`}
              >
                <span>SHOP ALL</span>
                <ChevronRight size={16} />
              </Link>

              <Link
                href="/shop?filter=sale"
                className={`${styles.mobileNavLink} ${styles.saleLink} ${
                  isSaleActive ? styles.active : ''
                }`}
              >
                <span>SALE</span>
                <ChevronRight size={16} />
              </Link>
            </nav>

            <div className={styles.mobileFooter}>
              <Link href="/account" className={styles.mobileFooterLink}>
                ACCOUNT
              </Link>
              <Link href="/wishlist" className={styles.mobileFooterLink}>
                WISHLIST {totalWishlist > 0 ? `(${totalWishlist})` : ''}
              </Link>
              <Link href="/track-order" className={styles.mobileFooterLink}>
                TRACK ORDER
              </Link>
              <Link href="/contact" className={styles.mobileFooterLink}>
                CUSTOMER SUPPORT
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export const Navbar: React.FC<NavbarProps> = ({ isDiwali }) => {
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
              {isDiwali && <span className={`${styles.navLink} ${styles.festiveLink}`}>FESTIVE COLLECTION</span>}
              <span className={styles.navLink}>SHOP</span>
              <span className={styles.navLink}>WOMEN</span>
              <span className={styles.navLink}>MEN</span>
              <span className={styles.navLink}>ACCESSORIES</span>
              <span className={`${styles.navLink} ${styles.originalsLink}`}>AVEEZ ORIGINALS</span>
              <span className={`${styles.navLink} ${styles.saleLink}`}>SALE</span>
            </nav>
            <div className={styles.actionIcons} />
          </div>
        </header>
      }
    >
      <NavbarContent isDiwali={isDiwali} />
    </Suspense>
  );
};
