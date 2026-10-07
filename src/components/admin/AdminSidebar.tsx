'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  Sparkles,
  ShoppingBag,
  Users,
  Boxes,
  Ticket,
  Star,
  Mail,
  Settings,
  ArrowUpRight,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import styles from './AdminSidebar.module.css';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { label: 'DASHBOARD', href: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'PRODUCTS', href: '/admin/products', icon: <Shirt size={18} /> },
    { label: 'CATEGORIES', href: '/admin/categories', icon: <FolderTree size={18} /> },
    { label: 'COLLECTIONS', href: '/admin/collections', icon: <Sparkles size={18} /> },
    { label: 'ORDERS', href: '/admin/orders', icon: <ShoppingBag size={18} /> },
    { label: 'CUSTOMERS', href: '/admin/customers', icon: <Users size={18} /> },
    { label: 'INVENTORY', href: '/admin/inventory', icon: <Boxes size={18} /> },
    { label: 'COUPONS', href: '/admin/coupons', icon: <Ticket size={18} /> },
    { label: 'REVIEWS', href: '/admin/reviews', icon: <Star size={18} /> },
    { label: 'NEWSLETTER', href: '/admin/newsletter', icon: <Mail size={18} /> },
    { label: 'SETTINGS', href: '/admin/settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className={styles.sidebar} aria-label="Administrative Cockpit Navigation">
      <div className={styles.brandRow}>
        <Logo variant="monogram" height={32} />
        <div className={styles.brandTitle}>
          <span className={styles.brandName}>AVEEZ</span>
          <span className={styles.portalTag}>OPERATIONS COCKPIT</span>
        </div>
      </div>

      <nav className={styles.navList}>
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navItem} ${isActive ? styles.activeItem : ''}`}
            >
              <span className={styles.icon}>{link.icon}</span>
              <span className={styles.label}>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footerLink}>
        <Link href="/" target="_blank" className={styles.storefrontLink}>
          <span>VIEW STOREFRONT</span>
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </aside>
  );
};
