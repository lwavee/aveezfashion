'use client';

import React, { useEffect, useRef } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { IconClose, IconArrowRight, IconHeart, IconAccount, IconBag } from '@/components/ui/Icons';
import styles from './MobileNavigation.module.css';

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount?: number;
  wishlistCount?: number;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  cartCount = 0,
  wishlistCount = 0,
}) => {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Mobile Navigation">
      <div
        ref={menuRef}
        className={styles.menuPanel}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <Logo variant="monogram" height={28} />
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            <IconClose size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <div className={styles.navSection}>
          <ul className={styles.navList}>
            <li>
              <NextLink href="/shop?filter=new" className={styles.navLink}>
                <span>NEW ARRIVALS</span>
                <IconArrowRight size={16} />
              </NextLink>
            </li>
            <li>
              <NextLink href="/shop?category=women" className={styles.navLink}>
                <span>WOMEN</span>
                <IconArrowRight size={16} />
              </NextLink>
            </li>
            <li>
              <NextLink href="/shop?category=men" className={styles.navLink}>
                <span>MEN</span>
                <IconArrowRight size={16} />
              </NextLink>
            </li>
            <li>
              <NextLink href="/accessories" className={styles.navLink}>
                <span>ACCESSORIES</span>
                <IconArrowRight size={16} />
              </NextLink>
            </li>
            <li className={styles.highlightItem}>
              <NextLink href="/collections/aveez-originals" className={styles.navLink}>
                <span>AVEEZ ORIGINALS</span>
                <span className={styles.labelTag}>EXCLUSIVE</span>
              </NextLink>
            </li>
            <li>
              <NextLink href="/shop?filter=sale" className={styles.navLink}>
                <span>SALE</span>
                <span className={styles.saleTag}>OFFER</span>
              </NextLink>
            </li>
          </ul>
        </div>

        {/* User Utility Links */}
        <div className={styles.utilitySection}>
          <NextLink href="/account" className={styles.utilityLink}>
            <IconAccount size={18} />
            <span>MY ACCOUNT</span>
          </NextLink>
          <NextLink href="/wishlist" className={styles.utilityLink}>
            <IconHeart size={18} />
            <span>WISHLIST</span>
            {wishlistCount > 0 && <span className={styles.countPill}>{wishlistCount}</span>}
          </NextLink>
          <NextLink href="/cart" className={styles.utilityLink}>
            <IconBag size={18} />
            <span>SHOPPING BAG</span>
            {cartCount > 0 && <span className={styles.countPill}>{cartCount}</span>}
          </NextLink>
        </div>

        {/* Brand Manifesto Footer */}
        <div className={styles.footer}>
          <p className={styles.manifesto}>
            AVEEZ FASHION · WEAR DIFFERENT.
          </p>
          <div className={styles.footerLinks}>
            <NextLink href="/about">About Aveez</NextLink>
            <span>·</span>
            <NextLink href="/contact">Client Support</NextLink>
            <span>·</span>
            <NextLink href="/faq">FAQ</NextLink>
          </div>
        </div>
      </div>
    </div>
  );
};
