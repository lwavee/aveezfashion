'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './DesktopNavigation.module.css';

export interface NavItem {
  label: string;
  href: string;
  highlight?: boolean;
}

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: 'NEW ARRIVALS', href: '/shop?filter=new' },
  { label: 'WOMEN', href: '/shop?category=women' },
  { label: 'MEN', href: '/shop?category=men' },
  { label: 'ACCESSORIES', href: '/accessories' },
  { label: 'AVEEZ ORIGINALS', href: '/collections/aveez-originals', highlight: true },
  { label: 'SHOP ALL', href: '/shop' },
  { label: 'SALE', href: '/shop?filter=sale' },
];

export interface DesktopNavigationProps {
  items?: NavItem[];
  className?: string;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  items = DEFAULT_NAV_ITEMS,
  className = '',
}) => {
  const pathname = usePathname();

  return (
    <nav className={`${styles.nav} ${className}`} aria-label="Main Navigation">
      <ul className={styles.navList}>
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && Boolean(pathname?.startsWith(item.href)));

          return (
            <li key={item.label} className={styles.navItem}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ''} ${
                  item.highlight ? styles.highlight : ''
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
