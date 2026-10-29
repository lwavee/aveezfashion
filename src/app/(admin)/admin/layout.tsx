'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Menu,
  ArrowUpRight,
  LogOut,
  Shield,
  Activity,
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import styles from './adminLayout.module.css';

// Dynamic breadcrumb mapping
const ROUTE_TITLES: Record<string, { title: string; section: string }> = {
  '/admin': { title: 'Dashboard', section: 'Overview' },
  '/admin/products': { title: 'Products', section: 'Catalog' },
  '/admin/products/new': { title: 'Add Product', section: 'Catalog' },
  '/admin/categories': { title: 'Categories', section: 'Catalog' },
  '/admin/collections': { title: 'Collections', section: 'Catalog' },
  '/admin/orders': { title: 'Orders', section: 'Operations' },
  '/admin/returns': { title: 'Returns & Exchanges', section: 'Operations' },
  '/admin/customers': { title: 'Customers', section: 'Directory' },
  '/admin/support': { title: 'Support & Inquiries', section: 'Operations' },
  '/admin/inventory': { title: 'Inventory Management', section: 'Operations' },
  '/admin/coupons': { title: 'Coupons & Promotions', section: 'Marketing' },
  '/admin/content': { title: 'Homepage Content', section: 'Storefront' },
  '/admin/ai-studio': { title: 'AI Studio', section: 'Campaigns' },
  '/admin/settings': { title: 'Settings', section: 'System' },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // If on admin login page, render clean login view without dashboard sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const currentRouteMeta = (pathname && ROUTE_TITLES[pathname]) || {
    title: (pathname || '').split('/').pop()?.toUpperCase() || 'CONSOLE',
    section: 'Admin',
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className={styles.adminContainer}>
      {/* Dedicated Admin Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className={styles.adminMain}>
        {/* Compact Admin Topbar */}
        <header className={styles.topBar} role="banner">
          <div className={styles.topBarLeft}>
            {/* Mobile / Desktop Toggle Button */}
            <button
              type="button"
              className={styles.sidebarToggle}
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb / Current Page Title */}
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <span className={styles.breadcrumbSection}>{currentRouteMeta.section}</span>
              <span className={styles.breadcrumbDivider}>/</span>
              <span className={styles.breadcrumbTitle}>{currentRouteMeta.title}</span>
            </nav>
          </div>

          <div className={styles.topBarRight}>
            {/* Live Operational Status */}
            <div className={styles.statusIndicator} title="Connected to MongoDB Atlas">
              <span className={styles.statusDot} />
              <span className={styles.statusLabel}>Store Online</span>
            </div>

            {/* View Customer Storefront Action */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.viewStorefrontBtn}
              title="Open public storefront in a new tab"
            >
              <span>Storefront</span>
              <ArrowUpRight size={14} />
            </Link>

            {/* Admin User Profile Capsule */}
            <div className={styles.adminPill}>
              <div className={styles.avatarMini}>SA</div>
              <div className={styles.adminDetails}>
                <span className={styles.adminName}>Sarla Devi</span>
                <span className={styles.adminRole}>SUPER ADMIN</span>
              </div>
            </div>

            {/* Topbar Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              className={styles.topbarLogoutBtn}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Dashboard / Subpage Content */}
        <main className={styles.contentArea} id="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
