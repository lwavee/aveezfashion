'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  Layers,
  ShoppingBag,
  RotateCcw,
  Users,
  HelpCircle,
  Boxes,
  Tag,
  SlidersHorizontal,
  Settings,
  ArrowUpRight,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import styles from './AdminSidebar.module.css';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={17} /> },
  { label: 'Products', href: '/admin/products', icon: <Shirt size={17} /> },
  { label: 'Categories', href: '/admin/categories', icon: <FolderTree size={17} /> },
  { label: 'Collections', href: '/admin/collections', icon: <Layers size={17} /> },
  { label: 'Orders', href: '/admin/orders', icon: <ShoppingBag size={17} /> },
  { label: 'Returns', href: '/admin/returns', icon: <RotateCcw size={17} /> },
  { label: 'Customers', href: '/admin/customers', icon: <Users size={17} /> },
  { label: 'Support', href: '/admin/support', icon: <HelpCircle size={17} /> },
  { label: 'Inventory', href: '/admin/inventory', icon: <Boxes size={17} /> },
  { label: 'Coupons', href: '/admin/coupons', icon: <Tag size={17} /> },
  { label: 'Homepage Content', href: '/admin/content', icon: <SlidersHorizontal size={17} /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings size={17} /> },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/admin/login');
    router.refresh();
  };

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''} ${
          isMobileOpen ? styles.mobileDrawerOpen : ''
        }`}
        aria-label="Admin Navigation Sidebar"
      >
        {/* Brand Header */}
        <div className={styles.brandArea}>
          <div className={styles.brandRow}>
            <Logo variant="monogram" height={28} />
            <div className={styles.brandText}>
              <span className={styles.brandName}>AVEEZ ADMIN</span>
              <span className={styles.brandSub}>STORE MANAGEMENT</span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            className={styles.mobileCloseBtn}
            onClick={onCloseMobile}
            aria-label="Close sidebar menu"
          >
            <X size={18} />
          </button>

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              type="button"
              className={styles.collapseToggleBtn}
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav className={styles.navSection} aria-label="Main Administration Menu">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href} className={styles.navLi}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                    {item.badge && <span className={styles.badge}>{item.badge}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Utility Controls */}
        <div className={styles.footerArea}>
          {/* View Storefront Link */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.storefrontLink}
            title="Open customer storefront in a new tab"
          >
            <span className={styles.navIcon}>
              <ArrowUpRight size={16} />
            </span>
            <span className={styles.storefrontLabel}>View Storefront</span>
          </Link>

          {/* Admin User Summary & Logout */}
          <div className={styles.userSection}>
            <div className={styles.userAvatar} title="Super Administrator">
              <span>SA</span>
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Administrator</span>
              <span className={styles.userEmail}>sarla@aveezfashion.com</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className={styles.logoutBtn}
              title="Sign Out of Administration"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
