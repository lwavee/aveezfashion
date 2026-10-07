import React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import styles from './adminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.adminContainer}>
      <AdminSidebar />
      <div className={styles.adminMain}>
        <header className={styles.topBar}>
          <div className={styles.breadcrumb}>
            <span>OPERATIONS</span> / <strong>MANAGEMENT CONSOLE</strong>
          </div>
          <div className={styles.adminBadge}>
            <span className={styles.liveIndicator} />
            <span>SUPER ADMIN</span>
          </div>
        </header>
        <div className={styles.contentArea}>{children}</div>
      </div>
    </div>
  );
}
